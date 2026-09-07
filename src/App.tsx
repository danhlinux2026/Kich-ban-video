import React, { useState } from "react";
import { PRESET_SCRIPTS, DEFAULT_SCENE_SETTINGS } from "./data/presets";
import { TechScript, CharacterProfile, SceneSetting } from "./types";
import { Header } from "./components/Header";
import { CharacterCard } from "./components/CharacterCard";
import { CharacterManager } from "./components/CharacterManager";
import { TimelinePlayer } from "./components/TimelinePlayer";
import { StoryboardView } from "./components/StoryboardView";
import { TeleprompterModal } from "./components/TeleprompterModal";
import { CustomScriptGenerator } from "./components/CustomScriptGenerator";
import { ExportModal } from "./components/ExportModal";
import { PromptAssistant } from "./components/PromptAssistant";
import { FlowchartDiagram } from "./components/FlowchartDiagram";
import { LLMSettingsModal } from "./components/LLMSettingsModal";
import { ProductSection } from "./components/ProductSection";
import { SceneSettingSection } from "./components/SceneSettingSection";
import {
  Clapperboard,
  Sparkles,
  Users,
  PlayCircle,
  Tv,
  GitBranch,
  MapPin,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function App() {
  const getInitialScripts = (): TechScript[] => {
    let baseList = PRESET_SCRIPTS;
    try {
      const savedCustom = localStorage.getItem("scriptai_custom_scripts");
      if (savedCustom) {
        const parsedCustom: TechScript[] = JSON.parse(savedCustom);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          baseList = [...parsedCustom, ...PRESET_SCRIPTS];
        }
      }
      const savedChars = localStorage.getItem("scriptai_character_config");
      if (savedChars) {
        const parsedChars: CharacterProfile[] = JSON.parse(savedChars);
        if (Array.isArray(parsedChars) && parsedChars.length >= 2) {
          baseList = baseList.map((s) => ({
            ...s,
            characters: parsedChars,
          }));
        }
      }
    } catch (e) {}
    return baseList;
  };

  const getInitialSceneSettings = (): SceneSetting[] => {
    try {
      const saved = localStorage.getItem("scriptai_scene_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SCENE_SETTINGS;
  };

  const [scripts, setScripts] = useState<TechScript[]>(getInitialScripts);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(PRESET_SCRIPTS[0].id);
  const [sceneSettings, setSceneSettings] = useState<SceneSetting[]>(getInitialSceneSettings);
  const [selectedSettingId, setSelectedSettingId] = useState<string>(DEFAULT_SCENE_SETTINGS[0].id);

  const [activeTab, setActiveTab] = useState<
    "products" | "characters" | "scenes" | "storyboard" | "timeline" | "prompts" | "flowchart"
  >("storyboard");

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"script" | "image" | "video">("script");

  const openSettings = (tab?: "script" | "image" | "video") => {
    if (tab) setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const currentScript = scripts.find((s) => s.id === selectedScriptId) || scripts[0];
  const currentSceneSetting =
    sceneSettings.find((s) => s.id === (currentScript.sceneSetting?.id || selectedSettingId)) ||
    sceneSettings[0] ||
    DEFAULT_SCENE_SETTINGS[0];

  const handleScriptGenerated = (newScript: TechScript) => {
    const enriched = {
      ...newScript,
      sceneSetting: currentSceneSetting,
    };
    setScripts([enriched, ...scripts]);
    setSelectedScriptId(enriched.id);
    setActiveTab("storyboard");
    try {
      const saved = localStorage.getItem("scriptai_custom_scripts");
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem("scriptai_custom_scripts", JSON.stringify([enriched, ...list]));
    } catch (e) {}
  };

  const handleUpdateCurrentProduct = (updated: {
    productName: string;
    productCategory: string;
    coreBenefit: string;
    productImageUrl?: string;
    productBrand?: string;
  }) => {
    setScripts((prev) =>
      prev.map((s) =>
        s.id === selectedScriptId
          ? {
              ...s,
              productName: updated.productName,
              productCategory: updated.productCategory,
              coreBenefit: updated.coreBenefit,
              productImageUrl: updated.productImageUrl,
              productBrand: updated.productBrand,
            }
          : s
      )
    );
  };

  const handleAddNewProductScript = (newScript: TechScript) => {
    const enriched = {
      ...newScript,
      sceneSetting: currentSceneSetting,
    };
    setScripts((prev) => [enriched, ...prev]);
    setSelectedScriptId(enriched.id);
    setActiveTab("characters");
    try {
      const saved = localStorage.getItem("scriptai_custom_scripts");
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem("scriptai_custom_scripts", JSON.stringify([enriched, ...list]));
    } catch (e) {}
  };

  const handleDeleteCustomScript = (scriptId: string) => {
    setScripts((prev) => {
      const filtered = prev.filter((s) => s.id !== scriptId);
      if (selectedScriptId === scriptId && filtered.length > 0) {
        setSelectedScriptId(filtered[0].id);
      }
      return filtered;
    });
    try {
      const saved = localStorage.getItem("scriptai_custom_scripts");
      if (saved) {
        const list: TechScript[] = JSON.parse(saved);
        localStorage.setItem(
          "scriptai_custom_scripts",
          JSON.stringify(list.filter((s) => s.id !== scriptId))
        );
      }
    } catch (e) {}
  };

  const handleUpdateCharacters = (updatedChars: CharacterProfile[]) => {
    setScripts((prev) =>
      prev.map((s) =>
        s.id === selectedScriptId
          ? {
              ...s,
              characters: updatedChars,
            }
          : s
      )
    );
    try {
      localStorage.setItem("scriptai_character_config", JSON.stringify(updatedChars));
    } catch (e) {}
  };

  const handleSelectSceneSetting = (setting: SceneSetting) => {
    setSelectedSettingId(setting.id);
    setScripts((prev) =>
      prev.map((s) =>
        s.id === selectedScriptId
          ? {
              ...s,
              sceneSetting: setting,
            }
          : s
      )
    );
  };

  const handleUpdateSceneSetting = (updated: SceneSetting) => {
    const nextList = sceneSettings.map((s) => (s.id === updated.id ? updated : s));
    setSceneSettings(nextList);
    if (selectedSettingId === updated.id) {
      handleSelectSceneSetting(updated);
    }
    try {
      localStorage.setItem("scriptai_scene_settings", JSON.stringify(nextList));
    } catch (e) {}
  };

  const handleAddNewSceneSetting = (newSetting: SceneSetting) => {
    const nextList = [newSetting, ...sceneSettings];
    setSceneSettings(nextList);
    handleSelectSceneSetting(newSetting);
    try {
      localStorage.setItem("scriptai_scene_settings", JSON.stringify(nextList));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        scripts={scripts}
        currentScriptId={selectedScriptId}
        onSelectScript={setSelectedScriptId}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => openSettings("script")}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main 4-Step Production Pipeline Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                ★
              </span>
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Quy Trình 4 Bước Sản Xuất Video Triệu View
                </h3>
                <p className="text-[11px] text-slate-500">
                  Lần lượt chọn Sản Phẩm → Nhân Vật → Phối Cảnh → Bảng Storyboard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              <button
                id="step-btn-1-product"
                onClick={() => setActiveTab("products")}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                  activeTab === "products"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>1. Sản Phẩm</span>
                </div>
                {currentScript.productName && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === "products" ? "text-indigo-200" : "text-emerald-600"}`} />
                )}
              </button>

              <button
                id="step-btn-2-character"
                onClick={() => setActiveTab("characters")}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                  activeTab === "characters"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Nhân Vật</span>
                </div>
                {currentScript.characters?.length >= 2 && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === "characters" ? "text-indigo-200" : "text-emerald-600"}`} />
                )}
              </button>

              <button
                id="step-btn-3-scene"
                onClick={() => setActiveTab("scenes")}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                  activeTab === "scenes"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>3. Phối Cảnh</span>
                </div>
                {currentSceneSetting?.name && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === "scenes" ? "text-indigo-200" : "text-emerald-600"}`} />
                )}
              </button>

              <button
                id="step-btn-4-storyboard"
                onClick={() => setActiveTab("storyboard")}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-all ${
                  activeTab === "storyboard"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>4. Storyboard</span>
                </div>
                <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === "storyboard" ? "text-indigo-200" : "text-emerald-600"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preset Script Switcher Bar (Quick Selection) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chọn Kịch Bản Mẫu Cho Sản Phẩm Công Nghệ:
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Tối ưu cho định dạng video ngắn 30s - 60s
              </span>
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                + Tạo Mới Bằng AI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {scripts.map((script) => {
              const isSelected = script.id === selectedScriptId;
              return (
                <button
                  key={script.id}
                  id={`select-script-pill-${script.id}`}
                  onClick={() => setSelectedScriptId(script.id)}
                  className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-50/60 border-indigo-500 ring-1 ring-indigo-500 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {script.targetDuration}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {script.productCategory}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug line-clamp-2 text-slate-900">
                    {script.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {script.productName}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <button
              id="tab-storyboard"
              onClick={() => setActiveTab("storyboard")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "storyboard"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              <span>Storyboard</span>
            </button>

            <button
              id="tab-products"
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sản Phẩm</span>
            </button>

            <button
              id="tab-characters"
              onClick={() => setActiveTab("characters")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "characters"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Bộ Đôi Nhân Vật</span>
            </button>

            <button
              id="tab-scenes"
              onClick={() => setActiveTab("scenes")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "scenes"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Phối Cảnh Không Gian</span>
            </button>

            <button
              id="tab-timeline"
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "timeline"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Tiến Trình ({currentScript.targetDuration})</span>
            </button>

            <button
              id="tab-prompts"
              onClick={() => setActiveTab("prompts")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "prompts"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>AI Video Prompts</span>
            </button>

            <button
              id="tab-flowchart"
              onClick={() => setActiveTab("flowchart")}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                activeTab === "flowchart"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Sơ Đồ Quy Trình</span>
            </button>
          </div>

          <div className="hidden md:flex items-center text-xs text-slate-500 font-medium shrink-0 ml-2">
            <span>Sản phẩm: <strong className="text-slate-800">{currentScript.productName}</strong></span>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="space-y-6">
          {activeTab === "products" && (
            <div className="space-y-6">
              <ProductSection
                currentScript={currentScript}
                allScripts={scripts}
                onSelectScript={setSelectedScriptId}
                onUpdateCurrentProduct={handleUpdateCurrentProduct}
                onAddNewProductScript={handleAddNewProductScript}
                onDeleteCustomScript={handleDeleteCustomScript}
                onOpenGenerator={() => setIsGeneratorOpen(true)}
                onOpenSettings={() => openSettings("script")}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("characters")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Tiếp tục: Cấu hình Nhân vật</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "scenes" && (
            <div className="space-y-6">
              <SceneSettingSection
                currentSetting={currentSceneSetting}
                activeSetting={currentSceneSetting}
                allSettings={sceneSettings}
                onSelectSetting={handleSelectSceneSetting}
                onUpdateSetting={handleUpdateSceneSetting}
                onAddNewSetting={handleAddNewSceneSetting}
                onOpenSettings={() => openSettings("image")}
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTab("characters")}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  ← Quay lại: Bước 2 Nhân vật
                </button>
                <button
                  onClick={() => setActiveTab("storyboard")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Tiếp tục: Xem Bảng Phân Cảnh (Storyboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {activeTab === "storyboard" && (
            <div className="space-y-6">
              {/* Quick Character Bar Reminder */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {currentScript.characters?.[0]?.avatarUrl ? (
                      <img
                        src={currentScript.characters[0].avatarUrl}
                        alt="Character A"
                        className="w-9 h-9 rounded-full object-cover border-2 border-white ring-2 ring-amber-400 shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-white shrink-0">
                        A
                      </span>
                    )}

                    {currentScript.characters?.[1]?.avatarUrl ? (
                      <img
                        src={currentScript.characters[1].avatarUrl}
                        alt="Character B"
                        className="w-9 h-9 rounded-full object-cover border-2 border-white ring-2 ring-rose-400 shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs border border-white shrink-0">
                        B
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <span>Bộ đôi diễn xuất:</span>
                      <span className="text-amber-700 font-bold">
                        {currentScript.characters?.[0]?.name || "Nhân vật A"}
                      </span>
                      <span>&</span>
                      <span className="text-rose-700 font-bold">
                        {currentScript.characters?.[1]?.name || "Nhân vật B"}
                      </span>
                      {(currentScript.characters?.[0]?.avatarUrl || currentScript.characters?.[1]?.avatarUrl) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                          Đã có ảnh mốc AI
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      <strong>{currentScript.characters?.[0]?.name || "A"}:</strong> {currentScript.characters?.[0]?.personality || "Quan sát, cà khịa"} • <strong>{currentScript.characters?.[1]?.name || "B"}:</strong> {currentScript.characters?.[1]?.personality || "Đam mê công nghệ"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab("characters")}
                    className="px-3 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Cấu hình & Đổi ảnh nhân vật</span>
                  </button>
                  <button
                    onClick={() => setIsTeleprompterOpen(true)}
                    className="px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                  >
                    Mở Máy Nhắc Chữ
                  </button>
                </div>
              </div>

              <StoryboardView script={currentScript} onOpenSettings={openSettings} />
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-6">
              <TimelinePlayer
                scenes={currentScript.scenes}
                durationString={currentScript.targetDuration}
              />
              <StoryboardView script={currentScript} onOpenSettings={openSettings} />
            </div>
          )}

          {activeTab === "characters" && (
            <div className="space-y-6">
              {/* Character Manager: Choose Character A and B, add/generate reference images */}
              <CharacterManager
                characters={currentScript.characters}
                onUpdateCharacters={handleUpdateCharacters}
                onOpenSettings={() => openSettings("image")}
              />

              {/* Character Overview Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-800">
                    Bản Tóm Tắt Diễn Xuất Cho Kịch Bản Này
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Tương thích với TTS & AI Video Prompt
                  </span>
                </div>
                <CharacterCard
                  characters={currentScript.characters}
                  onEditCharacters={() => {
                    const el = document.getElementById("character-config-a");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3 border border-slate-800">
                <h4 className="font-bold text-sm text-indigo-400">
                  4 Quy Tắc Vàng Giữ Chân Người Xem Ngay Từ Giây Đầu Tiên
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                    <strong className="text-indigo-300 block mb-1">1. Hook 3 Giây Bằng Cú Tông Hoặc Né Cực Nghệ</strong>
                    <p className="text-slate-300 leading-relaxed">
                      Mở đầu bằng câu hét: "Ê nhìn đường kìa!" và tiếng va chạm "BONK!" hoặc cú phanh kít chân. Đừng mở màn bằng giới thiệu sản phẩm hay logo nhàm chán.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                    <strong className="text-indigo-300 block mb-1">2. Tiếng Cười Lây Lan (Laughter Effect)</strong>
                    <p className="text-slate-300 leading-relaxed">
                      Tiếng cười nắc nẻ của Bé Áo Vàng đóng vai trò xua tan không khí căng thẳng, tạo cảm giác giải trí thuần túy khiến người xem không bấm lướt qua.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                    <strong className="text-indigo-300 block mb-1">3. Sản Phẩm Xuất Hiện Như Vị Cứu Tinh</strong>
                    <p className="text-slate-300 leading-relaxed">
                      Sản phẩm giải quyết trực tiếp nỗi đau vừa xảy ra: Màn hình không chói ngoài nắng, Kính AI cảnh báo trước mắt, Ốp titan rơi không vỡ, Tai nghe nghe rõ bạn gọi.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700">
                    <strong className="text-indigo-300 block mb-1">4. Cú Twist Đối Xứng Ở Đuôi Video</strong>
                    <p className="text-slate-300 leading-relaxed">
                      Kết thúc bằng việc Bé Áo Vàng mượn máy rồi tự mình dính chấu hoặc giật máy chạy trốn để tạo cảm xúc thỏa mãn và kích thích người xem để lại bình luận tương tác.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "prompts" && (
            <div className="space-y-6">
              <PromptAssistant />
              <StoryboardView script={currentScript} />
            </div>
          )}

          {activeTab === "flowchart" && (
            <FlowchartDiagram script={currentScript} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div>
            Studio Kịch Bản Video Ngắn Công Nghệ (30s - 60s) • Lấy cảm hứng từ 2 nhân vật nhí viral
          </div>
          <div className="flex items-center space-x-3">
            <span>Thời lượng chuẩn: <strong className="text-slate-700">30s, 45s, 60s</strong></span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">Tối ưu cho TikTok, Reels & Shorts</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomScriptGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onScriptGenerated={handleScriptGenerated}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <TeleprompterModal
        script={currentScript}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      <ExportModal
        script={currentScript}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <LLMSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsTab}
      />
    </div>
  );
}
