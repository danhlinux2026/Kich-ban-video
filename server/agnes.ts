export const AGNES_V1 = "https://apihub.agnes-ai.com/v1";

export function getAgnesBase(endpointUrl?: string): string {
  return (
    (endpointUrl || "")
      .replace(/\/+$/, "")
      .replace(/\/videos$/, "")
      .replace(/\/v1$/, "") || "https://apihub.agnes-ai.com"
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AgnesVideoOptions {
  prompt: string;
  startImageUrl?: string;
  model?: string;
  apiKey: string;
  endpointUrl?: string;
  durationSeconds?: number;
  jobId?: string;
  onProgress?: (percent: number, stage: string, detail?: string) => void;
}

export async function generateAgnesVideo({
  prompt,
  startImageUrl,
  model = "agnes-video-2.5-flash",
  apiKey,
  endpointUrl,
  durationSeconds = 5,
  jobId,
  onProgress,
}: AgnesVideoOptions): Promise<string> {
  const agnesBase = getAgnesBase(endpointUrl);
  const isFlash = model.includes("flash");
  
  // Agnes clamps duration between 4 and 12 seconds
  const clampedDuration = Math.max(4, Math.min(12, Math.round(durationSeconds || 5)));

  const submitUrl = `${agnesBase}/v1/videos`;
  let submitBody: Record<string, any>;

  if (isFlash) {
    submitBody = {
      model: "agnes-video-2.5-flash",
      prompt,
      mode: startImageUrl ? "keyframe" : "text",
      first_frame: startImageUrl || undefined,
      size: "720P",
      duration: clampedDuration,
    };
  } else {
    submitBody = {
      model,
      prompt,
      mode: startImageUrl ? "ti2vid" : "t2v",
      images: startImageUrl ? [startImageUrl] : undefined,
      size: "720P",
      duration: clampedDuration,
    };
  }

  // 1. Submit with 429 Retry Backoff (35s wait, max 5 retries)
  let videoId: string | null = null;
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    onProgress?.(
      5 + attempt * 2,
      attempt > 1
        ? `Đang chờ hạ nhiệt rate limit (thử lại ${attempt}/${maxRetries} sau 35s)`
        : "Đang gửi yêu cầu sinh video lên Agnes AI...",
      attempt > 1 ? "Free tier Agnes Video cho phép ~1 clip/phút" : undefined
    );

    const res = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(submitBody),
    });

    if (res.status === 429) {
      if (attempt === maxRetries) {
        throw new Error(
          "Agnes API (429 Rate Limit): Đã thử lại 5 lần (~3 phút) nhưng vẫn bị giới hạn tần số. Vui lòng đợi 1 phút rồi thử lại."
        );
      }
      onProgress?.(
        8 + attempt * 2,
        `Gặp 429 Rate Limit. Đang chờ 35 giây trước khi thử lại lần ${attempt + 1}/${maxRetries}...`,
        "Cơ chế tự động backoff bảo vệ pipeline không bị gián đoạn"
      );
      await sleep(35000);
      continue;
    }

    if (res.status === 402) {
      throw new Error(
        "Agnes API (402 Payment Required): Tài khoản của bạn đã hết hạn mức (quota) hoặc chương trình khuyến mãi đã kết thúc. Vui lòng nạp thêm credit hoặc đổi API Key."
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Agnes Video Submit Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    videoId = data.id || data.video_id || data.task_id || data.data?.id || data.data?.video_id;
    if (!videoId) {
      throw new Error("Không nhận được video_id từ phản hồi Agnes Video API: " + JSON.stringify(data));
    }
    break;
  }

  if (!videoId) {
    throw new Error("Không thể khởi tạo tác vụ Agnes Video.");
  }

  onProgress?.(20, "Đã gửi tác vụ thành công. Đang render video clip...", `ID tác vụ: ${videoId}`);

  // 2. Poll for video completion
  // Flash poll: GET /agnesapi?video_id=&model_name=
  // v2.0 / 2.5 poll: GET /v1/videos/{id}
  const pollUrl = isFlash
    ? `${agnesBase}/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=${encodeURIComponent(model)}`
    : `${agnesBase}/v1/videos/${encodeURIComponent(videoId)}`;

  const startTime = Date.now();
  const maxWaitMs = 300000; // 5 minutes
  const pollIntervalMs = 5000;

  while (Date.now() - startTime < maxWaitMs) {
    await sleep(pollIntervalMs);
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);

    // Calculate approximate render progress (20% -> 80% over ~150s)
    const renderPercent = Math.min(80, Math.round(20 + (elapsedSec / 150) * 60));
    onProgress?.(
      renderPercent,
      `Đang render video trên GPU Agnes AI (${elapsedSec}s)...`,
      `Model: ${model}`
    );

    try {
      const pollRes = await fetch(pollUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!pollRes.ok) {
        // Transient network or server error during poll
        continue;
      }

      const pollData = await pollRes.json();
      const status = (pollData.status || pollData.state || pollData.data?.status || "").toLowerCase();

      if (["completed", "succeeded", "success", "done"].includes(status)) {
        const videoUrl =
          pollData.video_url ||
          pollData.output?.video ||
          pollData.output?.url ||
          pollData.data?.video_url ||
          pollData.data?.url ||
          pollData.url;

        if (videoUrl) {
          onProgress?.(100, "Render video clip hoàn tất!", `Thời gian render: ${elapsedSec}s`);
          return videoUrl;
        }
      }

      if (["failed", "error", "cancelled"].includes(status)) {
        const errorMsg =
          pollData.error ||
          pollData.message ||
          pollData.data?.error ||
          "Agnes báo lỗi render video.";
        throw new Error(`Render video thất bại: ${errorMsg}`);
      }
    } catch (pollErr: any) {
      if (pollErr.message?.includes("thất bại")) {
        throw pollErr;
      }
      // If temporary fetch error, retry next loop
    }
  }

  throw new Error(`Quá thời gian chờ render clip video (> 5 phút, tác vụ ${videoId}). Vui lòng kiểm tra lại.`);
}

export async function generateAgnesImage(
  prompt: string,
  apiKey: string,
  endpointUrl?: string,
  aspectRatio: string = "9:16"
): Promise<string> {
  const agnesBase = getAgnesBase(endpointUrl);
  const size = aspectRatio === "9:16" ? "1024x1792" : aspectRatio === "16:9" ? "1792x1024" : "1024x1024";

  const res = await fetch(`${agnesBase}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "agnes-image-2.5-flash",
      prompt,
      n: 1,
      size,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Agnes Image API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url || data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Không nhận được URL ảnh từ Agnes Image API.");
  }

  return imageUrl;
}
