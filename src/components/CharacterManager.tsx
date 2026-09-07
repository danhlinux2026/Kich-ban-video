import React, { useState, useRef } from "react";
import { CharacterProfile, AIStudioConfig } from "../types";
import {
  CHARACTER_PAIR_PRESETS,
  DEFAULT_CHARACTER_A,
  DEFAULT_CHARACTER_B,
} from "../data/characterPresets";
import {
  Upload,
  Sparkles,
  Link,
  Trash2,
  Check,
  RefreshCw,
  Eye,
  Volume2,
  Users,
  AlertCircle,
  HelpCircle,
  Save,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface CharacterManagerProps {
  characters: CharacterProfile[];
  onUpdateCharacters: (updatedChars: CharacterProfile[]) => void;
  onOpenSettings?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  characters,
  onUpdateCharacters,
  onOpenSettings,
  onNextStep,
  onPrevStep,
}) => {
  // Initialize character A and B
  const initialCharA: CharacterProfile =
    characters && characters[0]
      ? { ...DEFAULT_CHARACTER_A, ...characters[0], id: "char_a" }
      : { ...DEFAULT_CHARACTER_A };

  const initialCharB: CharacterProfile =
    characters && characters[1]
      ? { ...DEFAULT_CHARACTER_B, ...characters[1], id: "char_b" }
      : { ...DEFAULT_CHARACTER_B };

  const [charA, setCharA] = useState<CharacterProfile>(initialCharA);
  const [charB, setCharB] = useState<CharacterProfile>(initialCharB);
  const [activeTab, setActiveTab] = useState<"both" | "char_a" | "char_b">("both");
  const [selectedPreset, setSelectedPreset] = useState<string>("classic_rural_kids");

  // Loading states
  const [isGeneratingImgA, setIsGeneratingImgA] = useState(false);
  const [isGeneratingImgB, setIsGeneratingImgB] = useState(false);
  const [isUploadingA, setIsUploadingA] = useState(false);
  const [isUploadingB, setIsUploadingB] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // URL input dialog states
  const [showUrlInputA, setShowUrlInputA] = useState(false);
  const [showUrlInputB, setShowUrlInputB] = useState(false);
  const [tempUrlA, setTempUrlA] = useState("");
  const [tempUrlB, setTempUrlB] = useState("");

  // Preview lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const getSavedAIConfig = (): AIStudioConfig | null => {
    try {
      const saved = localStorage.getItem("scriptai_multi_model_config");
      if (saved) return JSON.parse(saved);
      const old = localStorage.getItem("scriptai_llm_custom_config");
      if (old) {
        const parsed = JSON.parse(old);
        return {
          scriptLLM: parsed,
          textToImage: {
            provider: "agnes",
            modelName: "agnes-image-2.5-flash",
            apiKey: parsed.apiKey || "",
            endpointUrl: parsed.endpointUrl || "",
            aspectRatio: "9:16",
          },
          textToVideo: {
            provider: "agnes",
            modelName: "agnes-video-2.5-flash",
            apiKey: parsed.apiKey || "",
            endpointUrl: parsed.endpointUrl || "",
            motionMode: "image-to-video",
            cameraMotion: "camera tracks sideways",
          },
        };
      }
    } catch (e) {}
    return null;
  };

  // Switch preset
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = CHARACTER_PAIR_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCharA({ ...found.characterA });
      setCharB({ ...found.characterB });
      onUpdateCharacters([{ ...found.characterA }, { ...found.characterB }]);
      showToastNotification(`Đã áp dụng mẫu bộ đôi: ${found.name}`);
    }
  };

  const showToastNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Upload image from user's computer
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "char_a" | "char_b"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh không được vượt quá 20MB.");
      return;
    }

    setErrorMsg(null);
    if (target === "char_a") setIsUploadingA(true);
    else setIsUploadingB(true);

    try {
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string;
        try {
          const res = await fetch("/api/upload-character-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageData: base64Data,
              characterRole: target,
              fileName: file.name,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Không thể tải ảnh lên máy chủ");
          }

          const uploadedUrl = data.imageUrl;
          if (target === "char_a") {
            const updated = { ...charA, avatarUrl: uploadedUrl };
            setCharA(updated);
            onUpdateCharacters([updated, charB]);
          } else {
            const updated = { ...charB, avatarUrl: uploadedUrl };
            setCharB(updated);
            onUpdateCharacters([charA, updated]);
          }
          showToastNotification(
            `Đã tải ảnh tham chiếu cho ${target === "char_a" ? charA.name : charB.name}!`
          );
        } catch (postErr: any) {
          setErrorMsg(postErr.message || "Lỗi khi lưu ảnh lên máy chủ.");
        } finally {
          if (target === "char_a") setIsUploadingA(false);
          else setIsUploadingB(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi xử lý tệp ảnh.");
      if (target === "char_a") setIsUploadingA(false);
      else setIsUploadingB(false);
    }
  };

  // Submit URL directly
  const handleSetUrl = (target: "char_a" | "char_b") => {
    const url = target === "char_a" ? tempUrlA.trim() : tempUrlB.trim();
    if (!url) return;

    if (target === "char_a") {
      const updated = { ...charA, avatarUrl: url };
      setCharA(updated);
      setShowUrlInputA(false);
      setTempUrlA("");
      onUpdateCharacters([updated, charB]);
    } else {
      const updated = { ...charB, avatarUrl: url };
      setCharB(updated);
      setShowUrlInputB(false);
      setTempUrlB("");
      onUpdateCharacters([charA, updated]);
    }
    showToastNotification(`Đã liên kết ảnh cho ${target === "char_a" ? charA.name : charB.name}`);
  };

  // Remove image
  const handleRemoveImage = (target: "char_a" | "char_b") => {
    if (target === "char_a") {
      const updated = { ...charA, avatarUrl: "" };
      setCharA(updated);
      onUpdateCharacters([updated, charB]);
    } else {
      const updated = { ...charB, avatarUrl: "" };
      setCharB(updated);
      onUpdateCharacters([charA, updated]);
    }
  };

  // Generate character appearance using AI
  const handleAIGenerateAppearance = async (target: "char_a" | "char_b") => {
    const char = target === "char_a" ? charA : charB;
    const aiConfig = getSavedAIConfig();

    setErrorMsg(null);
    if (target === "char_a") setIsGeneratingImgA(true);
    else setIsGeneratingImgB(true);

    try {
      const promptToUse =
        char.appearancePrompt ||
        `Full-body concept shot, 9:16 vertical photorealistic cinematic portrait of ${char.name}, wearing ${char.outfit}. Expressive cute face, 8k resolution, cinematic studio lighting`;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          isCharacterPortrait: true,
          targetCharacter: char,
          imageConfig: aiConfig?.textToImage || {
            provider: "agnes",
            modelName: "agnes-image-2.5-flash",
            aspectRatio: "9:16",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo diện mạo bằng AI");
      }

      if (data.imageUrl) {
        if (target === "char_a") {
          const updated = { ...charA, avatarUrl: data.imageUrl };
          setCharA(updated);
          onUpdateCharacters([updated, charB]);
        } else {
          const updated = { ...charB, avatarUrl: data.imageUrl };
          setCharB(updated);
          onUpdateCharacters([charA, updated]);
        }
        showToastNotification(`AI đã tạo thành công diện mạo cho ${char.name}!`);
      } else {
        throw new Error(
          data.message || "Vui lòng kiểm tra cấu hình API Key Agnes Image trong phần Cài đặt AI Models."
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi gọi AI tạo ảnh nhân vật.");
    } finally {
      if (target === "char_a") setIsGeneratingImgA(false);
      else setIsGeneratingImgB(false);
    }
  };

  // Save manual edits
  const handleSaveAll = () => {
    onUpdateCharacters([charA, charB]);
    try {
      localStorage.setItem("scriptai_character_config", JSON.stringify([charA, charB]));
    } catch (e) {}
    showToastNotification("Đã lưu toàn bộ cấu hình nhân vật A và B thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Preset Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-800">
                Cấu Hình Bộ Đôi Nhân Vật & Ảnh Tham Chiếu AI
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chọn hoặc tùy biến <strong>Nhân vật A</strong> và <strong>Nhân vật B</strong>. Thêm hình ảnh mẫu để AI đối chiếu và sinh nhân vật nhất quán xuyên suốt video.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Cấu Hình Nhân Vật</span>
          </button>
        </div>

        {/* Preset Selection Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Chọn Bộ Đôi Nhân Vật Mẫu (Presets):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {CHARACTER_PAIR_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500 shadow-xs"
                      : "bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {preset.styleTag}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {preset.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-[11px] underline font-bold text-rose-700 shrink-0 hover:text-rose-900"
            >
              Mở Cài Đặt AI
            </button>
          )}
        </div>
      )}

      {/* View Switcher: Both vs Individual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "both"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Xem Cả 2 Nhân Vật
          </button>
          <button
            onClick={() => setActiveTab("char_a")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "char_a"
                ? "bg-amber-100 text-amber-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Nhân Vật A ({charA.name})
          </button>
          <button
            onClick={() => setActiveTab("char_b")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "char_b"
                ? "bg-rose-100 text-rose-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Nhân Vật B ({charB.name})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          💡 Ảnh tham chiếu sẽ giúp AI tạo hình gương mặt và trang phục nhất quán
        </span>
      </div>

      {/* Main Two-Column Character Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===================== CHARACTER A ===================== */}
        {(activeTab === "both" || activeTab === "char_a") && (
          <div
            id="character-config-a"
            className="bg-white rounded-xl border border-amber-200/80 shadow-xs p-5 space-y-4 hover:border-amber-300 transition-all"
          >
            {/* Header Character A */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800">
                      Nhân Vật A
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Vai chính 1
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    (Mặc định: Bé Áo Vàng)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  charA.avatarUrl
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {charA.avatarUrl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    Đã có ảnh mốc AI
                  </>
                ) : (
                  "Chưa có ảnh mẫu"
                )}
              </span>
            </div>

            {/* Character Image Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Hình ảnh tham chiếu cho AI (Reference Image):</span>
                {charA.avatarUrl && (
                  <button
                    onClick={() => handleRemoveImage("char_a")}
                    className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa ảnh
                  </button>
                )}
              </label>

              {/* Image Preview / Empty Placeholder */}
              <div className="relative rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 overflow-hidden min-h-[220px] flex items-center justify-center">
                {charA.avatarUrl ? (
                  <div className="relative w-full h-[260px] bg-slate-900 group flex items-center justify-center">
                    <img
                      src={charA.avatarUrl}
                      alt={charA.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(charA.avatarUrl || null)}
                        className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem lớn
                      </button>
                      <button
                        onClick={() => fileInputRefA.current?.click()}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Đổi ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Chưa có ảnh mẫu cho {charA.name}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Tải lên hình ảnh thiết kế sẵn hoặc bấm <strong>"Tạo diện mạo bằng AI"</strong> để hệ thống tự vẽ ảnh concept chuẩn 9:16.
                    </p>
                  </div>
                )}

                {/* Loading Overlays */}
                {(isGeneratingImgA || isUploadingA) && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                    <RefreshCw className="w-7 h-7 text-amber-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">
                      {isGeneratingImgA
                        ? "AI đang vẽ diện mạo cho Nhân vật A..."
                        : "Đang tải ảnh lên máy chủ..."}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Image */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="file"
                  ref={fileInputRefA}
                  onChange={(e) => handleFileUpload(e, "char_a")}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRefA.current?.click()}
                  disabled={isUploadingA || isGeneratingImgA}
                  className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải ảnh lên</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInputA(!showUrlInputA)}
                  disabled={isUploadingA || isGeneratingImgA}
                  className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-60"
                >
                  <Link className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dán link ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAIGenerateAppearance("char_a")}
                  disabled={isUploadingA || isGeneratingImgA}
                  className="px-2.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo bằng AI</span>
                </button>
              </div>

              {/* URL Input Box Collapsible */}
              {showUrlInputA && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/character-a.png"
                    value={tempUrlA}
                    onChange={(e) => setTempUrlA(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleSetUrl("char_a")}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700"
                  >
                    Gán
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields Character A */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên nhân vật:
                  </label>
                  <input
                    type="text"
                    value={charA.name}
                    onChange={(e) => setCharA({ ...charA, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Biệt danh:
                  </label>
                  <input
                    type="text"
                    value={charA.nickname}
                    onChange={(e) => setCharA({ ...charA, nickname: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Trang phục & Nhận diện ngoại hình:
                </label>
                <input
                  type="text"
                  value={charA.outfit}
                  onChange={(e) => setCharA({ ...charA, outfit: e.target.value })}
                  placeholder="Áo bà ba vàng hoa cúc, quấn khăn rằn..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Prompt mô tả ngoại hình cho AI (Prompt chi tiết):
                </label>
                <textarea
                  rows={2}
                  value={charA.appearancePrompt || ""}
                  onChange={(e) => setCharA({ ...charA, appearancePrompt: e.target.value })}
                  placeholder="Full body concept shot, cute 4-year-old Vietnamese girl toddler with yellow outfit..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-500" />
                    Giọng đọc Edge TTS:
                  </label>
                  <select
                    value={charA.voice || "vi-VN-HoaiMyNeural"}
                    onChange={(e) => setCharA({ ...charA, voice: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="vi-VN-HoaiMyNeural">👩 Hoài My (Nữ truyền cảm)</option>
                    <option value="vi-VN-NamMinhNeural">👨 Nam Minh (Nam trầm ấm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Huy hiệu vai trò:
                  </label>
                  <input
                    type="text"
                    value={charA.badge}
                    onChange={(e) => setCharA({ ...charA, badge: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Câu nói cửa miệng / Signature Quote:
                </label>
                <input
                  type="text"
                  value={charA.signatureQuote}
                  onChange={(e) => setCharA({ ...charA, signatureQuote: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 italic text-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== CHARACTER B ===================== */}
        {(activeTab === "both" || activeTab === "char_b") && (
          <div
            id="character-config-b"
            className="bg-white rounded-xl border border-rose-200/80 shadow-xs p-5 space-y-4 hover:border-rose-300 transition-all"
          >
            {/* Header Character B */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-200">
                  B
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800">
                      Nhân Vật B
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      Vai chính 2
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    (Mặc định: Bé Áo Đỏ)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  charB.avatarUrl
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {charB.avatarUrl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    Đã có ảnh mốc AI
                  </>
                ) : (
                  "Chưa có ảnh mẫu"
                )}
              </span>
            </div>

            {/* Character Image Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Hình ảnh tham chiếu cho AI (Reference Image):</span>
                {charB.avatarUrl && (
                  <button
                    onClick={() => handleRemoveImage("char_b")}
                    className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa ảnh
                  </button>
                )}
              </label>

              {/* Image Preview / Empty Placeholder */}
              <div className="relative rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 overflow-hidden min-h-[220px] flex items-center justify-center">
                {charB.avatarUrl ? (
                  <div className="relative w-full h-[260px] bg-slate-900 group flex items-center justify-center">
                    <img
                      src={charB.avatarUrl}
                      alt={charB.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(charB.avatarUrl || null)}
                        className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem lớn
                      </button>
                      <button
                        onClick={() => fileInputRefB.current?.click()}
                        className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Đổi ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Chưa có ảnh mẫu cho {charB.name}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Tải lên hình ảnh thiết kế sẵn hoặc bấm <strong>"Tạo diện mạo bằng AI"</strong> để hệ thống tự vẽ ảnh concept chuẩn 9:16.
                    </p>
                  </div>
                )}

                {/* Loading Overlays */}
                {(isGeneratingImgB || isUploadingB) && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
                    <RefreshCw className="w-7 h-7 text-rose-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">
                      {isGeneratingImgB
                        ? "AI đang vẽ diện mạo cho Nhân vật B..."
                        : "Đang tải ảnh lên máy chủ..."}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Image */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="file"
                  ref={fileInputRefB}
                  onChange={(e) => handleFileUpload(e, "char_b")}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRefB.current?.click()}
                  disabled={isUploadingB || isGeneratingImgB}
                  className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải ảnh lên</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInputB(!showUrlInputB)}
                  disabled={isUploadingB || isGeneratingImgB}
                  className="px-2.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-60"
                >
                  <Link className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dán link ảnh</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAIGenerateAppearance("char_b")}
                  disabled={isUploadingB || isGeneratingImgB}
                  className="px-2.5 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo bằng AI</span>
                </button>
              </div>

              {/* URL Input Box Collapsible */}
              {showUrlInputB && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/character-b.png"
                    value={tempUrlB}
                    onChange={(e) => setTempUrlB(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    onClick={() => handleSetUrl("char_b")}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700"
                  >
                    Gán
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields Character B */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên nhân vật:
                  </label>
                  <input
                    type="text"
                    value={charB.name}
                    onChange={(e) => setCharB({ ...charB, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Biệt danh:
                  </label>
                  <input
                    type="text"
                    value={charB.nickname}
                    onChange={(e) => setCharB({ ...charB, nickname: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Trang phục & Nhận diện ngoại hình:
                </label>
                <input
                  type="text"
                  value={charB.outfit}
                  onChange={(e) => setCharB({ ...charB, outfit: e.target.value })}
                  placeholder="Bộ bà ba đỏ chấm hoa nhí, quấn khăn đỏ..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Prompt mô tả ngoại hình cho AI (Prompt chi tiết):
                </label>
                <textarea
                  rows={2}
                  value={charB.appearancePrompt || ""}
                  onChange={(e) => setCharB({ ...charB, appearancePrompt: e.target.value })}
                  placeholder="Full body concept shot, cute 4-year-old Vietnamese boy toddler with red outfit..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-500" />
                    Giọng đọc Edge TTS:
                  </label>
                  <select
                    value={charB.voice || "vi-VN-NamMinhNeural"}
                    onChange={(e) => setCharB({ ...charB, voice: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="vi-VN-NamMinhNeural">👨 Nam Minh (Nam trầm ấm)</option>
                    <option value="vi-VN-HoaiMyNeural">👩 Hoài My (Nữ truyền cảm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Huy hiệu vai trò:
                  </label>
                  <input
                    type="text"
                    value={charB.badge}
                    onChange={(e) => setCharB({ ...charB, badge: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Câu nói cửa miệng / Signature Quote:
                </label>
                <input
                  type="text"
                  value={charB.signatureQuote}
                  onChange={(e) => setCharB({ ...charB, signatureQuote: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 italic text-slate-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WORKFLOW BOTTOM STEP NAVIGATION BAR */}
      {(onPrevStep || onNextStep) && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          {onPrevStep ? (
            <button
              type="button"
              onClick={onPrevStep}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại: Thêm Sản Phẩm (Bước 1)</span>
            </button>
          ) : <div />}

          {onNextStep && (
            <button
              type="button"
              onClick={onNextStep}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-2"
            >
              <span>Tiếp tục: Chọn Phối Cảnh (Bước 3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 p-2 rounded-xl max-w-lg max-h-[85vh] overflow-hidden flex flex-col items-center"
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-3 px-4 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold"
            >
              Đóng xem ảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
