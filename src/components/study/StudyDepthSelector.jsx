import { useLang } from "@/lib/LanguageContext";

const DEPTHS = [
  { id: "overview", key: "depthOverview" },
  { id: "detailed", key: "depthDetailed" },
  { id: "advanced", key: "depthAdvanced" },
];

export default function StudyDepthSelector({ depth, onChange }) {
  const { t } = useLang();
  return (
    <div className="flex rounded-xl p-1 bg-secondary border border-border">
      {DEPTHS.map((d) => (
        <button
          type="button"
          key={d.id}
          onClick={() => onChange(d.id)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-cinzel font-semibold transition-colors ${
            depth === d.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t[d.key]}
        </button>
      ))}
    </div>
  );
}