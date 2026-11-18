import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { UserPlus, Mail, Check, Loader2, Users, MessageSquare, Send, Minus, Plus } from "lucide-react";

const field = "w-full px-3 min-h-11 rounded-xl text-sm focus:outline-none bg-secondary border border-border text-foreground";

export default function PlanInvitePanel({ planTitle, planCategory }) {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadInvites();
    loadComments();
  }, [planTitle]);

  const loadInvites = async () => {
    const all = await base44.entities.PlanInvite.filter({ plan_title: planTitle }).catch(() => []);
    setInvites(all?.items || all || []);
  };

  const loadComments = async () => {
    const all = await base44.entities.PlanProgressComment.filter({ plan_title: planTitle }).catch(() => []);
    const list = all?.items || all || [];
    setComments([...list].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
  };

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await base44.entities.PlanInvite.create({
        plan_title: planTitle, plan_category: planCategory, invitee_email: email.trim(),
        inviter_name: user?.full_name || "A friend", message: message.trim() || `Join me in the "${planTitle}" reading plan!`, status: "pending",
      });
      await base44.integrations.Core.SendEmail({
        to: email.trim(), subject: `You've been invited to join "${planTitle}"`,
        body: `${user?.full_name || "A friend"} has invited you to join the "${planTitle}" reading plan on Veritas.\n\n${message || "Come grow in the Word together!"}\n\nOpen the Veritas app to get started.`,
      }).catch(() => {});
      setSent(true); setEmail(""); setMessage(""); setShowForm(false);
      loadInvites();
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await base44.entities.PlanProgressComment.create({
        plan_title: planTitle, day: selectedDay, comment_text: commentText.trim(),
        author_name: user?.full_name || "Anonymous", author_email: user?.email || "",
      });
      setCommentText("");
      loadComments();
    } finally {
      setPosting(false);
    }
  };

  const dayComments = comments.filter((c) => c.day === selectedDay);
  const stepBtn = "w-7 h-7 rounded-full flex items-center justify-center bg-secondary text-foreground";

  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-card border border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="font-cinzel text-sm font-semibold text-foreground truncate">{t.s1StudyTogether}</p>
          </div>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-primary text-primary-foreground text-xs font-cinzel font-semibold flex-shrink-0">
            <UserPlus className="w-3.5 h-3.5" /> {t.s6Invite}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2 pt-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t.s1FriendEmail} className={field} style={{ fontSize: 16 }} />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.s1PersonalMsg} rows={2} className={`${field} py-2 resize-none`} style={{ fontSize: 16 }} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 min-h-10 rounded-xl bg-secondary text-foreground text-xs font-cinzel">{t.s1Cancel}</button>
                <button type="button" onClick={sendInvite} disabled={!email.trim() || sending} className="flex-1 min-h-10 rounded-xl bg-primary text-primary-foreground text-xs font-cinzel font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} {t.s1SendInvite}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sent && <p className="flex items-center gap-1.5 text-xs text-success pt-2"><Check className="w-3.5 h-3.5" /> {t.s1InviteSent}</p>}

        {invites.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border space-y-1">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-2">
                <p className="text-xs text-foreground/85 truncate">{inv.invitee_email}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize flex-shrink-0">{inv.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-card border border-border p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="font-cinzel text-sm font-semibold text-foreground truncate">{t.s6Comments}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0" aria-label={t.s6Day}>
            <button type="button" aria-label="-" onClick={() => setSelectedDay((d) => Math.max(1, d - 1))} className={stepBtn}><Minus className="w-3.5 h-3.5" /></button>
            <span className="min-w-[3.25rem] text-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold uppercase">{t.s6Day} {selectedDay}</span>
            <button type="button" aria-label="+" onClick={() => setSelectedDay((d) => d + 1)} className={stepBtn}><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto mb-2">
          {dayComments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">{t.s6NoComments.replace("{n}", selectedDay)}</p>
          ) : dayComments.map((c) => (
            <div key={c.id} className="rounded-lg bg-secondary px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-cinzel text-xs font-semibold text-foreground truncate">{c.author_name}</p>
                <p className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(c.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
              </div>
              <p className="text-xs text-foreground/85 leading-snug">{c.comment_text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && postComment()}
            placeholder={t.s6CommentPh.replace("{n}", selectedDay)} className={field} style={{ fontSize: 16 }} />
          <button type="button" onClick={postComment} disabled={!commentText.trim() || posting} aria-label="Send"
            className="w-11 min-h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 flex-shrink-0">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}