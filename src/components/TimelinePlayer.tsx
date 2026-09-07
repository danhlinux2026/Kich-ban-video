import React, { useState, useEffect, useRef } from "react";
import { Scene } from "../types";
import { Play, Pause, RotateCcw, Volume2, Video, Eye, Radio } from "lucide-react";

interface TimelinePlayerProps {
  scenes: Scene[];
  durationString: string;
}

export const TimelinePlayer: React.FC<TimelinePlayerProps> = ({ scenes, durationString }) => {
  // Calculate total seconds from scenes
  const totalSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Determine current active scene based on currentTime
  let accumulated = 0;
  let activeSceneIndex = 0;
  for (let i = 0; i < scenes.length; i++) {
    const sceneDuration = scenes[i].durationSeconds;
    if (currentTime >= accumulated && currentTime < accumulated + sceneDuration) {
      activeSceneIndex = i;
      break;
    }
    accumulated += sceneDuration;
    if (i === scenes.length - 1) {
      activeSceneIndex = i;
    }
  }

  const currentScene = scenes[activeSceneIndex] || scenes[0];

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    lastTickRef.current = Date.now();

    const loop = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalSeconds) {
          setIsPlaying(false);
          return totalSeconds;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, totalSeconds]);

  const togglePlay = () => {
    if (currentTime >= totalSeconds) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const jumpToScene = (index: number) => {
    let t = 0;
    for (let i = 0; i < index; i++) {
      t += scenes[i].durationSeconds;
    }
    setCurrentTime(t);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const s = Math.min(Math.floor(secs), totalSeconds);
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `00:${ss}`;
  };

  const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

  return (
    <div
      id="timeline-player-container"
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-600" />
            Mô Phỏng Tiến Trình Video ({durationString})
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-600">
          <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
            {formatTime(currentTime)}
          </span>
          <span className="text-slate-400">/</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
            {formatTime(totalSeconds)}
          </span>
        </div>
      </div>

      {/* Timeline Visual Bar with Scene blocks */}
      <div className="relative pt-2">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex relative border border-slate-200">
          {scenes.map((scene, idx) => {
            const widthPct = (scene.durationSeconds / totalSeconds) * 100;
            const isSceneActive = idx === activeSceneIndex;
            return (
              <div
                key={scene.sceneNumber}
                onClick={() => jumpToScene(idx)}
                style={{ width: `${widthPct}%` }}
                title={`Cảnh ${scene.sceneNumber}: ${scene.phase}`}
                className={`h-full border-r border-white/60 cursor-pointer transition-colors relative ${
                  isSceneActive ? "bg-indigo-600" : "bg-slate-200 hover:bg-slate-300"
                }`}
              />
            );
          })}
        </div>

        {/* Needle / Progress head */}
        <div
          className="absolute top-1.5 -ml-2.5 w-4 h-4 bg-slate-900 border-2 border-white rounded-full shadow-sm cursor-pointer transition-all flex items-center justify-center pointer-events-none"
          style={{ left: `${Math.min(progressPercent, 100)}%` }}
        >
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </div>
      </div>

      {/* Scene Quick Switcher Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {scenes.map((sc, idx) => {
          const isCurr = idx === activeSceneIndex;
          return (
            <button
              key={sc.sceneNumber}
              id={`jump-scene-${sc.sceneNumber}`}
              onClick={() => jumpToScene(idx)}
              className={`px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium transition-all text-left flex items-center gap-1.5 shrink-0 text-xs ${
                isCurr
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCurr ? "bg-white" : "bg-slate-400"}`} />
              <span>Cảnh {sc.sceneNumber}: {sc.phase}</span>
              <span className="text-[10px] opacity-80">({sc.durationSeconds}s)</span>
            </button>
          );
        })}
      </div>

      {/* Live Stage Display */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-3">
          {/* Phase Badge & Shot info */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500 text-white font-bold tracking-wide text-[11px] uppercase">
                {currentScene.phase}
              </span>
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-slate-400" />
                {currentScene.shotType}
              </span>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">
              Khung giờ: {currentScene.timecode}
            </span>
          </div>

          {/* Visual description */}
          <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed bg-slate-800/90 p-3.5 rounded-lg border border-slate-700/80">
            <p className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
              <span>{currentScene.visual}</span>
            </p>
          </div>

          {/* Active Dialogues */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Lời thoại nhân vật:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentScene.dialogue.map((dlg, dIdx) => {
                const isYellow = dlg.speaker.includes("Vàng");
                const isRed = dlg.speaker.includes("Đỏ");
                return (
                  <div
                    key={dIdx}
                    className={`p-3 rounded-r-lg border-l-4 text-xs space-y-1 transition-all ${
                      isYellow
                        ? "bg-slate-800 border-amber-400 text-amber-100"
                        : isRed
                        ? "bg-slate-800 border-rose-400 text-rose-100"
                        : "bg-slate-800 border-indigo-400 text-indigo-100"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span
                        className={
                          isYellow
                            ? "text-amber-300"
                            : isRed
                            ? "text-rose-300"
                            : "text-indigo-300"
                        }
                      >
                        {dlg.speaker}:
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        {dlg.expression}
                      </span>
                    </div>
                    <p className="font-medium text-white text-sm">
                      "{dlg.line}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SFX & Camera note */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>SFX: <strong className="text-slate-300">{currentScene.sfxMusic}</strong></span>
            </div>
            {currentScene.cameraMovement && (
              <span className="italic text-slate-400 text-[11px]">
                Góc máy: {currentScene.cameraMovement}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-2">
          <button
            id="play-pause-btn"
            onClick={togglePlay}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold shadow-xs transition-colors gap-2 ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Tạm Dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Chạy Thử Kịch Bản
              </>
            )}
          </button>
          <button
            id="reset-timeline-btn"
            onClick={handleReset}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            title="Quay lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Nhấn các nút phân cảnh để nhảy nhanh đến đoạn cao trào.
        </div>
      </div>
    </div>
  );
};
