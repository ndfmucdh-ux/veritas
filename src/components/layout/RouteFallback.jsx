import { useLang } from "@/lib/LanguageContext";

/** Calm skeleton shown while a lazily-loaded page chunk is fetched. Uses the app background. */
export default function RouteFallback() {
  const { t } = useLang();
  return (
    <div className="md:ml-16 min-h-[60vh] bg-background px-4 pt-6 max-w-2xl mx-auto space-y-4" role="status" aria-label={t.loading || "Loading"}>
      <div className="h-6 w-1/2 rounded-full bg-secondary animate-pulse" />
      <div className="h-48 rounded-[var(--radius)] bg-secondary animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-[var(--radius)] bg-secondary animate-pulse" />)}
      </div>
    </div>
  );
}