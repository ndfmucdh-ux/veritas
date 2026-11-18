import { useState } from "react";
import { Crown, Loader2, UserPlus, LogOut, Trash2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { community } from "@/lib/communityApi";
import Avatar from "@/components/community/Avatar";

// Member list with plan progress, invitations for friends, leave or delete.
export default function GroupMembers({ data, reload, onGone }) {
  const { t } = useLang();
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const groupId = data.group.id;
  const owner = data.role === "owner";

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try { await fn(); } catch { setError(t.cmErr); } finally { setBusy(false); }
  };

  const invite = () => run(async () => {
    await Promise.all(picked.map((userId) => community("groups.invite", { groupId, userId })));
    setPicked([]);
    setSent(true);
    await reload();
  });

  const leave = () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
    run(async () => { await community(owner ? "groups.delete" : "groups.leave", { groupId }); onGone(); });
  };

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        {data.members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border">
            <Avatar name={m.name} />
            <div className="min-w-0 flex-1">
              <p className="font-cinzel text-sm font-semibold text-foreground truncate">{m.name}{m.userId === data.myId ? ` (${t.cmYou})` : ""}</p>
              {m.progress.total > 0 && <p className="text-[11px] text-muted-foreground">{t.cmChaptersDone.replace("{done}", m.progress.done).replace("{total}", m.progress.total)}</p>}
            </div>
            {m.role === "owner" && <Crown className="w-4 h-4 text-primary flex-shrink-0" aria-label={t.cmOwner} />}
          </div>
        ))}
      </section>

      <section className="rounded-2xl p-3 bg-card border border-border space-y-2">
        <p className="font-cinzel text-sm font-semibold text-foreground">{t.cmInviteFriends}</p>
        {data.invitable.length === 0 ? <p className="text-xs text-muted-foreground">{t.cmNoInvitable}</p> : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {data.invitable.map((u) => (
                <button key={u.userId} type="button" onClick={() => toggle(u.userId)} aria-pressed={picked.includes(u.userId)}
                  className={`px-3.5 min-h-9 rounded-full text-xs border ${picked.includes(u.userId) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/80 border-border"}`}>{u.name}</button>
              ))}
            </div>
            <button type="button" onClick={invite} disabled={busy || picked.length === 0}
              className="flex items-center gap-1.5 px-4 min-h-10 rounded-full bg-primary text-primary-foreground text-xs font-cinzel font-semibold disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{t.cmSendInvites}
            </button>
          </>
        )}
        {sent && <p className="text-xs text-primary">{t.cmInvitesSent}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </section>

      <button type="button" onClick={leave} disabled={busy}
        className={`w-full min-h-11 rounded-full text-sm font-cinzel flex items-center justify-center gap-2 border ${confirm ? "bg-destructive text-destructive-foreground border-destructive" : "bg-secondary text-muted-foreground border-border"}`}>
        {owner ? <Trash2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}{confirm ? t.cmTapAgain : owner ? t.cmDeleteGroup : t.cmLeave}
      </button>
    </div>
  );
}