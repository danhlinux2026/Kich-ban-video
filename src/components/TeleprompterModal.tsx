import React, { useState, useEffect, useRef } from "react";
import { TechScript } from "../types";
import { X, Play, Pause, RotateCcw, Type } from "lucide-react";

interface TeleprompterModalProps {
  script: TechScript;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  script,
  isOpen,
  onClose,
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = normal
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [countdown, setCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<any>(null);

  // Flatten all dialogues in chronological order
  const allLines = script.scenes.flatMap((s) =>
    s.dialogue.map((d) => ({
      ...d,
      sceneNumber: s.sceneNumber,
      timecode: s.timecode,
      phase: s.phase,
    }))
  );

  // Handle countdown before scrolling
  const startScrollWithCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setIsScrolling(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsScrolling(false);
      setCountdown(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isScrolling) {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      return;
    }

    scrollIntervalRef.current = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed * 1.5;
        // If reached bottom, stop
        if (
          containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight - 5
        ) {
          setIsScrolling(false);
        }
      }
    }, 30);

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isScrolling, scrollSpeed]);

  const handleReset = () => {
    setIsScrolling(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  const fontClass =
    fontSize === "sm" ? "text-lg" : fontSize === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
      {/* Top Bar Controls */}
      <div className="w-full max-w-4xl flex items-center justify-between py-3 px-5 bg-slate-900 border border-slate-800 rounded-t-xl text-white">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="font-bold text-sm sm:text-base text-slate-100">
            Máy Nhắc Chữ Lồng Tiếng (Teleprompter)
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            ({script.targetDuration})
          </span>
        </div>

        {/* Speed & Font sizing */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1 bg-slate-800 rounded-md p-1 text-xs border border-slate-700">
            <span className="text-slate-400 px-1 text-[11px]">Tốc độ:</span>
            {[0.75, 1, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setScrollSpeed(spd)}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  scrollSpeed === spd
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-slate-800 rounded-md p-1 text-xs border border-slate-700">
            <Type className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(["sm", "md", "lg"] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                  fontSize === sz
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Scrolling Body */}
      <div
        ref={containerRef}
        className="w-full max-w-4xl h-[65vh] bg-slate-950 border-x border-slate-800 overflow-y-auto px-6 sm:px-12 py-16 scrollbar-none relative text-center"
      >
        {/* Countdown overlay if active */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-slate-950/85 z-20 flex items-center justify-center">
            <div className="text-8xl font-black text-indigo-400 animate-ping">
              {countdown}
            </div>
          </div>
        )}

        <div className="space-y-12 max-w-2xl mx-auto">
          <div className="text-slate-500 text-xs uppercase tracking-widest font-mono">
            --- BẮT ĐẦU THU ÂM / DIỄN XUẤT ---
          </div>

          {allLines.map((line, idx) => {
            const isYellow = line.speaker.includes("Vàng");
            const isRed = line.speaker.includes("Đỏ");
            return (
              <div key={idx} className="space-y-2 group transition-all">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isYellow
                        ? "bg-amber-400 text-slate-950"
                        : isRed
                        ? "bg-rose-600 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {line.speaker}
                  </span>
                  <span className="text-slate-400 text-xs italic font-medium">
                    ({line.expression})
                  </span>
                </div>

                <p
                  className={`font-semibold leading-relaxed ${fontClass} ${
                    isYellow
                      ? "text-amber-200"
                      : isRed
                      ? "text-rose-200"
                      : "text-slate-100"
                  }`}
                >
                  "{line.line}"
                </p>

                <div className="text-[11px] text-slate-600 font-mono">
                  [Cảnh {line.sceneNumber} • {line.timecode}]
                </div>
              </div>
            );
          })}

          <div className="text-slate-500 text-xs uppercase tracking-widest font-mono pt-12">
            --- KẾT THÚC VIDEO ({script.targetDuration}) ---
          </div>
        </div>
      </div>

      {/* Bottom Floating Controls */}
      <div className="w-full max-w-4xl py-3 px-6 bg-slate-900 border border-slate-800 rounded-b-xl text-white flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Phím cách (Space) hoặc bấm nút để Bắt đầu / Tạm dừng
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Lên Đầu
          </button>

          {isScrolling ? (
            <button
              onClick={() => setIsScrolling(false)}
              className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Pause className="w-4 h-4 fill-current" />
              Tạm Dừng
            </button>
          ) : (
            <button
              onClick={startScrollWithCountdown}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Bắt Đầu Cuộn Chữ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
