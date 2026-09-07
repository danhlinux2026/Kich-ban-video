import React from "react";
import { TechScript } from "../types";
import {
  Sparkles,
  Wand2,
  FileText,
  Mic,
  ChevronDown,
  Video,
  Settings,
} from "lucide-react";

interface HeaderProps {
  scripts: TechScript[];
  currentScriptId: string;
  onSelectScript: (id: string) => void;
  onOpenGenerator: () => void;
  onOpenTeleprompter: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scripts,
  currentScriptId,
  onSelectScript,
  onOpenGenerator,
  onOpenTeleprompter,
  onOpenExport,
  onOpenSettings,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            ScriptAI <span className="text-indigo-600">Pro</span>
          </span>
          <span className="hidden md:inline text-xs font-medium text-slate-400 border-l border-slate-200 pl-2">
            Kịch Bản Video Ngắn Công Nghệ (30s - 60s)
          </span>
        </div>
      </div>

      {/* Controls: AI-Sync status, Script selector & Action buttons */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* AI-Sync Active Badge from theme */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-slate-600">AI-Sync Active</span>
        </div>

        {/* Script selector dropdown */}
        <div className="relative">
          <select
            value={currentScriptId}
            onChange={(e) => onSelectScript(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer max-w-[150px] sm:max-w-[220px] truncate"
          >
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.targetDuration}] {s.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Action buttons */}
        <button
          onClick={onOpenTeleprompter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          title="Luyện tập lồng tiếng khớp nhịp thời gian"
        >
          <Mic className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Máy Nhắc Chữ</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          title="Sao chép kịch bản hoặc tải markdown"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Xuất File</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80"
          title="Cấu hình 3 Model riêng biệt: Viết kịch bản, Tạo ảnh (Text-to-Image) & Tạo video (Text/Image-to-Video)"
        >
          <Settings className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">AI Models</span>
        </button>

        <button
          onClick={onOpenGenerator}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Tạo Mới</span>
        </button>
      </div>
    </header>
  );
};
