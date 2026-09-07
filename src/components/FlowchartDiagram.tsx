import React from "react";
import {
  Sparkles,
  ArrowRight,
  Video,
  Mic,
  Clapperboard,
  Layers,
  FileCheck,
  Zap,
  Play,
  Share2,
  Cpu,
  Tv,
} from "lucide-react";
import { TechScript } from "../types";

interface FlowchartDiagramProps {
  script: TechScript;
}

export const FlowchartDiagram: React.FC<FlowchartDiagramProps> = ({ script }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800">
              Sơ Đồ Quy Trình Sản Xuất Video Ngắn AI (Workflow Diagram)
            </h3>
            <p className="text-xs text-slate-500">
              Mô hình trực quan hóa từ khâu lên kịch bản đến video thành phẩm cho video: <strong className="text-slate-800">{script.productName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Sơ đồ quy trình tổng thể (Workflow 4 bước) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            1. Quy Trình Tổng Thể: Text ➡️ Prompt ➡️ AI Video ➡️ Thành Phẩm
          </h4>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
            4 Bước Thực Chiến
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Bước 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 relative hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Model Kịch Bản (LLM)
              </span>
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800 mb-1">Kịch Bản & Lời Thoại</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gemini / DeepSeek / OpenAI phân tích nỗi đau sản phẩm, viết thoại đối đáp dí dỏm giữa Bé Áo Vàng & Bé Áo Đỏ.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-600">
              🎯 <strong>Đầu ra:</strong> 5 cảnh quay (Hook 3s, Xung đột, Giải pháp, Tính năng, Twist CTA)
            </div>
          </div>

          {/* Bước 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 relative hover:border-pink-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] uppercase font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                Model Tạo Ảnh (T2I)
              </span>
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800 mb-1">Tạo Ảnh Mốc Nhân Vật</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                FLUX.1 / DALL-E 3 / Recraft render ảnh dọc 9:16 đồng nhất trang phục, đầu quấn khăn và má bánh bao.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-600">
              🎯 <strong>Đầu ra:</strong> Ảnh mốc (Start Frame) giữ nhất quán khuôn mặt 2 bé
            </div>
          </div>

          {/* Bước 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 relative hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Model Video (I2V / T2V)
              </span>
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800 mb-1">Tạo Video Chuyển Động</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Kling AI / Luma / Runway nhận ảnh mốc và camera prompt tạo clip chuyển động 5s-10s mượt mà chân thực.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-600">
              🎯 <strong>Đầu ra:</strong> 5 đoạn video clip ngắn (5s - 10s/đoạn)
            </div>
          </div>

          {/* Bước 4 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 relative hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Hậu Kỳ & Lồng Tiếng
              </span>
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-800 mb-1">Lồng Thoại & Xuất Bản</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Bật <strong>Máy Nhắc Chữ (Teleprompter)</strong> thu âm giọng lồng tiếng 2 bé, ghép âm thanh SFX và nhạc nền.
              </p>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-600">
              🎯 <strong>Đầu ra:</strong> Video hoàn chỉnh 30s-60s dọc 9:16 triệu view
            </div>
          </div>
        </div>
      </div>

      {/* Sơ đồ phân nhánh 5 phân cảnh (Story Flow Diagram) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-indigo-600" />
            2. Sơ Đồ Cấu Trúc Nhịp Phim 5 Cảnh (Story Beat Diagram)
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Tổng thời lượng: {script.targetDuration}
          </span>
        </div>

        <div className="space-y-4">
          {script.scenes.map((scene, index) => {
            const isHook = scene.sceneNumber === 1;
            const isTwist = scene.sceneNumber === 5;
            return (
              <div
                key={scene.sceneNumber}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all"
              >
                {/* Badge Number & Time */}
                <div className="flex items-center space-x-2 sm:w-36 shrink-0">
                  <span
                    className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center ${
                      isHook
                        ? "bg-rose-600 text-white"
                        : isTwist
                        ? "bg-amber-600 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    #{scene.sceneNumber}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {scene.timecode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({scene.durationSeconds}s)
                    </span>
                  </div>
                </div>

                {/* Main Action Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {scene.phase}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                      {scene.shotType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {scene.visual}
                  </p>
                </div>

                {/* Prompt Preview Snippet */}
                <div className="w-full sm:w-64 shrink-0 bg-slate-900 text-slate-200 px-3 py-2 rounded text-[11px] font-mono truncate border border-slate-800">
                  <span className="text-indigo-400 font-bold mr-1">Prompt:</span>
                  {scene.aiPrompt}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lời khuyên tối ưu hóa khi dùng mô hình AI */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-4">
        <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          Mẹo Thực Chiến Giữ Nhân Vật Đồng Nhất (Character Consistency)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
            <strong className="text-slate-200 block text-xs">
              📸 1. Luôn dùng chế độ Image-to-Video
            </strong>
            <p className="text-slate-400 leading-relaxed">
              Tạo hoặc chụp sẵn 1 ảnh mẫu của 2 bé (1 bé béo mặc áo vàng, 1 bé mặc áo đỏ). Khi tạo video cảnh 1, 2, 3, 4, 5 trên Kling AI hoặc Luma, tải ảnh này vào ô <strong>Start Image / Keyframe</strong>.
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
            <strong className="text-slate-200 block text-xs">
              🎙️ 2. Lồng tiếng tự nhiên với Teleprompter
            </strong>
            <p className="text-slate-400 leading-relaxed">
              Mở tính năng <strong>Máy Nhắc Chữ Lồng Tiếng</strong> ngay trên ứng dụng này với tốc độ 1.0x - 1.25x để khớp khẩu hình và nhịp điệu nhanh của TikTok/Reels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
