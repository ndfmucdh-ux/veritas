import { Download, FileText, Loader2, Sparkles } from "lucide-react";

export default function LibraryHeaderActions({ showAI, onToggleAI, exportingPdf, onExportPdf, exporting, onExportLibrary }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleAI}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-cinzel flex-shrink-0 transition-all"
        style={{ background: showAI ? "rgba(167,139,250,0.18)" : "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">AI</span>
      </button>
      <button
        type="button"
        onClick={onExportPdf}
        disabled={exportingPdf}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-cinzel flex-shrink-0 transition-all"
        style={{ background: "rgba(167,139,250,0.08)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
      >
        {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        <span className="hidden sm:inline">PDF</span>
      </button>
      <button
        type="button"
        onClick={onExportLibrary}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-cinzel flex-shrink-0 transition-all"
        style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.2)" }}
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span className="hidden sm:inline">Texto</span>
      </button>
    </div>
  );
}