import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { EdgeTTS } from "node-edge-tts";

const execFileAsync = promisify(execFile);

export const VOICE_HOAI_MY = "vi-VN-HoaiMyNeural";
export const VOICE_NAM_MINH = "vi-VN-NamMinhNeural";

/**
 * Resolves the appropriate Edge TTS voice based on speaker name:
 * - Bé Áo Vàng / Bé Vàng / Nữ -> vi-VN-HoaiMyNeural ("hoai-my")
 * - Bé Áo Đỏ / Bé Đỏ / Nam -> vi-VN-NamMinhNeural ("nam-minh")
 * - Voice-over / Dẫn chuyện -> fallback or default
 */
export function getVoiceForSpeaker(speaker?: string, fallbackVoice: string = VOICE_HOAI_MY): string {
  if (!speaker) return fallbackVoice;
  const s = speaker.toLowerCase().trim();

  // Explicit voice name passed
  if (s === "vi-vn-hoaimyneural" || s === "hoai-my" || s === "hoaimy") {
    return VOICE_HOAI_MY;
  }
  if (s === "vi-vn-namminhneural" || s === "nam-minh" || s === "namminh") {
    return VOICE_NAM_MINH;
  }

  // Bé Vàng / Bé Áo Vàng / Hoài My
  if (
    s.includes("vàng") ||
    s.includes("vang") ||
    s.includes("hoài my") ||
    s.includes("hoaimy") ||
    s.includes("hoai-my") ||
    s.includes("yellow")
  ) {
    return VOICE_HOAI_MY;
  }

  // Bé Đỏ / Bé Áo Đỏ / Nam Minh
  if (
    s.includes("đỏ") ||
    s.includes("do") ||
    s.includes("nam minh") ||
    s.includes("namminh") ||
    s.includes("nam-minh") ||
    s.includes("red")
  ) {
    return VOICE_NAM_MINH;
  }

  // Male / Female hints
  if (s.includes("nam") || s.includes("male") || s.includes("boy")) {
    return VOICE_NAM_MINH;
  }
  if (s.includes("nữ") || s.includes("nu") || s.includes("female") || s.includes("girl")) {
    return VOICE_HOAI_MY;
  }

  // Voice-over / Dẫn chuyện
  if (
    s.includes("voice-over") ||
    s.includes("voiceover") ||
    s.includes("dẫn chuyện") ||
    s.includes("thuyết minh") ||
    s.includes("narrator")
  ) {
    return fallbackVoice || VOICE_HOAI_MY;
  }

  return fallbackVoice;
}

export interface ComposeOptions {
  script: any;
  clips: Record<number, string>; // sceneNumber -> video URL or local path
  ttsConfig?: {
    voice?: "vi-VN-HoaiMyNeural" | "vi-VN-NamMinhNeural" | "dialogue_duo" | string;
    forceSingleVoice?: boolean;
    autoSubtitles?: boolean;
    backgroundMusicUrl?: string;
  };
  jobId?: string;
  onProgress?: (percent: number, stage: string, detail?: string) => void;
}

function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

async function getVideoDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const duration = parseFloat(stdout.trim());
    return isNaN(duration) ? 5 : duration;
  } catch {
    return 5;
  }
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  if (url.startsWith("/")) {
    // Local path in public or current dir
    const local = path.join(process.cwd(), url.startsWith("/outputs") ? `public${url}` : url);
    if (fs.existsSync(local)) {
      fs.copyFileSync(local, destPath);
      return;
    }
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

export async function composeVideo({
  script,
  clips,
  ttsConfig = {},
  jobId,
  onProgress,
}: ComposeOptions): Promise<string> {
  const outputsDir = path.join(process.cwd(), "public", "outputs");
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  const workDir = path.join("/tmp", `compose_${jobId || Date.now()}`);
  fs.mkdirSync(workDir, { recursive: true });

  try {
    onProgress?.(2, "Bắt đầu tải các phân cảnh video...", "Chuẩn bị môi trường làm việc");

    const scenes: any[] = script.scenes || [];
    if (scenes.length === 0) {
      throw new Error("Kịch bản không có phân cảnh nào để dựng video.");
    }

    const voiceChoice = ttsConfig.voice || "vi-VN-HoaiMyNeural";
    const forceSingleVoice = Boolean(ttsConfig.forceSingleVoice);
    const autoSubtitles = ttsConfig.autoSubtitles !== false;
    const processedSceneVideos: { sceneNumber: number; videoPath: string; duration: number; text: string }[] = [];

    let currentTimelineSeconds = 0;
    const srtEntries: { index: number; start: number; end: number; text: string }[] = [];

    // Process each scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneNum = scene.sceneNumber;
      const clipUrl = clips[sceneNum];

      const stepPercent = Math.round(5 + (i / scenes.length) * 45);
      onProgress?.(stepPercent, `Đang xử lý cảnh #${sceneNum} (${scene.phase})...`, `Tải clip và tạo giọng lồng tiếng Edge TTS`);

      const rawClipPath = path.join(workDir, `scene_${sceneNum}_raw.mp4`);
      const normClipPath = path.join(workDir, `scene_${sceneNum}_norm.mp4`);
      const voicePath = path.join(workDir, `scene_${sceneNum}_voice.mp3`);
      const sceneFinalPath = path.join(workDir, `scene_${sceneNum}_final.mp4`);

      // 1. Download or synthesize clip
      if (clipUrl) {
        await downloadFile(clipUrl, rawClipPath);
      } else {
        // Fallback: Generate a 5s placeholder clip with solid background and title
        await execFileAsync("ffmpeg", [
          "-y",
          "-f", "lavfi",
          "-i", `color=c=0x1e1b4b:s=720x1280:d=5:r=30`,
          "-vf", `drawtext=text='Canh ${sceneNum}\\: ${scene.phase}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2`,
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          rawClipPath,
        ]);
      }

      // 2. Normalize to 720x1280 @ 30fps H264
      await execFileAsync("ffmpeg", [
        "-y",
        "-i", rawClipPath,
        "-vf", "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-an",
        normClipPath,
      ]);

      const initialClipDuration = await getVideoDuration(normClipPath);

      // 3. Generate Edge TTS for scene dialogue based on speaker
      // Supports per-scene and per-line speaker: Bé Vàng -> Hoài My, Bé Đỏ -> Nam Minh
      let dialogues: { speaker?: string; line: string }[] = [];
      if (Array.isArray(scene.dialogue)) {
        dialogues = scene.dialogue;
      } else if (Array.isArray((scene as any).dialogues)) {
        dialogues = (scene as any).dialogues;
      } else if (typeof scene.dialogue === "string" && (scene.dialogue as string).trim()) {
        dialogues = [{ speaker: scene.speaker, line: (scene.dialogue as string).trim() }];
      }

      // Check scene-level speaker fallback
      const sceneSpeaker = scene.speaker || (dialogues.length > 0 ? dialogues[0].speaker : undefined);

      // Collect all non-empty dialogue lines
      const speechLines: { speaker: string; text: string }[] = [];
      for (const d of dialogues) {
        const text = (d.line || "").trim();
        if (text) {
          speechLines.push({
            speaker: d.speaker || sceneSpeaker || "",
            text,
          });
        }
      }

      // Fallback text if no dialogue lines found
      if (speechLines.length === 0) {
        const fallbackText = (scene.visual || `Cảnh ${sceneNum}`).trim();
        speechLines.push({
          speaker: sceneSpeaker || "",
          text: fallbackText,
        });
      }

      const combinedDialogue = speechLines.map((l) => l.text).join(" ");
      const speechText = combinedDialogue;

      try {
        if (!forceSingleVoice && speechLines.length > 1) {
          // Multiple dialogue lines in the same scene:
          // Generate individual audio for each line with its specific speaker's voice
          // (Bé Vàng: hoai-my, Bé Đỏ: nam-minh) and concatenate seamlessly.
          const lineAudioPaths: string[] = [];
          for (let dIdx = 0; dIdx < speechLines.length; dIdx++) {
            const lineItem = speechLines[dIdx];
            const lineVoice = getVoiceForSpeaker(lineItem.speaker, voiceChoice);
            const linePath = path.join(workDir, `scene_${sceneNum}_line_${dIdx}.mp3`);

            console.log(`[EdgeTTS] Cảnh ${sceneNum} - Lời thoại ${dIdx + 1} [${lineItem.speaker || "Mặc định"}]: giọng ${lineVoice}`);
            const ttsInstance = new EdgeTTS({ voice: lineVoice, lang: "vi-VN" });
            await ttsInstance.ttsPromise(lineItem.text, linePath);
            lineAudioPaths.push(linePath);
          }

          // Concat line audios with ffmpeg
          const listPath = path.join(workDir, `audio_list_${sceneNum}.txt`);
          fs.writeFileSync(listPath, lineAudioPaths.map((p) => `file '${p}'`).join("\n"));
          await execFileAsync("ffmpeg", [
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", listPath,
            "-c", "copy",
            voicePath,
          ]);
        } else {
          // Single dialogue line or scene-level voice:
          // Choose voice based on speaker (Bé Vàng: hoai-my, Bé Đỏ: nam-minh)
          const targetSpeaker = speechLines[0]?.speaker || sceneSpeaker;
          const activeVoice = forceSingleVoice
            ? (voiceChoice === "dialogue_duo" ? VOICE_HOAI_MY : voiceChoice)
            : getVoiceForSpeaker(targetSpeaker, voiceChoice);

          console.log(`[EdgeTTS] Cảnh ${sceneNum} [${targetSpeaker || "Mặc định"}]: giọng ${activeVoice}`);
          const ttsInstance = new EdgeTTS({ voice: activeVoice, lang: "vi-VN" });
          await ttsInstance.ttsPromise(speechText, voicePath);
        }
      } catch (ttsErr) {
        console.warn(`TTS fallback for scene ${sceneNum}:`, ttsErr);
        // Create 2s silent audio if TTS fails
        await execFileAsync("ffmpeg", [
          "-y",
          "-f", "lavfi",
          "-i", "anullsrc=r=44100:cl=stereo",
          "-t", "2",
          voicePath,
        ]);
      }

      // Measure audio duration
      const audioDuration = await getVideoDuration(voicePath);

      // 4. If voice is longer than clip: hold last-frame using tpad
      let sceneVideoForMux = normClipPath;
      if (audioDuration > initialClipDuration) {
        const diffSeconds = Math.ceil((audioDuration - initialClipDuration + 0.3) * 10) / 10;
        const extendedClipPath = path.join(workDir, `scene_${sceneNum}_extended.mp4`);
        await execFileAsync("ffmpeg", [
          "-y",
          "-i", normClipPath,
          "-vf", `tpad=stop_mode=clone:stop_duration=${diffSeconds}`,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-pix_fmt", "yuv420p",
          extendedClipPath,
        ]);
        sceneVideoForMux = extendedClipPath;
      }

      // 5. Mux video with voiceover
      await execFileAsync("ffmpeg", [
        "-y",
        "-i", sceneVideoForMux,
        "-i", voicePath,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        sceneFinalPath,
      ]);

      const finalSceneDuration = await getVideoDuration(sceneFinalPath);

      // Track subtitle timing
      if (autoSubtitles) {
        const startSec = currentTimelineSeconds;
        const endSec = startSec + finalSceneDuration;
        srtEntries.push({
          index: srtEntries.length + 1,
          start: startSec,
          end: endSec,
          text: combinedDialogue || speechText,
        });
        currentTimelineSeconds = endSec;
      }

      processedSceneVideos.push({
        sceneNumber: sceneNum,
        videoPath: sceneFinalPath,
        duration: finalSceneDuration,
        text: speechText,
      });
    }

    onProgress?.(55, "Đang ghép nối tất cả các phân cảnh...", "Tạo video liền mạch 9:16");

    // 6. Concatenate all scenes into master raw video
    const concatListPath = path.join(workDir, "concat_list.txt");
    fs.writeFileSync(
      concatListPath,
      processedSceneVideos.map((s) => `file '${s.videoPath}'`).join("\n")
    );

    const mergedRawPath = path.join(workDir, "merged_raw.mp4");
    await execFileAsync("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", concatListPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "22",
      "-c:a", "aac",
      "-b:a", "192k",
      mergedRawPath,
    ]);

    // 7. Generate SRT subtitles
    let currentMasterVideo = mergedRawPath;
    if (autoSubtitles && srtEntries.length > 0) {
      onProgress?.(75, "Đang tạo và gắn phụ đề TikTok...", "Font chữ nổi bật, viền đen tương phản cao");
      const srtPath = path.join(workDir, "subtitles.srt");
      const srtContent = srtEntries
        .map(
          (entry) =>
            `${entry.index}\n${formatSrtTime(entry.start)} --> ${formatSrtTime(entry.end)}\n${entry.text}\n`
        )
        .join("\n");

      fs.writeFileSync(srtPath, srtContent, "utf8");

      const subtitledPath = path.join(workDir, "with_subtitles.mp4");
      // Use subtitles filter with stylish TikTok styling
      try {
        await execFileAsync("ffmpeg", [
          "-y",
          "-i", mergedRawPath,
          "-vf", `subtitles=${srtPath}:force_style='FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2.5,Shadow=1,Alignment=2,MarginV=65'`,
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "22",
          "-c:a", "copy",
          subtitledPath,
        ]);
        currentMasterVideo = subtitledPath;
      } catch (subErr) {
        console.warn("Subtitles burn warning, continuing with raw:", subErr);
      }
    }

    // 8. Background music (if provided)
    if (ttsConfig.backgroundMusicUrl) {
      onProgress?.(88, "Đang trộn nhạc nền nhẹ nhàng...", "Hòa quyện âm lượng voice-over");
      try {
        const bgPath = path.join(workDir, "bg_music.mp3");
        await downloadFile(ttsConfig.backgroundMusicUrl, bgPath);

        const withMusicPath = path.join(workDir, "with_music.mp4");
        await execFileAsync("ffmpeg", [
          "-y",
          "-i", currentMasterVideo,
          "-stream_loop", "-1",
          "-i", bgPath,
          "-filter_complex",
          "[0:a][1:a]amix=inputs=2:weights=1.0 0.15:dropout_transition=2[aout]",
          "-map", "0:v:0",
          "-map", "[aout]",
          "-c:v", "copy",
          "-c:a", "aac",
          "-b:a", "192k",
          "-shortest",
          withMusicPath,
        ]);
        currentMasterVideo = withMusicPath;
      } catch (bgErr) {
        console.warn("Background music mixing warning:", bgErr);
      }
    }

    // 9. Copy to public outputs
    onProgress?.(95, "Đang xuất file video thành phẩm MP4...", "Tối ưu hóa sẵn sàng đăng TikTok / Shorts");
    const scriptSlug = (script.title || "video")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 30);
    const outputFilename = `${scriptSlug}_${Date.now()}.mp4`;
    const finalOutputPath = path.join(outputsDir, outputFilename);

    fs.copyFileSync(currentMasterVideo, finalOutputPath);

    onProgress?.(100, "Hoàn tất dựng video!", "Video đã sẵn sàng xem và tải về!");
    return `/outputs/${outputFilename}`;
  } finally {
    // 6.1: Clean up temporary directory to avoid "No space left on device"
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (cleanErr) {
      console.warn("Clean workdir warning:", cleanErr);
    }
  }
}
