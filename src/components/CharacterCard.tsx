import React from "react";
import { CharacterProfile } from "../types";
import { Sparkles, MessageCircle, Heart, Volume2, Image, Edit3 } from "lucide-react";

interface CharacterCardProps {
  characters?: CharacterProfile[];
  onEditCharacters?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  characters = [],
  onEditCharacters,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(characters || []).map((char, index) => {
        const isYellow = char?.name?.includes("Vàng") || index === 0;
        const voiceLabel =
          char?.voice === "vi-VN-NamMinhNeural"
            ? "Nam Minh (Trầm ấm)"
            : "Hoài My (Truyền cảm)";

        return (
          <div
            key={char?.name || index}
            id={`character-card-${isYellow ? "yellow" : "red"}`}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header Badge & Image Thumbnail */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {/* Avatar: if image exists display photo, else letter badge */}
                  {char?.avatarUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-2xs shrink-0 bg-slate-900">
                      <img
                        src={char.avatarUrl}
                        alt={char?.name || "Nhân vật"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isYellow
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {isYellow ? "A" : "B"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-800">
                        {char?.name || (isYellow ? "Bé Áo Vàng" : "Bé Áo Đỏ")}
                      </h3>
                      {char?.avatarUrl && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đã có ảnh mốc AI" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {char?.nickname || (isYellow ? "Nhân vật A" : "Nhân vật B")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isYellow
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {char.badge}
                  </span>

                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    {voiceLabel}
                  </span>
                </div>
              </div>

              {/* Quote bubble styled like Professional Polish dialogue */}
              <div
                className={`p-3 rounded-r-lg border-l-4 text-xs font-medium italic flex items-start gap-2 ${
                  isYellow
                    ? "bg-amber-50 text-slate-800 border-amber-400"
                    : "bg-rose-50 text-slate-800 border-rose-400"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                <span>"{char.signatureQuote}"</span>
              </div>

              {/* Attributes list */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">Trang phục:</span>
                  <span className="text-slate-600">{char.outfit}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">Tính cách:</span>
                  <span className="text-slate-600">{char.personality}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">Nhiệm vụ:</span>
                  <span className="text-slate-600">{char.roleInVideo}</span>
                </div>
                {char.appearancePrompt && (
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                      <Image className="w-3 h-3 text-indigo-500" />
                      Mô tả AI:
                    </span>
                    <span className="text-slate-500 text-[11px] line-clamp-2 italic">
                      {char.appearancePrompt}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction tip & edit action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                Độ ăn ý: <strong className="text-slate-800">Cực kỳ hài hước</strong>
              </span>

              {onEditCharacters && (
                <button
                  onClick={onEditCharacters}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Chỉnh sửa & Thêm ảnh
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
