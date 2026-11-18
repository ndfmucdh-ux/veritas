import { useState } from "react";
import { HandHeart, Loader2, Send, Trash2, CheckCircle2, MessageCircle } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";
import { community } from "@/lib/communityApi";
import Avatar from "@/components/community/Avatar";

// Group feed: share a message or a prayer request, pray for each other, mark answered.
export default function GroupFeed({ data, reload }) {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [kind, setKind] = useState("message");
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState(data.posts);
  const [error, setError] = useState("");
  const groupId = data.group.id;

  const guard = async (fn) => { setError(""); try { await fn(); } catch { setError(t.cmErr); reload(); } };

  const post = () => {
    if (!text.trim()) return;
    return guard(async () => {
      setPosting(true);
      try {
        await community("groups.post", { groupId, text, kind });
        setText("");
        await reload();
        const fresh = await community("groups.get", { groupId });
        setPosts(fresh.posts);
      } finally { setPosting(false); }
    });
  };

  const amen = (p) => {
    setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, amened: !x.amened, amenCount: x.amenCount + (x.amened ? -1 : 1) } : x)));
    return guard(() => community("groups.amen", { postId: p.id }));
  };
  const answered = (p) => {
    setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, answered: !x.answered } : x)));
    return guard(() => community("groups.answered", { postId: p.id }));
  };
  const remove = (p) => {
    setPosts((ps) => ps.filter((x) => x.id !== p.id));
    return guard(() => community("groups.deletePost", { postId: p.id }));
  };

  const kinds = [["message", t.cmMessageKind, MessageCircle], ["prayer", t.cmPrayerKind, HandHeart]];
  const owner = data.role === "owner";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-3 bg-card border border-border space-y-2">
        <div className="flex gap-1.5">
          {kinds.map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setKind(id)} aria-pressed={kind === id}
              className={`flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs border ${kind === id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground/80 border-border"}`}><Icon className="w-3.5 h-3.5" />{label}</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={1000} placeholder={t.cmWriteHint}
          className="w-full rounded-xl px-3 py-2 resize-none bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" style={{ fontSize: 16 }} />
        <div className="flex justify-end">
          <button type="button" onClick={post} disabled={posting || !text.trim()} className="flex items-center gap-1.5 px-5 min-h-10 rounded-full bg-primary text-primary-foreground text-sm font-cinzel font-semibold disabled:opacity-50">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t.cmPostBtn}
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {posts.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t.cmNoPosts}</p>}
      {posts.map((p) => (
        <article key={p.id} className="rounded-2xl p-3 bg-card border border-border">
          <div className="flex items-center gap-2.5">
            <Avatar name={p.authorName} className="w-8 h-8 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="font-cinzel text-sm font-semibold text-foreground truncate">{p.authorName}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(p.created_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric" })}{p.kind === "prayer" ? ` · ${t.cmPrayerKind}` : ""}</p>
            </div>
            {p.answered && <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full text-primary bg-primary/10 border border-primary/30"><CheckCircle2 className="w-3 h-3" />{t.cmAnswered}</span>}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 mt-2 whitespace-pre-wrap break-words">{p.text}</p>
          <div className="flex items-center gap-2 mt-2.5">
            <button type="button" onClick={() => amen(p)} aria-pressed={p.amened}
              className={`flex items-center gap-1.5 px-3.5 min-h-9 rounded-full text-xs font-cinzel border ${p.amened ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary text-foreground/80 border-border"}`}>
              <HandHeart className="w-3.5 h-3.5" />{p.kind === "prayer" ? t.cmPrayedFor : t.cmAmen} · {p.amenCount}
            </button>
            {p.kind === "prayer" && p.authorId === data.myId && (
              <button type="button" onClick={() => answered(p)} className="px-3 min-h-9 rounded-full text-xs bg-secondary text-foreground/80">{t.cmMarkAnswered}</button>
            )}
            {(p.authorId === data.myId || owner) && (
              <button type="button" onClick={() => remove(p)} aria-label={t.cmDeletePost} className="ml-auto w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}