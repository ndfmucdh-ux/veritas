import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SoftCard from "@/components/ui/SoftCard";
import AppButton from "@/components/ui/AppButton";
import { useLang } from "@/lib/LanguageContext";
import { getTranslatedBookName } from "@/lib/bibleData";

export default function RecentlyRead() {
  const { tr, lang } = useLang();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.entities.ReadingSession.filter({}, { sort: "-created_date", limit: 12 })
      .then((page) => {
        const seen = new Set();
        const unique = (page.items || []).filter((s) => {
          const k = `${s.book}:${s.chapter}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        if (alive) setItems(unique.slice(0, 4));
      })
      .catch(() => alive && setItems([])); // signed-out visitors simply see the empty state
    return () => { alive = false; };
  }, []);

  if (items === null) {
    return <div className="h-20 rounded-[var(--radius)] bg-secondary animate-pulse" style={{ minHeight: 80 }} />;
  }

  if (items.length === 0) {
    return (
      <SoftCard className="p-5 flex flex-col items-center text-center gap-3" style={{ minHeight: 120 }}>
        <p className="text-sm text-muted-foreground">{tr("home_recentlyReadEmpty")}</p>
        <AppButton to="/read">{tr("home_recentlyReadCta")}</AppButton>
      </SoftCard>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((s) => (
        <SoftCard
          key={`${s.book}:${s.chapter}`}
          as={Link}
          to={`/read?book=${encodeURIComponent(s.book)}&chapter=${s.chapter}${s.translation ? `&translation=${s.translation}` : ""}`}
          className="flex items-center gap-3 px-4 min-h-[60px] active:scale-[0.99]"
        >
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
          <span className="flex-1 min-w-0">
            <span className="block font-cinzel text-sm text-foreground truncate">
              {getTranslatedBookName(s.book, lang)} {s.chapter}
            </span>
            <span className="block text-[11px] text-muted-foreground">{s.translation}</span>
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </SoftCard>
      ))}
    </div>
  );
}