import React, { useState, useRef } from "react";
import { SceneSetting } from "../types";
import { DEFAULT_SCENE_SETTINGS } from "../data/presets";
import {
  MapPin,
  Sparkles,
  Camera,
  Sun,
  Palette,
  Check,
  Plus,
  Edit3,
  X,
  Upload,
  ArrowRight,
  ArrowLeft,
  Eye,
  Sliders,
  CheckCircle2,
  Info,
} from "lucide-react";

interface SceneSettingSectionProps {
  currentSetting?: SceneSetting;
  activeSetting?: SceneSetting;
  allSettings?: SceneSetting[];
  onSelectSetting: (setting: SceneSetting) => void;
  onUpdateSetting: (updated: SceneSetting) => void;
  onAddNewSetting: (newSetting: SceneSetting) => void;
  onOpenSettings?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

const CAMERA_ANGLES = [
  "Ngang tầm mắt trẻ con (Eye-level)",
  "Trung cảnh di chuyển theo bước chân (Tracking Shot)",
  "Cận cảnh chi tiết sản phẩm (Macro Close-up)",
  "Góc nhìn thứ nhất (POV trải nghiệm)",
  "Góc rộng toàn cảnh điện ảnh (Wide Cinematic)",
  "Góc xoay 360 độ quanh vật thể (Orbit Hero Shot)",
];

const COLOR_GRADES = [
  "Màu phim ấm áp, hoài niệm Đông Nam Á",
  "Tươi sáng, tự nhiên phong cách TVC gia đình",
  "Hiện đại, rực rỡ, độ tương phản cao",
  "Studio tối giản cao cấp (Clean Tech)",
  "Điện ảnh rực rỡ Cinematic 8k",
];

export const SceneSettingSection: React.FC<SceneSettingSectionProps> = ({
  currentSetting: propCurrentSetting,
  activeSetting: propActiveSetting,
  allSettings = DEFAULT_SCENE_SETTINGS,
  onSelectSetting,
  onUpdateSetting,
  onAddNewSetting,
  onOpenSettings,
  onNextStep,
  onPrevStep,
}) => {
  const currentSetting = propCurrentSetting || propActiveSetting || allSettings[0] || DEFAULT_SCENE_SETTINGS[0];

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Edit current setting state
  const [editName, setEditName] = useState(currentSetting?.name || "");
  const [editDesc, setEditDesc] = useState(currentSetting?.description || "");
  const [editPrompt, setEditPrompt] = useState(currentSetting?.environmentPrompt || "");
  const [editLighting, setEditLighting] = useState(currentSetting?.lighting || "");
  const [editCamera, setEditCamera] = useState(currentSetting?.cameraVibe || "");
  const [editAngle, setEditAngle] = useState(currentSetting?.cameraAngle || CAMERA_ANGLES[0]);
  const [editColor, setEditColor] = useState(currentSetting?.colorGrade || COLOR_GRADES[0]);
  const [editThumbnail, setEditThumbnail] = useState(currentSetting?.thumbnailUrl || "");

  // New setting state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newLighting, setNewLighting] = useState("Ánh sáng tự nhiên ban ngày, tươi tắn");
  const [newCamera, setNewCamera] = useState("Trung cảnh theo bước chân nhân vật");
  const [newAngle, setNewAngle] = useState(CAMERA_ANGLES[0]);
  const [newColor, setNewColor] = useState(COLOR_GRADES[0]);
  const [newThumbnail, setNewThumbnail] = useState("https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (currentSetting) {
      setEditName(currentSetting.name || "");
      setEditDesc(currentSetting.description || "");
      setEditPrompt(currentSetting.environmentPrompt || "");
      setEditLighting(currentSetting.lighting || "");
      setEditCamera(currentSetting.cameraVibe || "");
      setEditAngle(currentSetting.cameraAngle || CAMERA_ANGLES[0]);
      setEditColor(currentSetting.colorGrade || COLOR_GRADES[0]);
      setEditThumbnail(currentSetting.thumbnailUrl || "");
      setIsEditing(false);
    }
  }, [currentSetting?.id]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    onUpdateSetting({
      ...currentSetting,
      name: editName.trim(),
      description: editDesc.trim(),
      environmentPrompt: editPrompt.trim(),
      lighting: editLighting.trim(),
      cameraVibe: editCamera.trim(),
      cameraAngle: editAngle,
      colorGrade: editColor,
      thumbnailUrl: editThumbnail.trim() || currentSetting.thumbnailUrl,
    });
    setIsEditing(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSettingItem: SceneSetting = {
      id: `custom-setting-${Date.now()}`,
      name: newName.trim(),
      category: "custom",
      description: newDesc.trim() || "Phối cảnh tùy chỉnh theo ý muốn",
      environmentPrompt: newPrompt.trim() || `${newName.trim()}, highly detailed, cinematic environment, 8k resolution.`,
      lighting: newLighting.trim(),
      cameraVibe: newCamera.trim(),
      cameraAngle: newAngle,
      colorGrade: newColor,
      thumbnailUrl: newThumbnail.trim() || "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
      badge: "Tự cấu hình",
    };

    onAddNewSetting(newSettingItem);
    setIsAddingNew(false);
    resetNewForm();
  };

  const resetNewForm = () => {
    setNewName("");
    setNewDesc("");
    setNewPrompt("");
    setNewLighting("Ánh sáng tự nhiên ban ngày, tươi tắn");
    setNewCamera("Trung cảnh theo bước chân nhân vật");
    setNewThumbnail("https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80");
  };

  const filteredSettings = activeCategory === "all"
    ? allSettings
    : allSettings.filter((s) => s.category === activeCategory || (activeCategory === "custom" && s.category === "custom"));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-400/20 text-teal-200 border border-teal-300/30 uppercase tracking-wider">
                Bước 3 Trong Quy Trình
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Chọn Phối Cảnh & Không Gian Quay
              </h2>
            </div>
            <p className="text-xs text-teal-100/80 mt-1 max-w-2xl">
              Phối cảnh định hình địa điểm, ánh sáng và góc quay camera cho 5 phân cảnh. AI sẽ áp dụng phối cảnh này vào toàn bộ visual storyboard và video.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setIsEditing(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isAddingNew
                ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                : "bg-teal-500 hover:bg-teal-400 text-slate-950"
            }`}
          >
            {isAddingNew ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Đóng Form</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Phối Cảnh Mới</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ACTIVE SELECTED SETTING SHOWCASE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-5 items-start">
          {/* Large Scene Image Preview */}
          <div className="relative w-full lg:w-72 h-44 sm:h-52 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-200 shrink-0 group">
            <img
              src={currentSetting.thumbnailUrl}
              alt={currentSetting.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
            
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500 text-slate-950 flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đang Áp Dụng
              </span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                {currentSetting.badge || "Phối cảnh chính"}
              </span>
              <h3 className="text-sm font-bold truncate">{currentSetting.name}</h3>
            </div>
          </div>

          {/* Setting Parameters & Quick Modifiers */}
          <div className="flex-1 space-y-3.5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {currentSetting.name}
                  </h3>
                  {currentSetting.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {currentSetting.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentSetting.description}
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tùy Chỉnh Phối Cảnh Này</span>
                </button>
              )}
            </div>

            {/* Visual Specs Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  Ánh Sáng (Lighting)
                </span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {currentSetting.lighting}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-indigo-500" />
                  Góc Quay (Camera Angle)
                </span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {currentSetting.cameraAngle || currentSetting.cameraVibe}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-emerald-500" />
                  Tông Màu (Color Grade)
                </span>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                  {currentSetting.colorGrade || "Điện ảnh tự nhiên 8k"}
                </p>
              </div>
            </div>

            {/* AI Environment Prompt Preview */}
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/70 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  AI Prompt Phối Cảnh (Được tự động đưa vào kịch bản & Agnes Video):
                </span>
              </div>
              <p className="text-[11px] font-mono text-teal-950/80 leading-relaxed bg-white/80 p-2 rounded-lg border border-teal-100">
                {currentSetting.environmentPrompt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT CURRENT SETTING INLINE MODAL/DRAWER */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wide">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Chỉnh Sửa Phối Cảnh "{currentSetting.name}"</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tên Phối Cảnh</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Link Ảnh Minh Họa (URL)</label>
              <input
                type="text"
                value={editThumbnail}
                onChange={(e) => setEditThumbnail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Mô Tả Không Gian</label>
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Góc Quay Ưu Tiên</label>
              <select
                value={editAngle}
                onChange={(e) => setEditAngle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {CAMERA_ANGLES.map((ang) => (
                  <option key={ang} value={ang}>{ang}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tông Màu & Color Grade</label>
              <select
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {COLOR_GRADES.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Prompt Môi Trường AI (Tiếng Anh)</label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-2xs"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      )}

      {/* ADD NEW SETTING FORM */}
      {isAddingNew && (
        <form
          onSubmit={handleSaveNew}
          className="bg-teal-50/50 border border-teal-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-teal-200 pb-2">
            <div>
              <h3 className="text-xs font-bold text-teal-900 flex items-center gap-2 uppercase tracking-wide">
                <Plus className="w-3.5 h-3.5 text-teal-700" />
                <span>Thêm Phối Cảnh Mới Cho Video</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Tạo một không gian hoàn toàn mới phù hợp với sản phẩm của bạn
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Tên Phối Cảnh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Quán Cafe Rooftop Hoàng Hôn, Bếp Ăn Gia Đình Thông Minh..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Link Ảnh Minh Họa (URL)</label>
              <input
                type="text"
                value={newThumbnail}
                onChange={(e) => setNewThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Mô Tả Bối Cảnh</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="VD: Không gian quán cafe trên tầng thượng nhìn ngắm thành phố lúc hoàng hôn lung linh..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Góc Quay Ưu Tiên</label>
              <select
                value={newAngle}
                onChange={(e) => setNewAngle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {CAMERA_ANGLES.map((ang) => (
                  <option key={ang} value={ang}>{ang}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tông Màu</label>
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {COLOR_GRADES.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Prompt Môi Trường AI (Tiếng Anh)
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={2}
                placeholder="VD: aesthetic rooftop cafe at sunset, golden hour light, blurred city skyline, warm ambiance, 8k..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-200">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
            >
              Tạo Phối Cảnh & Chọn Luôn
            </button>
          </div>
        </form>
      )}

      {/* PRESET SETTINGS SELECTION GALLERY */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Thư Viện Phối Cảnh Có Sẵn (Bấm Để Chọn):
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Có {allSettings.length} phối cảnh sẵn sàng sử dụng
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSettings.map((setting) => {
            const isSelected = setting.id === currentSetting.id;

            return (
              <div
                key={setting.id}
                id={`scene-setting-card-${setting.id}`}
                onClick={() => onSelectSetting(setting)}
                className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-teal-50/40 border-teal-500 ring-2 ring-teal-500/30 shadow-md"
                    : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                }`}
              >
                {/* Card Thumbnail */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                  <img
                    src={setting.thumbnailUrl}
                    alt={setting.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    {setting.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-teal-300 backdrop-blur-xs border border-white/15">
                        {setting.badge}
                      </span>
                    )}
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500 text-slate-950 flex items-center gap-1 shadow-xs ml-auto">
                        <Check className="w-3 h-3" />
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h4 className="font-bold text-sm leading-snug drop-shadow-xs">
                      {setting.name}
                    </h4>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {setting.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">{setting.lighting}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Camera className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate">{setting.cameraAngle || setting.cameraVibe}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all text-center mt-2 ${
                      isSelected
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-700"
                    }`}
                  >
                    {isSelected ? "Đang Sử Dụng Phối Cảnh Này" : "Chọn Phối Cảnh Này"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WORKFLOW BOTTOM STEP NAVIGATION BAR */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {onPrevStep ? (
          <button
            type="button"
            onClick={onPrevStep}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại: Chọn Nhân Vật (Bước 2)</span>
          </button>
        ) : <div />}

        {onNextStep && (
          <button
            type="button"
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-2"
          >
            <span>Tiếp tục: Chọn & Tạo Kịch Bản (Bước 4)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
