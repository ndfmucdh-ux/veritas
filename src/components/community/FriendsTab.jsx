import { useState, useEffect } from "react";
import { Search, UserPlus, Check, X, Loader2, UserMinus } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import Avatar from "@/components/community/Avatar";

const pill = "flex items-center gap-1.5 px-3.5 min-h-9 rounded-full text-xs font-cinzel font-semibold flex-shrink-0 disabled:opacity-60";

function Row({ name, children }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border">
      <Avatar name={name} />
      <p className="flex-1 min-w-0 truncate font-cinzel text-sm font-semibold text-foreground">{name}</p>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <section className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-1">{title}{count != null ? ` · ${count}` : ""}</p>
      {children}
    </section>
  );
}

// Search for people, answer requests and manage friends.
export default function FriendsTab({ data, reload }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (q.trim().length < 2) { setResults(null); return undefined; }
    setSearching(true);
    const timer = setTimeout(() => {
      community("friends.search", { q })
        .then((r) => setResults(r.results))
        .catch(() => setError(t.cmErr))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  const run = async (key, fn) => {
    setBusy(key);
    setError("");
    try { await fn(); await reload(); } catch { setError(t.cmErr); } finally { setBusy(null); }
  };

  const setStatus = (userId, status) => setResults((rs) => rs && rs.map((x) => (x.userId === userId ? { ...x, status } : x)));
  const addFriend = (u) => run(u.userId, async () => { const r = await community("friends.request", { userId: u.userId }); setStatus(u.userId, r.status); });
  const respond = (f, accept) => run(f.id, () => community("friends.respond", { friendshipId: f.id, accept }));
  const remove = (f) => {
    if (confirmId !== f.id) { setConfirmId(f.id); setTimeout(() => setConfirmId(null), 3000); return; }
    run(f.id, () => community("friends.remove", { friendshipId: f.id }));
  };

  const Spin = <Loader2 className="w-3.5 h-3.5 animate-spin" />;

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.cmSearchPh} aria-label={t.cmFindFriends}
            className="w-full min-h-12 rounded-full pl-10 pr-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" style={{ fontSize: 16 }} />
        </div>
        {q.trim().length < 2 && !results && <p className="text-xs text-muted-foreground px-2">{t.cmSearchHint}</p>}
        {searching && <p className="flex items-center gap-2 text-xs text-muted-foreground px-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> …</p>}
        {results && !searching && results.length === 0 && <p className="text-sm text-muted-foreground px-2">{t.cmNoResults}</p>}
        {results && results.map((u) => (
          <Row key={u.userId} name={u.name}>
            {u.status === "none" && <button type="button" disabled={busy === u.userId} onClick={() => addFriend(u)} className={`${pill} bg-primary text-primary-foreground`}>{busy === u.userId ? Spin : <UserPlus className="w-3.5 h-3.5" />}{t.cmAdd}</button>}
            {u.status === "outgoing" && <span className={`${pill} bg-secondary text-muted-foreground`}><Check className="w-3.5 h-3.5" />{t.cmRequested}</span>}
            {u.status === "incoming" && <button type="button" disabled={busy === u.userId} onClick={() => addFriend(u)} className={`${pill} bg-primary text-primary-foreground`}><Check className="w-3.5 h-3.5" />{t.cmAccept}</button>}
            {u.status === "friends" && <span className={`${pill} bg-secondary text-primary`}><Check className="w-3.5 h-3.5" />{t.cmFriendsLabel}</span>}
          </Row>
        ))}
        {error && <p className="text-xs text-destructive px-2">{error}</p>}
      </section>

      {data.incoming.length > 0 && (
        <Section title={t.cmRequests} count={data.incoming.length}>
          {data.incoming.map((f) => (
            <Row key={f.id} name={f.name}>
              <button type="button" disabled={busy === f.id} onClick={() => respond(f, true)} className={`${pill} bg-primary text-primary-foreground`}>{busy === f.id ? Spin : <Check className="w-3.5 h-3.5" />}{t.cmAccept}</button>
              <button type="button" disabled={busy === f.id} onClick={() => respond(f, false)} aria-label={t.cmDecline} className={`${pill} bg-secondary text-foreground px-3`}><X className="w-3.5 h-3.5" /></button>
            </Row>
          ))}
        </Section>
      )}

      {data.outgoing.length > 0 && (
        <Section title={t.cmSent} count={data.outgoing.length}>
          {data.outgoing.map((f) => (
            <Row key={f.id} name={f.name}>
              <button type="button" disabled={busy === f.id} onClick={() => run(f.id, () => community("friends.remove", { friendshipId: f.id }))} className={`${pill} bg-secondary text-foreground`}>{t.cmCancelReq}</button>
            </Row>
          ))}
        </Section>
      )}

      <Section title={t.cmMyFriends} count={data.friends.length}>
        {data.friends.length === 0 && <p className="text-sm text-muted-foreground px-1">{t.cmNoFriends}</p>}
        {data.friends.map((f) => (
          <Row key={f.id} name={f.name}>
            <button type="button" disabled={busy === f.id} onClick={() => remove(f)} aria-label={t.cmRemove}
              className={`${pill} ${confirmId === f.id ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground"}`}>
              <UserMinus className="w-3.5 h-3.5" />{confirmId === f.id ? t.cmTapAgain : t.cmRemove}
            </button>
          </Row>
        ))}
      </Section>
    </div>
  );
}