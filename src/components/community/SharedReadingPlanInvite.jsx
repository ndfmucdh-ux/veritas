import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, Mail, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SharedReadingPlanInvite({ planId, planName }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const inviteLink = `${window.location.origin}/plans?join=${planId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: inviteEmail,
        subject: `Join "${planName}" Reading Plan on Veritas`,
        body: `Hey! I'm reading "${planName}" on Veritas and would love for you to join me. Click here to join: ${inviteLink}\n\nVeritas is a beautiful Bible study app for tracking your reading journey together. 🙏`
      });
      setInviteSent(true);
      setInviteEmail("");
      setTimeout(() => setInviteSent(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}
        title="Invite friends"
      >
        <Share2 className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl max-w-sm w-full p-5"
              style={{ background: "var(--popover-surface)", border: "1px solid rgba(0,245,255,0.15)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: "#00f5ff" }} />
                  <h2 className="font-cinzel text-lg font-bold text-white">Invite Friends</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:opacity-70"
                  style={{ background: "var(--fill-2)" }}
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <p className="text-sm font-inter mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                Share this reading plan with friends
              </p>

              {/* Copy Link */}
              <div className="mb-4">
                <p className="text-xs font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Copy Link
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2.5 rounded-lg text-xs font-inter focus:outline-none"
                    style={{ background: "var(--fill-2)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-lg font-cinzel text-sm transition-all min-h-10"
                    style={{ background: "rgba(0,245,255,0.15)", color: copied ? "#34d399" : "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Email Invite */}
              <div>
                <p className="text-xs font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Send Email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                    placeholder="friend@example.com"
                    className="flex-1 px-3 py-2.5 rounded-lg text-xs font-inter focus:outline-none"
                    style={{ background: "var(--fill-2)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendEmail}
                    disabled={sending || !inviteEmail.trim()}
                    className="px-4 py-2.5 rounded-lg font-cinzel text-sm transition-all min-h-10 disabled:opacity-50"
                    style={{ background: inviteSent ? "rgba(52,211,153,0.15)" : "rgba(0,245,255,0.15)", color: inviteSent ? "#34d399" : "#00f5ff", border: `1px solid ${inviteSent ? "rgba(52,211,153,0.25)" : "rgba(0,245,255,0.25)"}` }}
                  >
                    {sending ? "..." : inviteSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </motion.button>
                </div>
                {inviteSent && (
                  <p className="text-xs font-inter mt-2" style={{ color: "#34d399" }}>Invite sent! ✓</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}