import React, { useState, useEffect, useRef } from "react";
import { TechScript, AIStudioConfig, PipelineCheckpoint } from "../types";
import {
  Camera,
  Music,
  Copy,
  Check,
  Sparkles,
  Megaphone,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  ExternalLink,
  Settings,
  X,
  Info,
  Play,
  Download,
  Film,
  RotateCcw,
  AlertCircle,
  Clock,
  Mic,
  Subtitles,
  Zap,
} from "lucide-react";
import { STORAGE_KEY_MULTI, DEFAULT_CONFIG } from "./LLMSettingsModal";

interface StoryboardViewProps {
  script: TechScript;
  onOpenSettings?: (tab?: "script" | "image" | "video") => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  script,
  onOpenSettings,
}) => {
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [collapsedScenes, setCollapsedScenes] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));

  // Checkpoint & Persistence per script
  const checkpointKey = `scriptai_pipeline_checkpoint_${script.id}`;
  const [sceneImages, setSceneImages] = useState<Record<number, string>>({});
  const [sceneClips, setSceneClips] = useState<Record<number, string>>({});
  const [sceneErrors, setSceneErrors] = useState<Record<number, string>>({});
  const [composedVideoUrl, setComposedVideoUrl] = useState<string | null>(null);

  // Auto-pipeline running state
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<{
    percent: number;
    stage: string;
    detail?: string;
  }>({
    percent: 0,
    stage: "",
    detail: "",
  });

  // Action Notice for single scene actions
  const [actionNotice, setActionNotice] = useState<{
    sceneNumber?: number;
    type: "image" | "video" | "compose";
    title: string;
    message: string;
    directUrl?: string;
  } | null>(null);

  const [generatingImageScene, setGeneratingImageScene] = useState<number | null>(null);
  const [generatingVideoScene, setGeneratingVideoScene] = useState<number | null>(null);

  const pollTimerRef = useRef<any>(null);

  // Load checkpoint from localStorage on script change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(checkpointKey);
      if (saved) {
        const cp: PipelineCheckpoint = JSON.parse(saved);
        setSceneImages(cp.images || {});
        setSceneClips(cp.clips || {});
        if (cp.composedVideoUrl) {
          setComposedVideoUrl(cp.composedVideoUrl);
        }
      } else {
        setSceneImages({});
        setSceneClips({});
        setComposedVideoUrl(null);
      }
      setSceneErrors({});
      setCurrentProgress({ percent: 0, stage: "", detail: "" });
    } catch (e) {
      console.warn("Error loading checkpoint:", e);
    }
  }, [script.id]);

  // Save checkpoint helper
  const saveCheckpoint = (
    newImages: Record<number, string>,
    newClips: Record<number, string>,
    videoUrl?: string
  ) => {
    try {
      const cp: PipelineCheckpoint = {
        scriptId: script.id,
        images: newImages,
        clips: newClips,
        lastUpdated: Date.now(),
        composedVideoUrl: videoUrl || composedVideoUrl || undefined,
      };
      localStorage.setItem(checkpointKey, JSON.stringify(cp));
    } catch (err) {
      console.warn("Checkpoint save error:", err);
    }
  };

  const getActiveConfig = (): AIStudioConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MULTI);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CONFIG;
  };

  // Poll progress helper
  const startProgressPolling = (jobId: string) => {
    setActiveJobId(jobId);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentProgress({
            percent: data.percent ?? 0,
            stage: data.stage ?? "",
            detail: data.detail || "",
          });
          if (data.completed || data.error) {
            clearInterval(pollTimerRef.current);
          }
        }
      } catch (err) {
        console.warn("Progress poll failed:", err);
      }
    }, 1800);
  };

  const stopProgressPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopProgressPolling();
    };
  }, []);

  const toggleCollapse = (sceneNum: number) => {
    setCollapsedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(sceneNum)) {
        next.delete(sceneNum);
      } else {
        next.add(sceneNum);
      }
      return next;
    });
  };

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIndex(idx);
    setTimeout(() => {
      setCopiedPromptIndex(null);
    }, 2000);
  };

  // Trigger single Text-to-Image
  const handleGenerateImage = async (prompt: string, sceneNumber: number): Promise<string | null> => {
    setGeneratingImageScene(sceneNumber);
    setActionNotice(null);
    try {
      const config = getActiveConfig();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageConfig: config.textToImage,
          sceneNumber,
          characterA: script.characters?.[0],
          characterB: script.characters?.[1],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo ảnh cho cảnh này");
      }

      if (data.imageUrl) {
        const nextImages = { ...sceneImages, [sceneNumber]: data.imageUrl };
        setSceneImages(nextImages);
        saveCheckpoint(nextImages, sceneClips);
        setActionNotice({
          sceneNumber,
          type: "image",
          title: "Đã tạo ảnh thành công!",
          message: `Ảnh cho cảnh #${sceneNumber} đã sẵn sàng làm mốc video.`,
        });
        return data.imageUrl;
      } else {
        setActionNotice({
          sceneNumber,
          type: "image",
          title: "Prompt đã chuẩn hóa",
          message: data.message || "Hãy cấu hình API Key Agnes hoặc DALL-E trong cài đặt để sinh ảnh trực tiếp.",
        });
        return null;
      }
    } catch (err: any) {
      setSceneErrors((prev) => ({ ...prev, [sceneNumber]: err.message }));
      setActionNotice({
        sceneNumber,
        type: "image",
        title: "Lỗi tạo ảnh",
        message: err.message,
      });
      return null;
    } finally {
      setGeneratingImageScene(null);
    }
  };

  // Trigger single Video Generation
  const handleGenerateVideo = async (
    prompt: string,
    sceneNumber: number,
    startImg?: string
  ): Promise<string | null> => {
    setGeneratingVideoScene(sceneNumber);
    setActionNotice(null);
    const jobId = `video_scene_${sceneNumber}_${Date.now()}`;
    startProgressPolling(jobId);

    try {
      const config = getActiveConfig();
      const durationSec =
        config.textToVideo.clipDurationMode === "fixed_10s"
          ? 10
          : config.textToVideo.clipDurationMode === "fixed_5s"
          ? 5
          : script.scenes.find((s) => s.sceneNumber === sceneNumber)?.durationSeconds || 5;

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          startImageUrl: startImg || sceneImages[sceneNumber],
          videoConfig: config.textToVideo,
          sceneNumber,
          durationSeconds: durationSec,
          jobId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo video cho cảnh này");
      }

      if (data.videoUrl) {
        const nextClips = { ...sceneClips, [sceneNumber]: data.videoUrl };
        setSceneClips(nextClips);
        saveCheckpoint(sceneImages, nextClips);
        setActionNotice({
          sceneNumber,
          type: "video",
          title: "Clip video đã sẵn sàng!",
          message: `Đã hoàn thành clip cho cảnh #${sceneNumber}.`,
        });
        return data.videoUrl;
      } else {
        setActionNotice({
          sceneNumber,
          type: "video",
          title: `Đã kết nối ${data.provider?.toUpperCase()}!`,
          message: data.message || "Bạn có thể vào cài đặt AI Models để điền API Key.",
          directUrl: data.directUrl,
        });
        return null;
      }
    } catch (err: any) {
      setSceneErrors((prev) => ({ ...prev, [sceneNumber]: err.message }));
      setActionNotice({
        sceneNumber,
        type: "video",
        title: "Lỗi tạo video",
        message: err.message,
      });
      return null;
    } finally {
      setGeneratingVideoScene(null);
      stopProgressPolling();
    }
  };

  // Compose only (FFmpeg + Edge TTS + Subtitles)
  const handleComposeOnly = async (overrideClips?: Record<number, string>) => {
    const activeClips = overrideClips || sceneClips;
    const availableCount = Object.keys(activeClips).length;
    if (availableCount === 0) {
      setActionNotice({
        type: "compose",
        title: "Chưa có clip nào",
        message: "Cần ít nhất 1 clip hoàn thành để tiến hành dựng video. Bạn có thể nhấn 'Tạo Video Tự Động'.",
      });
      return;
    }

    setIsPipelineRunning(true);
    const composeJobId = `compose_${script.id}_${Date.now()}`;
    startProgressPolling(composeJobId);

    try {
      const config = getActiveConfig();
      const res = await fetch("/api/compose-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          clips: activeClips,
          ttsConfig: {
            voice: config.textToVideo.ttsVoice || "dialogue_duo",
            autoSubtitles: config.textToVideo.autoSubtitles !== false,
            backgroundMusicUrl: config.textToVideo.backgroundMusicUrl || undefined,
          },
          jobId: composeJobId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Quá trình dựng video bằng FFmpeg gặp lỗi");
      }

      setComposedVideoUrl(data.videoUrl);
      saveCheckpoint(sceneImages, activeClips, data.videoUrl);
      setActionNotice({
        type: "compose",
        title: "🎉 Dựng video hoàn tất 100%!",
        message: "Video TikTok hoàn chỉnh với giọng lồng tiếng Edge TTS và phụ đề tự động đã sẵn sàng xem & tải về.",
      });
    } catch (err: any) {
      setActionNotice({
        type: "compose",
        title: "Lỗi dựng video",
        message: err.message || "Không thể ghép nối video.",
      });
    } finally {
      setIsPipelineRunning(false);
      stopProgressPolling();
    }
  };

  // 1-Click Auto Pipeline (Checkpoint Resume)
  const handleAutoGenerateAll = async () => {
    setIsPipelineRunning(true);
    setActionNotice(null);
    setCurrentProgress({ percent: 2, stage: "Khởi động Pipeline Tự Động...", detail: "Kiểm tra Checkpoint đã lưu" });

    const currentImages = { ...sceneImages };
    const currentClips = { ...sceneClips };

    try {
      for (const scene of script.scenes) {
        const sNum = scene.sceneNumber;
        const prompt = scene.aiPrompt || scene.visual;

        // 1. Image Checkpoint
        let imgUrl = currentImages[sNum];
        if (!imgUrl) {
          setCurrentProgress({
            percent: 5 + (sNum / script.scenes.length) * 15,
            stage: `Đang tạo ảnh mốc cảnh #${sNum}...`,
            detail: "Model Text-to-Image tạo khung hình 9:16",
          });
          imgUrl = (await handleGenerateImage(prompt, sNum)) || undefined;
          if (imgUrl) {
            currentImages[sNum] = imgUrl;
            setSceneImages({ ...currentImages });
            saveCheckpoint(currentImages, currentClips);
          } else {
            console.warn(`Bỏ qua clip cảnh #${sNum} do lỗi tạo ảnh`);
            continue;
          }
        }

        // 2. Video Clip Checkpoint
        let clipUrl = currentClips[sNum];
        if (!clipUrl) {
          setCurrentProgress({
            percent: 20 + (sNum / script.scenes.length) * 45,
            stage: `Đang sinh video chuyển động cảnh #${sNum}...`,
            detail: "Model Video render clip (có cơ chế 429 backoff)",
          });
          clipUrl = (await handleGenerateVideo(prompt, sNum, imgUrl)) || undefined;
          if (clipUrl) {
            currentClips[sNum] = clipUrl;
            setSceneClips({ ...currentClips });
            saveCheckpoint(currentImages, currentClips);
          }
        }
      }

      // 3. Compose all with Edge TTS & Subtitles
      setCurrentProgress({
        percent: 75,
        stage: "Đang dựng video hoàn chỉnh (FFmpeg + Edge TTS)...",
        detail: "Lồng tiếng, đồng bộ thời lượng & gắn phụ đề",
      });
      await handleComposeOnly(currentClips);
    } catch (err: any) {
      setActionNotice({
        type: "compose",
        title: "Pipeline tạm dừng do lỗi",
        message: err.message || "Bạn có thể kiểm tra lại cài đặt API Key và bấm chạy tiếp từ checkpoint đã lưu.",
      });
    } finally {
      setIsPipelineRunning(false);
      stopProgressPolling();
    }
  };

  const handleResetCheckpoint = () => {
    if (window.confirm("Bạn có chắc muốn xoá toàn bộ ảnh và clip đã tạo để dựng lại từ đầu?")) {
      localStorage.removeItem(checkpointKey);
      setSceneImages({});
      setSceneClips({});
      setSceneErrors({});
      setComposedVideoUrl(null);
      setActionNotice({
        type: "compose",
        title: "Đã xóa checkpoint",
        message: "Bây giờ bạn có thể render lại toàn bộ các cảnh mới.",
      });
    }
  };

  const phases = [
    "all",
    "Hook 3s",
    "Xung đột & Sự cố",
    "Xuất hiện Giải pháp",
    "Trải nghiệm & Tính năng",
    "Cú Twist & Kêu gọi hành động (CTA)",
  ];

  const filteredScenes =
    selectedPhase === "all"
      ? script.scenes
      : script.scenes.filter((s) => s.phase === selectedPhase);

  const completedClipsCount = Object.keys(sceneClips).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Info & Script Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase tracking-wider">
              {script.targetDuration} • {script.productCategory}
            </span>
            <span className="text-xs font-semibold text-slate-400">#{script.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => onOpenSettings("video")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                title="Cấu hình Agnes AI, Model Video & Lồng tiếng"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cấu hình Agnes & Models</span>
              </button>
            )}
            <div className="text-xs font-semibold text-slate-500">
              Sản phẩm: <span className="font-bold text-slate-800">{script.productName}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
          {script.title}
        </h2>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          <strong className="text-indigo-600 font-semibold">Ý tưởng cốt lõi:</strong>{" "}
          {script.storyConcept}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              🎯 Sản phẩm trọng tâm
            </span>
            <span className="text-slate-800 font-semibold text-sm">{script.productName}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              ⚡ Nỗi đau giải quyết
            </span>
            <span className="text-indigo-600 font-semibold text-sm">{script.coreBenefit}</span>
          </div>
        </div>
      </div>

      {/* 2. PANEL DỰNG VIDEO HOÀN CHỈNH (1-Click Auto Pipeline) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/60 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Pipeline Tự Động 1-Click
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Agnes AI + FFmpeg + Edge TTS
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-400" /> Dựng Video TikTok Hoàn Chỉnh
            </h3>
            <p className="text-xs text-indigo-200/80">
              Nhập kịch bản ➡️ Tạo ảnh mốc 9:16 ➡️ Render clip video ➡️ Lồng tiếng Việt & phụ đề ➡️ Tải MP4 đăng TikTok
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Nút 1-Click chính */}
            <button
              type="button"
              onClick={handleAutoGenerateAll}
              disabled={isPipelineRunning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-amber-500/25"
            >
              {isPipelineRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Đang Tự Động Tạo...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Tạo Video Tự Động</span>
                </>
              )}
            </button>

            {/* Nút phụ: Dựng lại từ clip có sẵn */}
            <button
              type="button"
              onClick={() => handleComposeOnly()}
              disabled={isPipelineRunning || completedClipsCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-white font-medium text-xs border border-indigo-700/80 transition-colors cursor-pointer disabled:opacity-40"
              title="Ghép lại video từ các clip đã hoàn thành mà không cần render lại"
            >
              <Film className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dựng lại từ clip có sẵn ({completedClipsCount}/{script.scenes.length})</span>
            </button>

            {/* Nút xoá checkpoint */}
            {(completedClipsCount > 0 || Object.keys(sceneImages).length > 0) && (
              <button
                type="button"
                onClick={handleResetCheckpoint}
                disabled={isPipelineRunning}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                title="Xoá checkpoint để render lại từ đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real Progress Bar & Current Stage */}
        {(isPipelineRunning || currentProgress.percent > 0) && (
          <div className="bg-slate-900/90 rounded-xl p-4 border border-indigo-800/80 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {currentProgress.stage || "Đang xử lý pipeline..."}
              </span>
              <span className="font-mono font-bold text-amber-400">
                {currentProgress.percent}%
              </span>
            </div>

            {/* Gradient progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${Math.max(3, Math.min(100, currentProgress.percent))}%` }}
              />
            </div>

            {currentProgress.detail && (
              <p className="text-[11px] text-slate-400 font-mono">
                {currentProgress.detail}
              </p>
            )}
          </div>
        )}

        {/* Video Player Box if Composed Video exists */}
        {composedVideoUrl && (
          <div className="pt-4 border-t border-indigo-800/60 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="w-48 aspect-[9/16] bg-black rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl relative group">
                <video
                  src={composedVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster={sceneImages[1] || undefined}
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Thành phẩm sẵn sàng 100%
                </span>
                <h4 className="text-base font-bold text-white">
                  Video TikTok Hoàn Chỉnh: {script.title}
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Video đã được ghép nối liền mạch, căn chỉnh tỷ lệ 720x1280 @ 30fps chuẩn TikTok, tự động hold khung hình khớp lời thoại Edge TTS và gắn phụ đề chữ trắng viền đen tương phản cao.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={composedVideoUrl}
                  download={`${script.title.slice(0, 20)}_tiktok.mp4`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Video MP4 Đăng TikTok</span>
                </a>

                <a
                  href={composedVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mở Tab Riêng</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Notification Box */}
      {actionNotice && (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-900 shadow-xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                <span>{actionNotice.title}</span>
                {actionNotice.sceneNumber && (
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-200/70 text-indigo-800 rounded font-mono">
                    Cảnh #{actionNotice.sceneNumber}
                  </span>
                )}
              </h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                {actionNotice.message}
              </p>
              {actionNotice.directUrl && (
                <div className="mt-2">
                  <a
                    href={actionNotice.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Mở Studio Tạo Video Ngay</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-indigo-400 hover:text-indigo-700 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0 text-[11px]">
          Lọc phân đoạn:
        </span>
        {phases.map((ph) => (
          <button
            key={ph}
            onClick={() => setSelectedPhase(ph)}
            className={`px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap text-xs cursor-pointer ${
              selectedPhase === ph
                ? "bg-indigo-600 text-white font-semibold shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {ph === "all" ? "Tất cả các cảnh" : ph}
          </button>
        ))}
      </div>

      {/* Control bar: Scene header & Expand/Collapse All */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-slate-600 font-semibold">
          Danh sách phân cảnh ({filteredScenes.length} cảnh)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCollapsedScenes(new Set(script.scenes.map((s) => s.sceneNumber)))
            }
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            title="Đóng tất cả cảnh (chỉ hiện thanh Prompt)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Thu gọn (chỉ hiện Prompt)</span>
          </button>
          <button
            onClick={() => setCollapsedScenes(new Set())}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            title="Mở rộng tất cả chi tiết"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Mở rộng tất cả</span>
          </button>
        </div>
      </div>

      {/* Shot-by-shot List */}
      <div className="space-y-3">
        {filteredScenes.map((scene) => {
          const isCollapsed = collapsedScenes.has(scene.sceneNumber);
          const promptText = scene.aiPrompt || scene.visual;
          const currentImage = sceneImages[scene.sceneNumber];
          const currentClip = sceneClips[scene.sceneNumber];
          const isGeneratingImg = generatingImageScene === scene.sceneNumber;
          const isGeneratingVid = generatingVideoScene === scene.sceneNumber;
          const hasImg = Boolean(currentImage);
          const hasClip = Boolean(currentClip);
          const hasErr = Boolean(sceneErrors[scene.sceneNumber]);

          if (isCollapsed) {
            return (
              <div
                key={scene.sceneNumber}
                id={`scene-shot-${scene.sceneNumber}`}
                className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs hover:border-indigo-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                  {/* Scene badge & title toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(scene.sceneNumber)}
                    className="flex items-center space-x-2 text-left shrink-0 group cursor-pointer"
                    title="Nhấn để mở rộng chi tiết cảnh này"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                        #{scene.sceneNumber}
                      </span>
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">
                        Cảnh {scene.sceneNumber}: {scene.phase}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono hidden xl:inline">
                        ({scene.timecode})
                      </span>
                      {/* Status badge in collapsed mode */}
                      {hasClip ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-600" /> Done
                        </span>
                      ) : isGeneratingVid ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> Rendering
                        </span>
                      ) : isGeneratingImg ? (
                        <span className="text-[10px] font-bold text-pink-800 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Loader2 className="w-3 h-3 animate-spin text-pink-600" /> Gen Img
                        </span>
                      ) : hasImg ? (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                          Ảnh 9:16
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {/* Thanh drop chỉ hiện câu prompt và các nút thao tác nhanh 3 Model */}
                  <div className="flex-1 min-w-0 bg-slate-900 text-slate-200 px-3 py-2 rounded-lg flex items-center justify-between gap-3 border border-slate-800">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider shrink-0 hidden sm:inline">
                        Prompt:
                      </span>
                      <p
                        className="text-xs font-mono text-slate-200 select-all truncate"
                        title={promptText}
                      >
                        {promptText}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Button Chép Prompt */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(promptText, scene.sceneNumber);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                        title="Sao chép prompt này"
                      >
                        {copiedPromptIndex === scene.sceneNumber ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Chép</span>
                          </>
                        )}
                      </button>

                      {/* Button Tạo Ảnh (Model Text-to-Image) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImage(promptText, scene.sceneNumber);
                        }}
                        disabled={isGeneratingImg}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border cursor-pointer disabled:opacity-50 ${
                          currentImage
                            ? "bg-emerald-950 text-emerald-200 border-emerald-800"
                            : "bg-pink-900/60 hover:bg-pink-800 text-pink-200 border-pink-700/60"
                        }`}
                        title="Gọi Model Tạo Ảnh (Agnes / DALL-E / FLUX)"
                      >
                        {isGeneratingImg ? (
                          <Loader2 className="w-3 h-3 animate-spin text-pink-300" />
                        ) : currentImage ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-pink-400" />
                        )}
                        <span className="hidden sm:inline">
                          {currentImage ? "Có ảnh" : "Tạo Ảnh"}
                        </span>
                      </button>

                      {/* Button Tạo Video (Model Text/Image-to-Video) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateVideo(promptText, scene.sceneNumber);
                        }}
                        disabled={isGeneratingVid}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border cursor-pointer disabled:opacity-50 ${
                          currentClip
                            ? "bg-emerald-950 text-emerald-200 border-emerald-800"
                            : "bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-700/60"
                        }`}
                        title="Gọi Model Tạo Video (Agnes Video / Kling / Luma)"
                      >
                        {isGeneratingVid ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                        ) : currentClip ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <VideoIcon className="w-3 h-3 text-amber-400" />
                        )}
                        <span className="hidden sm:inline">
                          {currentClip ? "Có Clip" : "Tạo Video"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCollapse(scene.sceneNumber)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Mở rộng chi tiết phân cảnh"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* If image generated or clip available, show small preview strip */}
                {(currentImage || currentClip) && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {currentImage && (
                        <img
                          src={currentImage}
                          alt={`Cảnh ${scene.sceneNumber}`}
                          className="w-12 h-16 object-cover rounded-lg border border-slate-200 shadow-xs"
                        />
                      )}
                      <div>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {currentClip ? "Clip video đã sẵn sàng" : "Ảnh mốc nhân vật đã lưu"}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {currentClip
                            ? "Đã lưu checkpoint tự động cho cảnh này."
                            : "Ảnh này làm Start Frame cho mô hình Video (Agnes/Kling)."}
                        </p>
                      </div>
                    </div>

                    {currentClip && (
                      <a
                        href={currentClip}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-medium text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Xem Clip</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Expanded Scene Card
          return (
            <div
              key={scene.sceneNumber}
              id={`scene-shot-${scene.sceneNumber}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    #{scene.sceneNumber}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    Cảnh {scene.sceneNumber}: {scene.phase}
                  </span>

                  {/* Tiến trình phân cảnh (Scene Progress Status Badge) */}
                  <span className="ml-1 inline-flex items-center">
                    {hasClip ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Hoàn thành Clip MP4
                      </span>
                    ) : isGeneratingVid ? (
                      <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> Đang Render Clip Video...
                      </span>
                    ) : isGeneratingImg ? (
                      <span className="text-pink-800 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-600" /> Đang Tạo Ảnh Mốc...
                      </span>
                    ) : hasImg ? (
                      <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Ảnh Mốc 9:16 Xong
                      </span>
                    ) : hasErr ? (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Lỗi
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        ○ Chưa Tạo
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200 font-mono">
                    ⏱ {scene.timecode} ({scene.durationSeconds}s)
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(scene.sceneNumber)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-xs"
                    title="Thu về Prompt"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Thu về Prompt</span>
                  </button>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Visual description & Camera Shot */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      Góc quay: <strong className="text-slate-700">{scene.shotType}</strong>
                    </span>
                    <div className="text-slate-700 text-sm leading-relaxed font-normal bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
                      {scene.visual}
                    </div>
                  </div>

                  {/* SFX & Camera movement */}
                  <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/80 text-xs text-slate-700 flex items-start gap-2">
                    <Music className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-900">Âm thanh & Hiệu ứng (SFX):</strong>{" "}
                      {scene.sfxMusic}
                      {scene.cameraMovement && (
                        <div className="text-xs text-slate-500 mt-1 italic">
                          Chuyển động máy quay: {scene.cameraMovement}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Render Image or Clip Preview if available */}
                  {(currentImage || currentClip) && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {currentImage && (
                          <img
                            src={currentImage}
                            alt={`Ảnh cảnh ${scene.sceneNumber}`}
                            className="w-16 h-24 object-cover rounded-lg border border-slate-300 shadow-xs"
                          />
                        )}
                        <div className="text-xs space-y-0.5">
                          <strong className="text-slate-800 block">
                            {currentClip ? "Clip Video Cảnh #" + scene.sceneNumber : "Ảnh mốc nhân vật (Keyframe 9:16)"}
                          </strong>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            {currentClip
                              ? "Clip đã được render và lưu trữ an toàn."
                              : "Ảnh đã tạo thành công theo tỷ lệ 9:16 giữ nhất quán 2 bé."}
                          </p>
                        </div>
                      </div>

                      {currentClip && (
                        <a
                          href={currentClip}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Xem Clip</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Dialogues */}
                <div className="lg:col-span-5 space-y-3 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Lời thoại & Diễn xuất:
                  </span>
                  <div className="space-y-3">
                    {scene.dialogue.map((dlg, dIdx) => {
                      const isYellow = dlg.speaker.includes("Vàng");
                      const isRed = dlg.speaker.includes("Đỏ");
                      return (
                        <div key={dIdx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold uppercase tracking-wide ${
                                isYellow
                                  ? "text-amber-600"
                                  : isRed
                                  ? "text-rose-600"
                                  : "text-indigo-600"
                              }`}
                            >
                              {dlg.speaker}
                            </span>
                            <span className="text-[11px] italic text-slate-400">
                              {dlg.expression}
                            </span>
                          </div>
                          <p
                            className={`text-sm leading-relaxed font-medium p-3 rounded-r-lg border-l-4 ${
                              isYellow
                                ? "bg-amber-50 text-slate-800 border-amber-400"
                                : isRed
                                ? "bg-rose-50 text-slate-800 border-rose-400"
                                : "bg-blue-50 text-slate-800 border-blue-400"
                            }`}
                          >
                            "{dlg.line}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* AI Prompt Box & Multi-model Actions */}
              {scene.aiPrompt && (
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider block">
                        AI Video Prompt (Agnes / Kling / Luma / DALL-E):
                      </span>
                      <p className="text-slate-300 font-mono text-xs select-all mt-0.5 leading-relaxed">
                        {scene.aiPrompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Chép Prompt */}
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(scene.aiPrompt!, scene.sceneNumber)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors text-xs border border-slate-700 cursor-pointer"
                    >
                      {copiedPromptIndex === scene.sceneNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chép Prompt</span>
                        </>
                      )}
                    </button>

                    {/* Tạo Ảnh */}
                    <button
                      type="button"
                      onClick={() => handleGenerateImage(scene.aiPrompt!, scene.sceneNumber)}
                      disabled={isGeneratingImg}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pink-700 hover:bg-pink-600 text-white font-medium transition-colors text-xs shadow-xs cursor-pointer disabled:opacity-50"
                      title="Gọi Model Tạo Ảnh"
                    >
                      {isGeneratingImg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-pink-200" />
                      )}
                      <span>{currentImage ? "Tạo Lại Ảnh" : "Tạo Ảnh"}</span>
                    </button>

                      {/* Tạo Video */}
                    <button
                      type="button"
                      onClick={() => handleGenerateVideo(scene.aiPrompt!, scene.sceneNumber)}
                      disabled={isGeneratingVid}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors text-xs shadow-xs cursor-pointer disabled:opacity-50"
                      title="Gọi Model Tạo Video"
                    >
                      {isGeneratingVid ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <VideoIcon className="w-3.5 h-3.5 text-amber-200" />
                      )}
                      <span>{currentClip ? "Tạo Lại Clip" : "Tạo Video"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
