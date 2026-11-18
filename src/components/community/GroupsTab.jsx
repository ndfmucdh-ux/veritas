import { useState, useEffect } from "react";
import { Plus, Search, Users, Check, X } from "lucide-react";
import { LoadingState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import GroupCard, { GROUP_CATEGORIES } from "@/components/community/GroupCard";
import GroupCreateSheet from "@/components/community/GroupCreateSheet";
import GroupDetail from "@/components/community/GroupDetail";

const chip = (on) => `flex-shrink-0 px-3.5 min-h-9 rounded-full text-xs whitespace-nowrap border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/80 border-border"}`;

// My groups, invitations and a place to discover public groups.
export default function GroupsTab({ data, reload }) {
  const { t } = useLang();
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [found, setFound] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const loadFound = () => community("groups.discover", { q, category: cat }).then((r) => setFound(r.groups)).catch(() => setError(t.cmErr));

  useEffect(() => {
    const timer = setTimeout(loadFound, 300);
    return () => clearTimeout(timer);
  }, [q, cat, data.groups.length]);

  const run = async (key, fn) => {
    setBusy(key);
    setError("");
    try { await fn(); } catch { setError(t.cmErr); } finally { setBusy(null); }
  };

  const join = (g) => run(g.id, async () => { await community("groups.join", { groupId: g.id }); await reload(); setOpenId(g.id); });
  const answerInvite = (inv, accept) => run(inv.id, async () => {
    const r = await community("groups.respondInvite", { inviteId: inv.id, accept });
    await reload();
    if (accept) setOpenId(r.groupId);
  });

  if (openId) {
    return <GroupDetail groupId={openId} onBack={() => { setOpenId(null); reload(); }} />;
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => setCreating(true)}
        className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {t.cmCreate}
      </button>
      {error && <p className="text-xs text-destructive px-2">{error}</p>}

      {data.invites.length > 0 && (
        <section className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-1">{t.cmInvites} · {data.invites.length}</p>
          {data.invites.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-primary/40">
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-sm font-semibold text-foreground truncate">{inv.groupName}</p>
                <p className="text-xs text-muted-foreground truncate">{t.cmInvitedBy.replace("{name}", inv.fromName)}</p>
              </div>
              <button type="button" disabled={busy === inv.id} onClick={() => answerInvite(inv, true)} className="flex items-center gap-1 px-3.5 min-h-9 rounded-full text-xs font-cinzel font-semibold bg-primary text-primary-foreground"><Check className="w-3.5 h-3.5" />{t.cmAccept}</button>
              <button type="button" disabled={busy === inv.id} onClick={() => answerInvite(inv, false)} aria-label={t.cmDecline} className="w-9 h-9 rounded-full bg-secondary text-foreground flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-1">{t.cmMyGroups} · {data.groups.length}</p>
        {data.groups.length === 0 ? (
          <div className="rounded-2xl p-5 bg-card border border-border text-center"><Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" strokeWidth={1.2} /><p className="text-sm text-muted-foreground">{t.cmNoMyGroups}</p></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {data.groups.map((g) => <GroupCard key={g.id} group={g} actionLabel={t.cmOpen} onAction={() => setOpenId(g.id)} />)}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground px-1">{t.cmDiscover}</p>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.cmSearchGroups} aria-label={t.cmSearchGroups}
            className="w-full min-h-11 rounded-full pl-10 pr-4 bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" style={{ fontSize: 16 }} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button type="button" onClick={() => setCat("all")} className={chip(cat === "all")}>{t.cmAllTypes}</button>
          {GROUP_CATEGORIES.map((c) => <button key={c.id} type="button" onClick={() => setCat(c.id)} className={chip(cat === c.id)}>{t[c.key]}</button>)}
        </div>
        {found === null ? <LoadingState label={t.cmFinding} size="md" minHeight={100} /> : found.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1">{t.cmNoGroups}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {found.map((g) => <GroupCard key={g.id} group={g} actionLabel={t.cmJoin} busy={busy === g.id} onAction={() => join(g)} />)}
          </div>
        )}
      </section>

      {creating && <GroupCreateSheet onClose={() => setCreating(false)} onCreated={async (id) => { setCreating(false); await reload(); setOpenId(id); }} />}
    </div>
  );
}