import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BIBLE_BOOKS, getTranslatedBookName } from "@/lib/bibleData";
import { useLang } from "@/lib/LanguageContext";

const field = "w-full px-3 min-h-11 rounded-xl text-sm font-inter focus:outline-none";
const fieldStyle = { fontSize: 16, background: "var(--fill-2)", border: "1px solid var(--hairline)", color: "hsl(var(--foreground))" };
const label = "text-[10px] font-cinzel uppercase tracking-widest mb-1 block";

// Collects a real plan: name, one book, a chapter range and a duration.
export default function CommunityPlanForm({ onCreate }) {
  const { t, lang } = useLang();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [book, setBook] = useState("Psalms");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(30);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const max = BIBLE_BOOKS.find((b) => b.name === book)?.chapters || 1;
  const clampNum = (v, lo, hi) => Math.min(hi, Math.max(lo, parseInt(v) || lo));

  const changeBook = (b) => {
    const chapters = BIBLE_BOOKS.find((x) => x.name === b)?.chapters || 1;
    setBook(b);
    setFrom(1);
    setTo(chapters);
  };

  const submit = async () => {
    if (!name.trim()) return setError(t.s5NeedName);
    const start = clampNum(from, 1, max);
    const end = clampNum(to, start, max);
    const chapters = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setSaving(true);
    setError("");
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      plan_selections: [{ book, chapters }],
      plan_total_chapters: chapters.length,
      plan_days: clampNum(days, 1, 730),
    });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "hsl(var(--card))", border: "1px solid var(--hairline)" }}>
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.s5PlanName} className={field} style={fieldStyle} />
        {error && <p className="text-xs font-inter mt-1.5" style={{ color: "hsl(var(--destructive))" }}>{error}</p>}
      </div>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.s5PlanDesc} className={field} style={fieldStyle} />

      <div>
        <span className={label} style={{ color: "rgb(var(--ink) / 0.7)" }}>{t.s5Book}</span>
        <select value={book} onChange={(e) => changeBook(e.target.value)} className={field} style={fieldStyle}>
          {BIBLE_BOOKS.map((b) => <option key={b.name} value={b.name}>{getTranslatedBookName(b.name, lang)}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="min-w-0">
          <span className={label} style={{ color: "rgb(var(--ink) / 0.7)" }}>{t.s5From}</span>
          <input type="number" min={1} max={max} value={from} onChange={(e) => setFrom(e.target.value)} className={field} style={fieldStyle} />
        </div>
        <div className="min-w-0">
          <span className={label} style={{ color: "rgb(var(--ink) / 0.7)" }}>{t.s5To}</span>
          <input type="number" min={1} max={max} value={to} onChange={(e) => setTo(e.target.value)} className={field} style={fieldStyle} />
        </div>
        <div className="min-w-0">
          <span className={label} style={{ color: "rgb(var(--ink) / 0.7)" }}>{t.s5FinishIn}</span>
          <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className={field} style={fieldStyle} />
        </div>
      </div>

      <button type="button" onClick={submit} disabled={saving}
        className="w-full min-h-11 rounded-xl font-cinzel text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "#d9b77e", color: "#1a1408" }}>
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} {t.s5Create}
      </button>
    </div>
  );
}