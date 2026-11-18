import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { UserPlus, Mail, Check, Loader2, X, Users, MessageSquare, Send } from "lucide-react";

export default function PlanInvitePanel({ planTitle, planCategory, accentColor = "#00f5ff" }) {
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
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    loadInvites();
    loadComments();
  }, [planTitle]);

  const loadInvites = async () => {
    try {
      const all = await base44.entities.PlanInvite.filter({ plan_title: planTitle });
      setInvites(all || []);
    } catch {}
  };

  const loadComments = async () => {
    try {
      const all = await base44.entities.PlanProgressComment.filter({ plan_title: planTitle });
      setComments((all || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch {}
  };

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await base44.entities.PlanInvite.create({
        plan_title: planTitle,
        plan_category: planCategory,
        invitee_email: email.trim(),
        inviter_name: user?.full_name || "A friend",
        message: message.trim() || `Join me in the "${planTitle}" reading plan!`,
        status: "pending",
      });
      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: `You've been invited to join "${planTitle}"`,
        body: `${user?.full_name || "A friend"} has invited you to join the "${planTitle}" reading plan on Veritas.\n\n${message || "Come grow in the Word together!"}\n\nOpen the Veritas app to get started.`,
      }).catch(() => {});
      setSent(true);
      setEmail("");
      setMessage("");
      setShowForm(false);
      loadInvites();
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  };

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      await base44.entities.PlanProgressComment.create({
        plan_title: planTitle,
        day: selectedDay,
        comment_text: commentText.trim(),
        author_name: user?.full_name || "Anonymous",
        author_email: user?.email || "",
      });
      setCommentText("");
      loadComments();
    } finally {
      setPostingComment(false);
    }
  };

  const dayComments = comments.filter(c => c.day === selectedDay);

  return (
    <div className="space-y-4 mt-4">
      {/* Invite Section */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: accentColor }} />
            <p className="font-cinzel text-sm font-semibold text-white">Study Together</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-xs"
            style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }}>
            <UserPlus className="w-3.5 h-3.5" /> Invite
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-4 space-y-3">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Friend's email address"
                className="w-full px-3 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }} />
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Personal message (optional)" rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm font-inter resize-none focus:outline-none"
                style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }} />
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-xl font-cinzel text-xs"
                  style={{ background: "var(--fill-2)", color: "rgba(255,255,255,0.35)" }}>Cancel</button>
                <button onClick={sendInvite} disabled={!email.trim() || sending}
                  className="flex-1 py-2 rounded-xl font-cinzel text-xs flex items-center justify-center gap-1.5 transition-all"
                  style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30`, opacity: !email.trim() ? 0.5 : 1 }}>
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Send Invite
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sent && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <Check className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
            <p className="text-xs font-cinzel" style={{ color: "#34d399" }}>Invite sent!</p>
          </div>
        )}

        {invites.length > 0 && (
          <div className="px-4 pb-3 space-y-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-cinzel uppercase tracking-widest pt-3 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Pending Invites</p>
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-1.5">
                <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.55)" }}>{inv.invitee_email}</p>
                <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: inv.status === "accepted" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.06)",
                    color: inv.status === "accepted" ? "#34d399" : "rgba(255,255,255,0.35)",
                  }}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Comments */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 px-4 py-3">
          <MessageSquare className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <p className="font-cinzel text-sm font-semibold text-white">Progress Comments</p>
        </div>

        {/* Day selector */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Day</p>
            <input type="number" min={1} value={selectedDay} onChange={e => setSelectedDay(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 rounded-lg text-sm font-cinzel focus:outline-none text-center"
              style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa" }} />
          </div>

          {/* Comments list */}
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide mb-3">
            {dayComments.length === 0 ? (
              <p className="text-xs font-inter text-center py-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                No comments for Day {selectedDay} yet. Be the first!
              </p>
            ) : dayComments.map(c => (
              <div key={c.id} className="rounded-xl px-3 py-2.5"
                style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-cinzel text-xs" style={{ color: "#a78bfa" }}>{c.author_name}</p>
                  <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {new Date(c.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{c.comment_text}</p>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && postComment()}
              placeholder={`Comment on Day ${selectedDay}...`}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-inter focus:outline-none"
              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(167,139,250,0.18)", color: "rgba(255,255,255,0.8)" }} />
            <button onClick={postComment} disabled={!commentText.trim() || postingComment}
              className="px-3 py-2 rounded-xl transition-all"
              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)", opacity: !commentText.trim() ? 0.5 : 1 }}>
              {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}