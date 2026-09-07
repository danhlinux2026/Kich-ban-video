import React, { useState } from "react";
import {
  Copy,
  Check,
  Film,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const PromptAssistant: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const characterImagePrompt = `Two cute chubby Asian toddlers walking on rural dirt path beside a green summer cornfield. One baby wears a bright yellow floral pajama outfit with matching yellow bandana headscarf and small embroidered cross-body pouch. Second baby wears a vibrant red white-polka-dot pajama outfit with matching red bandana headscarf, chubby round cheeks. Bright sunlight, cinematic lighting, 8k, photorealistic, depth of field, natural motion, aspect ratio 9:16.`;

  const videoMotionPrompt = `First-person POV camera tracks sideways as two toddlers run excitedly through cornfield. Bé Áo Vàng pointing forward laughing, Bé Áo Đỏ clumsy trip then sits up smiling with rosy cheeks. Cinematic motion blur, smooth 60fps, high quality physics, natural wind blowing corn leaves.`;

  return (
    <div className="bg-white text-slate-800 rounded-xl p-6 border border-slate-200 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800">
              Phối Hợp 3 Model: Kịch Bản ➡️ Ảnh Mốc (T2I) ➡️ Video Clip (T2V/I2V)
            </h3>
            <p className="text-xs text-slate-500">
              Quy chuẩn câu lệnh riêng biệt cho từng model AI trong dây chuyền sản xuất video ngắn triệu view
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold border border-indigo-100">
          3-Model Pipeline
        </span>
      </div>

      {/* 3 Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Model 1: Scriptwriting */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-xs text-indigo-950">1. Model Viết Kịch Bản (LLM)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
              Gemini / DeepSeek
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chịu trách nhiệm phân tích nỗi đau sản phẩm, sáng tạo tình huống hài hước 30s-60s, viết thoại dí dỏm và phân 5 cảnh quay logic.
          </p>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-indigo-100/80">
            🎯 <strong>Kết quả:</strong> File kịch bản JSON chuẩn hoá cấu trúc viral Hook-Problem-Solution.
          </div>
        </div>

        {/* Model 2: Text to Image */}
        <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-pink-600 text-white flex items-center justify-center">
                <ImageIcon className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-xs text-pink-950">2. Model Tạo Ảnh (Text-to-Image)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 font-bold">
              DALL-E 3 / FLUX
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tạo ảnh Keyframe chuẩn tỷ lệ 9:16 dọc của 2 bé với trang phục cố định để làm khung ảnh mốc mồi (Seed Frame) cho video.
          </p>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-pink-100/80">
            🎯 <strong>Kết quả:</strong> Ảnh chân thực sắc nét, đồng nhất khuôn mặt 2 bé.
          </div>
        </div>

        {/* Model 3: Text to Video */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-amber-600 text-white flex items-center justify-center">
                <VideoIcon className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-xs text-amber-950">3. Model Tạo Video (T2V / I2V)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              Kling AI / Luma
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chuyển ảnh mốc và prompt camera thành clip chuyển động 5s-10s mượt mà, chân thực theo đúng kịch bản phân cảnh.
          </p>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-amber-200/60">
            🎯 <strong>Kết quả:</strong> 5 clip MP4 sẵn sàng đưa vào CapCut lồng tiếng.
          </div>
        </div>
      </div>

      {/* Copyable Master Prompts for Image & Video */}
      <div className="space-y-4">
        {/* Image Master Prompt */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Prompt Tạo Ảnh Mốc (Text-to-Image / DALL-E / FLUX / Midjourney):
            </span>
            <button
              onClick={() => copyText(characterImagePrompt, "img_char")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              {copiedKey === "img_char" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chép Prompt Ảnh</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono select-all leading-relaxed">
            {characterImagePrompt}
          </p>
        </div>

        {/* Video Master Motion Prompt */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <VideoIcon className="w-3.5 h-3.5" />
              Prompt Chuyển Động Video (Kling AI / Luma Dream Machine / Runway Gen-3):
            </span>
            <button
              onClick={() => copyText(videoMotionPrompt, "vid_motion")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              {copiedKey === "vid_motion" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chép Prompt Video</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-300 font-mono select-all leading-relaxed">
            {videoMotionPrompt}
          </p>
        </div>
      </div>
    </div>
  );
};
