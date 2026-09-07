import React, { useState, useEffect } from "react";
import {
  LLMConfig,
  ImageModelConfig,
  VideoModelConfig,
  AIStudioConfig,
} from "../types";
import {
  Settings,
  Key,
  Globe,
  Cpu,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Info,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
  ExternalLink,
  Mic,
  Subtitles,
  Music,
  Clock,
  Zap,
} from "lucide-react";

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: AIStudioConfig) => void;
  defaultTab?: "script" | "image" | "video";
}

export const AGNES_V1 = "https://apihub.agnes-ai.com/v1";
export const STORAGE_KEY_MULTI = "scriptai_multi_model_config";
export const STORAGE_KEY_LEGACY = "scriptai_llm_custom_config";

export function withAgnesEndpoints(c: AIStudioConfig): AIStudioConfig {
  return {
    ...c,
    scriptLLM: {
      ...c.scriptLLM,
      endpointUrl:
        c.scriptLLM.provider === "agnes" &&
        (!c.scriptLLM.endpointUrl || c.scriptLLM.endpointUrl.trim() === "")
          ? AGNES_V1
          : c.scriptLLM.endpointUrl,
    },
    textToImage: {
      ...c.textToImage,
      endpointUrl:
        c.textToImage.provider === "agnes" &&
        (!c.textToImage.endpointUrl || c.textToImage.endpointUrl.trim() === "")
          ? AGNES_V1
          : c.textToImage.endpointUrl,
    },
    textToVideo: {
      ...c.textToVideo,
      endpointUrl:
        c.textToVideo.provider === "agnes" &&
        (!c.textToVideo.endpointUrl || c.textToVideo.endpointUrl.trim() === "")
          ? AGNES_V1
          : c.textToVideo.endpointUrl,
    },
  };
}

export const DEFAULT_CONFIG: AIStudioConfig = {
  scriptLLM: {
    provider: "agnes",
    modelName: "agnes-2.5-flash",
    apiKey: "",
    endpointUrl: AGNES_V1,
    temperature: 0.7,
  },
  textToImage: {
    provider: "agnes",
    modelName: "agnes-image-2.5-flash",
    apiKey: "",
    endpointUrl: AGNES_V1,
    aspectRatio: "9:16",
    imageStyle: "photorealistic",
  },
  textToVideo: {
    provider: "agnes",
    modelName: "agnes-video-2.5-flash",
    apiKey: "",
    endpointUrl: AGNES_V1,
    motionMode: "image-to-video",
    cameraMotion: "camera tracks sideways",
    clipDurationMode: "auto",
    ttsVoice: "dialogue_duo",
    autoSubtitles: true,
    backgroundMusicUrl: "",
  },
};

export const LLMSettingsModal: React.FC<LLMSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultTab = "script",
}) => {
  const [activeTab, setActiveTab] = useState<"script" | "image" | "video">(defaultTab);
  const [config, setConfig] = useState<AIStudioConfig>(DEFAULT_CONFIG);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved config on open
  useEffect(() => {
    if (isOpen) {
      try {
        const savedMulti = localStorage.getItem(STORAGE_KEY_MULTI);
        if (savedMulti) {
          const parsed = JSON.parse(savedMulti);
          setConfig(withAgnesEndpoints(parsed));
        } else {
          // Backward compatibility check
          const savedLegacy = localStorage.getItem(STORAGE_KEY_LEGACY);
          if (savedLegacy) {
            const parsedLegacy = JSON.parse(savedLegacy);
            setConfig((prev) =>
              withAgnesEndpoints({
                ...prev,
                scriptLLM: {
                  ...prev.scriptLLM,
                  provider: parsedLegacy.provider || "gemini",
                  endpointUrl: parsedLegacy.endpointUrl || "",
                  apiKey: parsedLegacy.apiKey || "",
                  modelName: parsedLegacy.modelName || "gemini-3.8-flash",
                },
              })
            );
          }
        }
      } catch (err) {
        console.error("Failed to load custom multi-model config:", err);
      }
      setIsSaved(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Handlers for Script LLM
  const handleScriptProviderChange = (newProvider: "agnes" | "gemini" | "openai" | "deepseek" | "custom") => {
    if (newProvider === "agnes") {
      setConfig((prev) => ({
        ...prev,
        scriptLLM: {
          ...prev.scriptLLM,
          provider: "agnes",
          endpointUrl: AGNES_V1,
          modelName: "agnes-2.5-flash",
        },
      }));
    } else if (newProvider === "gemini") {
      setConfig((prev) => ({
        ...prev,
        scriptLLM: {
          ...prev.scriptLLM,
          provider: "gemini",
          endpointUrl: "",
          modelName: "gemini-3.8-flash",
        },
      }));
    } else if (newProvider === "openai") {
      setConfig((prev) => ({
        ...prev,
        scriptLLM: {
          ...prev.scriptLLM,
          provider: "openai",
          endpointUrl: "https://api.openai.com/v1",
          modelName: "gpt-4o-mini",
        },
      }));
    } else if (newProvider === "deepseek") {
      setConfig((prev) => ({
        ...prev,
        scriptLLM: {
          ...prev.scriptLLM,
          provider: "deepseek",
          endpointUrl: "https://api.deepseek.com/v1",
          modelName: "deepseek-chat",
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        scriptLLM: {
          ...prev.scriptLLM,
          provider: "custom",
          endpointUrl: "http://localhost:11434/v1",
          modelName: "qwen2.5:7b",
        },
      }));
    }
  };

  // Handlers for Image Model
  const handleImageProviderChange = (newProvider: "agnes" | "openai" | "fal" | "flux" | "recraft" | "custom") => {
    if (newProvider === "agnes") {
      setConfig((prev) => ({
        ...prev,
        textToImage: {
          ...prev.textToImage,
          provider: "agnes",
          endpointUrl: AGNES_V1,
          modelName: "agnes-image-2.5-flash",
        },
      }));
    } else if (newProvider === "openai") {
      setConfig((prev) => ({
        ...prev,
        textToImage: {
          ...prev.textToImage,
          provider: "openai",
          endpointUrl: "https://api.openai.com/v1/images/generations",
          modelName: "dall-e-3",
        },
      }));
    } else if (newProvider === "flux" || newProvider === "fal") {
      setConfig((prev) => ({
        ...prev,
        textToImage: {
          ...prev.textToImage,
          provider: newProvider,
          endpointUrl: "https://fal.run/fal-ai/flux/schnell",
          modelName: "flux-schnell",
        },
      }));
    } else if (newProvider === "recraft") {
      setConfig((prev) => ({
        ...prev,
        textToImage: {
          ...prev.textToImage,
          provider: "recraft",
          endpointUrl: "https://external.api.recraft.ai/v1/images/generations",
          modelName: "recraft-v3",
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        textToImage: {
          ...prev.textToImage,
          provider: "custom",
          endpointUrl: "",
          modelName: "custom-image-model",
        },
      }));
    }
  };

  // Handlers for Video Model
  const handleVideoProviderChange = (newProvider: "agnes" | "kling" | "luma" | "runway" | "minimax" | "custom") => {
    if (newProvider === "agnes") {
      setConfig((prev) => ({
        ...prev,
        textToVideo: {
          ...prev.textToVideo,
          provider: "agnes",
          endpointUrl: AGNES_V1,
          modelName: "agnes-video-2.5-flash",
        },
      }));
    } else if (newProvider === "kling") {
      setConfig((prev) => ({
        ...prev,
        textToVideo: {
          ...prev.textToVideo,
          provider: "kling",
          endpointUrl: "",
          modelName: "kling-v1.5",
        },
      }));
    } else if (newProvider === "luma") {
      setConfig((prev) => ({
        ...prev,
        textToVideo: {
          ...prev.textToVideo,
          provider: "luma",
          endpointUrl: "",
          modelName: "luma-dream-machine",
        },
      }));
    } else if (newProvider === "runway") {
      setConfig((prev) => ({
        ...prev,
        textToVideo: {
          ...prev.textToVideo,
          provider: "runway",
          endpointUrl: "",
          modelName: "gen-3-alpha",
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        textToVideo: {
          ...prev.textToVideo,
          provider: "custom",
          endpointUrl: "",
          modelName: "custom-video-engine",
        },
      }));
    }
  };

  const handleSave = () => {
    const finalConfig = withAgnesEndpoints(config);
    try {
      localStorage.setItem(STORAGE_KEY_MULTI, JSON.stringify(finalConfig));
      // Save legacy format so CustomScriptGenerator remains compatible
      localStorage.setItem(
        STORAGE_KEY_LEGACY,
        JSON.stringify({
          provider: finalConfig.scriptLLM.provider,
          endpointUrl: finalConfig.scriptLLM.endpointUrl,
          apiKey: finalConfig.scriptLLM.apiKey,
          modelName: finalConfig.scriptLLM.modelName,
          temperature: finalConfig.scriptLLM.temperature,
        })
      );
      setIsSaved(true);
      onSave?.(finalConfig);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to save config to localStorage:", err);
    }
  };

  const handleResetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const isAgnesVideo = config.textToVideo.provider === "agnes";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cấu Hình AI Models & Video Pipeline</h3>
              <p className="text-xs text-slate-400">
                Thiết lập riêng cho Agnes AI, Script LLM, Text-to-Image và Text-to-Video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("script")}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "script"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Viết Kịch Bản (LLM)</span>
          </button>

          <button
            onClick={() => setActiveTab("image")}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "image"
                ? "border-pink-600 text-pink-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Tạo Ảnh (Text-to-Image)</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "video"
                ? "border-amber-600 text-amber-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>3. Tạo Video & Dựng (FFmpeg)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* TAB 1: SCRIPT LLM */}
          {activeTab === "script" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Model này đảm nhận vai trò đạo diễn biên kịch: phân tích sản phẩm, tạo 5 cảnh quay với nhịp điệu nhanh và viết lời thoại hài hước cho Bé Áo Vàng & Bé Áo Đỏ.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nhà cung cấp (Provider):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => handleScriptProviderChange("agnes")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.scriptLLM.provider === "agnes"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">Agnes AI</span>
                    <span className="text-[10px] text-slate-400 font-normal">agnes-2.5-flash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScriptProviderChange("gemini")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.scriptLLM.provider === "gemini"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Google Gemini</span>
                    <span className="text-[10px] text-slate-400 font-normal">Mặc định server</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScriptProviderChange("deepseek")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.scriptLLM.provider === "deepseek"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">DeepSeek</span>
                    <span className="text-[10px] text-slate-400 font-normal">V3 / R1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScriptProviderChange("openai")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.scriptLLM.provider === "openai"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">OpenAI</span>
                    <span className="text-[10px] text-slate-400 font-normal">gpt-4o-mini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScriptProviderChange("custom")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.scriptLLM.provider === "custom"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Custom/Ollama</span>
                    <span className="text-[10px] text-slate-400 font-normal">OpenAI format</span>
                  </button>
                </div>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Endpoint URL:</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config.scriptLLM.endpointUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        scriptLLM: { ...prev.scriptLLM, endpointUrl: e.target.value },
                      }))
                    }
                    placeholder="https://apihub.agnes-ai.com/v1"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">API Key:</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={config.scriptLLM.apiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        scriptLLM: { ...prev.scriptLLM, apiKey: e.target.value },
                      }))
                    }
                    placeholder={
                      config.scriptLLM.provider === "agnes"
                        ? "Nhập Agnes API Token (ví dụ: agnes-...)"
                        : "Nhập API key của bạn..."
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Model Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Tên Model (Model Name):</label>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config.scriptLLM.modelName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        scriptLLM: { ...prev.scriptLLM, modelName: e.target.value },
                      }))
                    }
                    placeholder="agnes-2.5-flash"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE MODEL */}
          {activeTab === "image" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-100 flex items-start gap-2.5 text-xs text-pink-900">
                <ImageIcon className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Model tạo ảnh chịu trách nhiệm tạo khung hình mốc (Keyframe 9:16) giữ nguyên trang phục áo hoa nhí và khăn quấn của 2 bé, làm mốc mồi (Image Reference) cho model video không bị lệch mặt.
                </p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nhà cung cấp tạo ảnh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleImageProviderChange("agnes")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToImage.provider === "agnes"
                        ? "border-pink-600 bg-pink-50 text-pink-700 shadow-xs ring-1 ring-pink-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">Agnes Image</span>
                    <span className="text-[10px] text-slate-400 font-normal">2.5-flash 1K</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleImageProviderChange("openai")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToImage.provider === "openai"
                        ? "border-pink-600 bg-pink-50 text-pink-700 shadow-xs ring-1 ring-pink-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">OpenAI</span>
                    <span className="text-[10px] text-slate-400 font-normal">DALL-E 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleImageProviderChange("flux")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToImage.provider === "flux"
                        ? "border-pink-600 bg-pink-50 text-pink-700 shadow-xs ring-1 ring-pink-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">FLUX.1</span>
                    <span className="text-[10px] text-slate-400 font-normal">Fal.ai Schnell</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleImageProviderChange("recraft")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToImage.provider === "recraft"
                        ? "border-pink-600 bg-pink-50 text-pink-700 shadow-xs ring-1 ring-pink-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Recraft V3</span>
                    <span className="text-[10px] text-slate-400 font-normal">Vector & Photo</span>
                  </button>
                </div>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Endpoint URL:</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config.textToImage.endpointUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToImage: { ...prev.textToImage, endpointUrl: e.target.value },
                      }))
                    }
                    placeholder="https://apihub.agnes-ai.com/v1"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">API Key Tạo Ảnh:</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={config.textToImage.apiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToImage: { ...prev.textToImage, apiKey: e.target.value },
                      }))
                    }
                    placeholder="API Key tạo ảnh..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Model & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Tên Model:</label>
                  <input
                    type="text"
                    value={config.textToImage.modelName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToImage: { ...prev.textToImage, modelName: e.target.value },
                      }))
                    }
                    placeholder="agnes-image-2.5-flash"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Tỷ lệ khung hình:</label>
                  <select
                    value={config.textToImage.aspectRatio}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToImage: {
                          ...prev.textToImage,
                          aspectRatio: e.target.value as "9:16" | "16:9" | "1:1",
                        },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                  >
                    <option value="9:16">9:16 (Dọc TikTok / Reels / Shorts - Chuẩn)</option>
                    <option value="16:9">16:9 (Ngang Youtube)</option>
                    <option value="1:1">1:1 (Vuông Instagram / Facebook)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEO MODEL & COMPOSE PIPELINE */}
          {activeTab === "video" && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                <VideoIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="leading-relaxed font-medium">
                    Công cụ sinh chuyển động video 5s–10s và tự động dựng video hoàn chỉnh (Edge TTS tiếng Việt + Phụ đề TikTok).
                  </p>
                  <p className="text-[11px] text-amber-800">
                    💡 Với <strong>Agnes AI</strong>: Tích hợp sẵn cơ chế tự động chờ hạ nhiệt (Retry 35s) khi gặp rate limit 429 và chuẩn hóa URL gốc.
                  </p>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nhà cung cấp Video:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVideoProviderChange("agnes")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToVideo.provider === "agnes"
                        ? "border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" /> Agnes Video
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Free KM & 2.5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVideoProviderChange("kling")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToVideo.provider === "kling"
                        ? "border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Kling AI</span>
                    <span className="text-[10px] text-slate-400 font-normal">Kuaishou</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVideoProviderChange("luma")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToVideo.provider === "luma"
                        ? "border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Luma Dream</span>
                    <span className="text-[10px] text-slate-400 font-normal">Dream Machine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVideoProviderChange("runway")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      config.textToVideo.provider === "runway"
                        ? "border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold">Runway ML</span>
                    <span className="text-[10px] text-slate-400 font-normal">Gen-3 Alpha</span>
                  </button>
                </div>
              </div>

              {/* Agnes Specific Model Selector */}
              {isAgnesVideo && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chọn Model Agnes Video:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: { ...prev.textToVideo, modelName: "agnes-video-2.5-flash" },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        config.textToVideo.modelName === "agnes-video-2.5-flash"
                          ? "border-amber-600 bg-white text-amber-950 ring-1 ring-amber-600 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="block">2.5 Flash</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          FREE KM
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        720P • ~1 clip/phút
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: { ...prev.textToVideo, modelName: "agnes-video-v2.0" },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        config.textToVideo.modelName === "agnes-video-v2.0"
                          ? "border-amber-600 bg-white text-amber-950 ring-1 ring-amber-600 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="block">v2.0</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          FREE KM
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        720P • ti2vid mode
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: { ...prev.textToVideo, modelName: "agnes-video-2.5" },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        config.textToVideo.modelName === "agnes-video-2.5"
                          ? "border-amber-600 bg-white text-amber-950 ring-1 ring-amber-600 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="block">2.5 Chuẩn</strong>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          $0.025/s
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Tới 1080P/2K
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Endpoint URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Endpoint URL:</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config.textToVideo.endpointUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToVideo: { ...prev.textToVideo, endpointUrl: e.target.value },
                      }))
                    }
                    placeholder="https://apihub.agnes-ai.com/v1"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">API Key Video:</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={config.textToVideo.apiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        textToVideo: { ...prev.textToVideo, apiKey: e.target.value },
                      }))
                    }
                    placeholder="API Key video..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Non-Agnes Mode Selector (Hidden for Agnes as requested in item 7) */}
              {!isAgnesVideo && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Chế độ tạo:</label>
                    <select
                      value={config.textToVideo.motionMode}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: {
                            ...prev.textToVideo,
                            motionMode: e.target.value as "image-to-video" | "text-to-video",
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="image-to-video">Image-to-Video (Khuyên dùng)</option>
                      <option value="text-to-video">Text-to-Video (Thuần câu lệnh)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Chuyển động máy quay:</label>
                    <input
                      type="text"
                      value={config.textToVideo.cameraMotion}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: { ...prev.textToVideo, cameraMotion: e.target.value },
                        }))
                      }
                      placeholder="camera tracks sideways, whip pan"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: COMPOSE & VOICE SETTINGS (Item 6.2) */}
              <div className="pt-4 border-t border-slate-200 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                  Cấu hình Dựng Video Hoàn Chỉnh (Edge TTS & Phụ Đề)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Voice Selector */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Giọng đọc lồng tiếng (Voice):</label>
                    <select
                      value={config.textToVideo.ttsVoice || "dialogue_duo"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: {
                            ...prev.textToVideo,
                            ttsVoice: e.target.value as any,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                    >
                      <option value="dialogue_duo">🎭 Phân vai theo nhân vật (Bé Vàng: Hoài My, Bé Đỏ: Nam Minh)</option>
                      <option value="vi-VN-HoaiMyNeural">👩 Chỉ dùng Bé Áo Vàng / Nữ (Hoài My)</option>
                      <option value="vi-VN-NamMinhNeural">👨 Chỉ dùng Bé Áo Đỏ / Nam (Nam Minh)</option>
                    </select>
                  </div>

                  {/* Clip Duration Mode (Item 4.4) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Thời lượng từng clip:</label>
                    <select
                      value={config.textToVideo.clipDurationMode || "auto"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: {
                            ...prev.textToVideo,
                            clipDurationMode: e.target.value as any,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                    >
                      <option value="auto">⏱ Tự động theo kịch bản (Clamped 4-12s - Khuyên dùng)</option>
                      <option value="fixed_5s">Cố định 5 giây/cảnh</option>
                      <option value="fixed_10s">Cố định 10 giây/cảnh</option>
                    </select>
                  </div>
                </div>

                {/* Subtitles & Music */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Subtitles className="w-3.5 h-3.5 text-indigo-600" /> Tự động gắn phụ đề TikTok
                      </span>
                      <p className="text-[10px] text-slate-500">Chữ trắng viền đen tương phản cao</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.textToVideo.autoSubtitles !== false}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: {
                            ...prev.textToVideo,
                            autoSubtitles: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Background Music URL */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-slate-400" /> URL Nhạc nền MP3 (Tuỳ chọn):
                    </label>
                    <input
                      type="text"
                      value={config.textToVideo.backgroundMusicUrl || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textToVideo: { ...prev.textToVideo, backgroundMusicUrl: e.target.value },
                        }))
                      }
                      placeholder="https://.../music.mp3 (hoặc để trống)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu Cấu Hình</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
