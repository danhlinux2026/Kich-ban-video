import React, { useState, useEffect } from "react";
import { TechScript, LLMConfig } from "../types";
import { CHARACTERS } from "../data/presets";
import { Sparkles, Loader2, Wand2, X, AlertCircle, Settings, Cpu } from "lucide-react";

interface CustomScriptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptGenerated: (newScript: TechScript) => void;
  onOpenSettings?: () => void;
}

export const CustomScriptGenerator: React.FC<CustomScriptGeneratorProps> = ({
  isOpen,
  onClose,
  onScriptGenerated,
  onOpenSettings,
}) => {
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Gia dụng thông minh Smarthome");
  const [productBrand, setProductBrand] = useState("");
  const [keyFeatures, setKeyFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("Người thích tiện lợi, gia đình và giới trẻ");
  const [commercialAngle, setCommercialAngle] = useState("Tình huống rắc rối đời thực ➡️ Sản phẩm xuất hiện cứu nguy (Problem - Agitate - Solve - Demo)");
  const [duration, setDuration] = useState<"30s" | "45s" | "60s">("45s");
  const [tone, setTone] = useState("Hài hước, đối đáp dí dỏm, làm nổi bật công năng giải quyết vấn đề, chốt đơn tự nhiên");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>("gemini-2.5-flash");

  useEffect(() => {
    try {
      const savedMulti = localStorage.getItem("scriptai_multi_model_config");
      if (savedMulti) {
        const parsedMulti = JSON.parse(savedMulti);
        if (parsedMulti.scriptLLM?.modelName) {
          setActiveModelName(parsedMulti.scriptLLM.modelName);
          return;
        }
      }
      const saved = localStorage.getItem("scriptai_llm_custom_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.modelName) setActiveModelName(parsed.modelName);
      }
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg("Vui lòng nhập tên sản phẩm công nghệ!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    let clientConfig: LLMConfig | null = null;
    try {
      const savedMulti = localStorage.getItem("scriptai_multi_model_config");
      if (savedMulti) {
        const parsed = JSON.parse(savedMulti);
        if (parsed.scriptLLM) clientConfig = parsed.scriptLLM;
      }
      if (!clientConfig) {
        const saved = localStorage.getItem("scriptai_llm_custom_config");
        if (saved) clientConfig = JSON.parse(saved);
      }
    } catch (e) {}

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productCategory,
          productBrand,
          keyFeatures,
          targetAudience,
          commercialAngle,
          duration,
          customTone: tone,
          llmConfig: clientConfig,
        }),
      });

      const data = await res.json();

      if (data.success && data.script && data.script.scenes) {
        // Construct full TechScript
        const generated: TechScript = {
          id: `custom-${Date.now()}`,
          title: data.script.title || `Kịch Bản Giới Thiệu ${productName}`,
          productName: productName,
          productCategory: productCategory,
          targetDuration: duration,
          hookHeadline: data.script.hookHeadline || "Cú va chạm bất ngờ & Giải pháp công nghệ đỉnh cao",
          coreBenefit: keyFeatures || "Tính năng thông minh vượt trội",
          storyConcept: data.script.title || "Bộ đôi nhí trải nghiệm công nghệ mới",
          characters: CHARACTERS,
          scenes: data.script.scenes.map((s: any, idx: number) => ({
            sceneNumber: idx + 1,
            timecode: s.timecode || `00:0${idx * 8} - 00:0${(idx + 1) * 8}`,
            durationSeconds: Math.round((parseInt(duration) || 45) / data.script.scenes.length),
            phase: s.phase || "Trải nghiệm & Tính năng",
            shotType: s.shotType || "Trung cảnh",
            visual: s.visual || "Hai bé cùng tương tác với thiết bị",
            dialogue: s.dialogue || [
              { speaker: "Bé Áo Vàng", line: "Ủa cái gì hay vậy?", expression: "Ngạc nhiên" },
              { speaker: "Bé Áo Đỏ", line: "Sản phẩm xịn lắm nè!", expression: "Tự hào" },
            ],
            sfxMusic: s.sfxMusic || "Nhạc nền vui nhộn",
            aiPrompt: s.aiPrompt || "Two chubby cute babies interacting with tech product in rural field",
          })),
          cta: data.script.cta || {
            visual: "Hai bé vẫy tay chào bên cạnh hộp sản phẩm",
            voiceOver: `Trải nghiệm ${productName} ngay hôm nay!`,
            punchline: "Mua ngay kẻo lỡ!",
            actionButtonText: "Xem Chi Tiết Sản Phẩm",
          },
          viralTips: data.script.viralTips || [
            "Giữ nhịp tương tác đối đáp nhanh giữa 2 bé",
            "Lồng ghép âm thanh SFX vui nhộn ở mọi điểm rơi",
            "Kêu gọi hành động rõ ràng kèm quà tặng",
          ],
        };

        onScriptGenerated(generated);
        onClose();
      } else {
        // Fallback local generator if server returned curated template or API key missing
        const fallbackScript: TechScript = {
          id: `custom-${Date.now()}`,
          title: `Cú Đâm Cột Điện Hài Hước & Cứu Tinh ${productName}`,
          productName: productName,
          productCategory: productCategory,
          targetDuration: duration,
          hookHeadline: `Khi Bé Áo Đỏ mải mê trải nghiệm ${productName}!`,
          coreBenefit: keyFeatures || "Công nghệ đột phá nâng tầm cuộc sống",
          storyConcept: `Bé Áo Vàng cảnh báo cột điện nhưng Bé Áo Đỏ đã có ${productName} giải quyết mọi âu lo trong chớp mắt!`,
          characters: CHARACTERS,
          scenes: [
            {
              sceneNumber: 1,
              timecode: "00:00 - 00:05",
              durationSeconds: 5,
              phase: "Hook 3s",
              shotType: "Medium Shot -> Close-up",
              visual: `Hai bé đi trên đường quê. Bé Áo Vàng hốt hoảng la to: 'Ê nhìn đường kìa!'. Bé Áo Đỏ đang tập trung cao độ vào ${productName} bèn nháy mắt dừng chân điềm tĩnh.`,
              dialogue: [
                { speaker: "Bé Áo Vàng", line: "Ê! Coi chừng cái cột điện kìa!!", expression: "Hét toáng lên chỉ tay" },
                { speaker: "Bé Áo Đỏ", line: "Yên tâm, có bảo bối rồi!", expression: "Cười tủm tỉm tự tin" },
              ],
              sfxMusic: "Tiếng bước chân gấp gáp -> Tiếng phanh kít kịt -> Tiếng chuông 'Ding!'",
              aiPrompt: `Cinematic close-up of cute chubby baby holding ${productName} in sunny countryside, stopping calmly in front of obstacle.`,
            },
            {
              sceneNumber: 2,
              timecode: "00:05 - 00:15",
              durationSeconds: 10,
              phase: "Xung đột & Sự cố",
              shotType: "Over-the-shoulder Shot",
              visual: `Bé Áo Vàng chạy lại xem thử: 'Ủa mày đang cầm cái gì mà mê mẩn không thèm nhìn đường vậy?'. Bé Áo Đỏ giơ ${productName} lên khoe thiết kế siêu tinh tế.`,
              dialogue: [
                { speaker: "Bé Áo Vàng", line: "Cái gì mà nhìn lạ hoắc vậy?", expression: "Dụi mắt, săm soi tò mò" },
                { speaker: "Bé Áo Đỏ", line: `Đây là ${productName}! ${keyFeatures || "Cực kỳ xịn xò"} nè!`, expression: "Hất cằm tự hào" },
              ],
              sfxMusic: "Âm thanh ánh sáng phát ra lấp lánh (Shimmer magic SFX)",
              aiPrompt: `Two toddlers examining high-tech ${productName}, detailed product showcase with curious facial expressions.`,
            },
            {
              sceneNumber: 3,
              timecode: "00:15 - 00:30",
              durationSeconds: 15,
              phase: "Xuất hiện Giải pháp",
              shotType: "Feature Demo & Macro Shot",
              visual: `Cận cảnh tính năng: ${productName} hoạt động trơn tru. Bé Áo Vàng thốt lên trầm trồ, thử bấm nút trải nghiệm và nhảy cẫng lên thích thú.`,
              dialogue: [
                { speaker: "Bé Áo Vàng", line: "Trời đất ơi tiện dữ vậy! Làm thử tao coi thêm lần nữa coi!", expression: "Nhảy chân sáo nũng nịu" },
                { speaker: "Voice-over", line: `${productName} - Đỉnh cao công nghệ, kiến tạo phong cách sống hiện đại!`, expression: "Trầm ấm, uy tín" },
              ],
              sfxMusic: "Beat nhạc hiện đại lôi cuốn, tiếng 'Click' công nghệ mượt mà",
              aiPrompt: `Macro shot showing innovative features of ${productName} operated by cheerful toddler, vibrant colors.`,
            },
            {
              sceneNumber: 4,
              timecode: "00:30 - 00:45",
              durationSeconds: 15,
              phase: "Cú Twist & Kêu gọi hành động (CTA)",
              shotType: "Wide Shot & Promotional Endcard",
              visual: `Bé Áo Vàng mượn luôn ${productName} chạy trước, Bé Áo Đỏ đuổi theo đòi lại: 'Trả cho tui!'. Khung hình đóng băng với ưu đãi giảm giá đặc biệt.`,
              dialogue: [
                { speaker: "Bé Áo Vàng", line: "Thích quá rồi, của tao nha!", expression: "Cười toe toét ôm máy chạy" },
                { speaker: "Voice-over", line: `Đặt mua ngay ${productName} hôm nay để nhận ưu đãi có hạn tại giỏ hàng!`, expression: "Dứt khoát, kêu gọi hành động mạnh mẽ" },
              ],
              sfxMusic: "Tiếng cười nắc nẻ, nhạc kết thúc rộn rã",
              aiPrompt: `Toddler in yellow cheerfully running away holding ${productName}, cute chase scene, promotional graphics.`,
            },
          ],
          cta: {
            visual: `Hình ảnh bao bì ${productName} kèm bảng giá ưu đãi sốc`,
            voiceOver: `Nhấn vào link bên dưới để nhận ngay mã giảm giá cho ${productName}!`,
            punchline: "Công nghệ thông minh - Dùng là mê!",
            actionButtonText: "Nhận Voucher Ưu Đãi",
          },
          viralTips: [
            "Giữ độ tương phản màu sắc giữa bộ bà ba Vàng và Đỏ để tôn lên vẻ sang trọng của sản phẩm công nghệ.",
            "Tập trung giải quyết đúng nỗi đau thường ngày của khách hàng trong 15 giây đầu.",
            "Cú twist tranh giành sản phẩm cuối video tạo cảm giác sản phẩm cực kỳ đáng khao khát.",
          ],
        };

        onScriptGenerated(fallbackScript);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  AI Tạo Kịch Bản Video Quảng Cáo Bán Hàng
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  COMMERCIAL ADS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Định vị chuyên biệt cho Video Marketing & TikTok Shop cùng bộ đôi nhí viral
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cấu hình Endpoint và API Key"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-950">Chế độ Đạo Diễn Quảng Cáo & Marketing Video đã sẵn sàng:</p>
              <p className="text-amber-800 leading-relaxed">
                AI sẽ tự động viết kịch bản theo công thức bán hàng chuyển đổi cao: <strong>Hook giật nỗi đau ➡️ Bảo bối xuất hiện ➡️ Demo tính năng USP ➡️ Đúc kết lợi ích ➡️ Kêu gọi chốt đơn CTA</strong>.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tên sản phẩm quảng cáo *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="VD: Nồi Chiên Không Dầu Sunhouse, Kính Thông Minh AI Smart Vision, Robot Hút Bụi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thương hiệu / Nhãn hàng
              </label>
              <input
                type="text"
                value={productBrand}
                onChange={(e) => setProductBrand(e.target.value)}
                placeholder="VD: Dreame, Apple, Sunhouse, TitanTech..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Danh mục ngành hàng
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="Gia dụng thông minh Smarthome">Gia dụng thông minh Smarthome</option>
                <option value="Điện thoại & Phụ kiện công nghệ">Điện thoại & Phụ kiện công nghệ</option>
                <option value="Thiết bị chăm sóc sức khỏe & sắc đẹp">Thiết bị chăm sóc sức khỏe & sắc đẹp</option>
                <option value="Đồng hồ thông minh Smartwatch">Đồng hồ thông minh Smartwatch</option>
                <option value="Kính AR / VR thông minh">Kính AR / VR thông minh</option>
                <option value="Tai nghe & Thiết bị âm thanh">Tai nghe & Thiết bị âm thanh</option>
                <option value="Thời trang & Đồ dùng tiện ích">Thời trang & Đồ dùng tiện ích</option>
                <option value="Thực phẩm & Đồ uống F&B">Thực phẩm & Đồ uống F&B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Điểm Bán Hàng Độc Nhất (USP) & Tính Năng Cốt Lõi Cần Bán *
            </label>
            <textarea
              rows={2}
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              placeholder="VD: Tự động gỡ tóc rối, lực hút 12000Pa, né vật cản nhạy, nấu ăn không dầu mỡ giảm 80% béo, bảo hành 2 năm 1 đổi 1..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Góc Tiếp Cận Quảng Cáo (Marketing Hook Formula)
            </label>
            <select
              value={commercialAngle}
              onChange={(e) => setCommercialAngle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="Tình huống rắc rối đời thực ➡️ Sản phẩm xuất hiện cứu nguy (Problem - Agitate - Solve - Demo)">
                1. Tình huống rắc rối đời thực ➡️ Bảo bối xuất hiện cứu nguy (PAS Formula)
              </option>
              <option value="Đập hộp review trải nghiệm thực tế hài hước (Unboxing & Live Product Experience)">
                2. Đập hộp & Trải nghiệm thực tế hài hước (Unboxing & Reaction)
              </option>
              <option value="So sánh Trước & Sau khi dùng sản phẩm (Before vs After Transformation)">
                3. So sánh Trước & Sau khi có sản phẩm (Before / After)
              </option>
              <option value="Thử thách độ bền & Công năng đỉnh cao (Extreme Stress Test & Feature Showcase)">
                4. Thử thách công năng đỉnh cao & Độ bền thực chiến (Live Demo)
              </option>
              <option value="Bắt trend TikTok Shop & Khuyến mãi giật gân chốt đơn (Flash Sale & Urgent CTA)">
                5. Bắt trend TikTok Shop & Ưu đãi chốt đơn khẩn cấp (Urgent CTA)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thời lượng video quảng cáo
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["30s", "45s", "60s"] as const).map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={`py-2 rounded-md text-xs font-bold transition-all border ${
                      duration === dur
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đối tượng khách hàng mục tiêu
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="VD: Gia đình trẻ, mẹ bỉm sữa, dân công sở bận rộn..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick presets suggestions */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
              Gợi ý nhanh sản phẩm mẫu:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Robot Hút Bụi Lau Nhà AI X40", brand: "Dreame", cat: "Gia dụng thông minh Smarthome", feat: "Lực hút 12000Pa tự gỡ tóc rối, camera AI né dây điện, tự giặt giẻ nước nóng" },
                { name: "Máy Lọc Không Khí & Quạt Không Cánh", brand: "Dyson", cat: "Thiết bị chăm sóc sức khỏe & sắc đẹp", feat: "Lọc 99.95% bụi mịn PM0.1, khử mùi hôi lập tức, chạy êm ru không tiếng động" },
                { name: "Đồng Hồ Thông Minh Watch Ultra", brand: "TitanTech", cat: "Đồng hồ thông minh Smartwatch", feat: "Còi cứu hộ 86dB kêu vang xa 180m, phát hiện va chạm tự gọi cấp cứu" },
              ].map((sug, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setProductName(sug.name);
                    setProductBrand(sug.brand);
                    setProductCategory(sug.cat);
                    setKeyFeatures(sug.feat);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors border border-slate-200 cursor-pointer"
                >
                  + {sug.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Model kịch bản: <strong>{activeModelName}</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang Viết Kịch Bản Quảng Cáo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Sinh Kịch Bản Quảng Cáo AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
