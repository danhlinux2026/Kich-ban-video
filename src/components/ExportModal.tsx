import React, { useState } from "react";
import { TechScript } from "../types";
import { X, Copy, Check, FileText, Download } from "lucide-react";

interface ExportModalProps {
  script: TechScript;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ script, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# KỊCH BẢN VIDEO NGẮN CÔNG NGHỆ (${script.targetDuration})\n`;
    md += `**Tiêu đề**: ${script.title}\n`;
    md += `**Sản phẩm**: ${script.productName} (${script.productCategory})\n`;
    md += `**Thời lượng**: ${script.targetDuration}\n`;
    md += `**Câu Hook 3s đầu**: "${script.hookHeadline}"\n`;
    md += `**Lợi ích cốt lõi**: ${script.coreBenefit}\n\n`;

    md += `## NHÂN VẬT THAM GIA\n`;
    script.characters.forEach((c) => {
      md += `- **${c.name}** (${c.badge}): ${c.personality} - Câu cửa miệng: "${c.signatureQuote}"\n`;
    });
    md += `\n---\n\n`;

    md += `## BẢNG PHÂN CẢNH CHI TIẾT (SHOT-BY-SHOT)\n\n`;
    script.scenes.forEach((s) => {
      md += `### CẢNH ${s.sceneNumber}: ${s.phase} [${s.timecode} | ${s.durationSeconds}s]\n`;
      md += `- **Góc máy**: ${s.shotType}\n`;
      md += `- **Hình ảnh & Hành động**: ${s.visual}\n`;
      md += `- **Lời thoại**:\n`;
      s.dialogue.forEach((d) => {
        md += `  + **${d.speaker}** (${d.expression}): "${d.line}"\n`;
      });
      md += `- **Âm thanh & SFX**: ${s.sfxMusic}\n`;
      if (s.aiPrompt) {
        md += `- **Prompt AI Video**: \`${s.aiPrompt}\`\n`;
      }
      md += `\n`;
    });

    md += `---\n\n`;
    md += `## KÊU GỌI HÀNH ĐỘNG (CTA - 50s-60s)\n`;
    md += `- **Hình ảnh kết**: ${script.cta.visual}\n`;
    md += `- **Voice-over**: "${script.cta.voiceOver}"\n`;
    md += `- **Punchline 2 bé**: "${script.cta.punchline}"\n\n`;

    md += `## BÍ QUYẾT GIỮ CHÂN NGƯỜI XEM (VIRAL RETENTION)\n`;
    script.viralTips.forEach((tip) => {
      md += `- ${tip}\n`;
    });

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateMarkdown()], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `Kich_Ban_${script.id}_${script.targetDuration}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Xuất Kịch Bản Chi Tiết
              </h3>
              <p className="text-xs text-slate-500">Định dạng Markdown / In ấn ekip đạo diễn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50 font-mono text-xs leading-relaxed text-slate-700 border-b border-slate-200 select-all">
          <pre className="whitespace-pre-wrap font-sans text-slate-800 text-xs">
            {generateMarkdown()}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Có thể dán trực tiếp vào Notion, Google Docs hoặc gửi ekip quay.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Download className="w-4 h-4" />
              Tải File .md
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Đã Sao Chép!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Sao Chép Toàn Bộ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
