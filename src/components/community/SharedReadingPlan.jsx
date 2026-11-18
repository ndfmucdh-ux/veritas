import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import CommunityPlanForm from "./CommunityPlanForm";
import CommunityPlanCard from "./CommunityPlanCard";

export default function SharedReadingPlan() {
  const { t } = useLang();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [me, setMe] = useState(null);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    loadPlans();
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  const loadPlans = async () => {
    const groups = await base44.entities.CommunityGroup.filter({ category: "study_group" }, { sort: "-created_date", limit: 50 }).catch(() => ({ items: [] }));
    setPlans(groups?.items || groups || []);
    setLoading(false);
  };

  const handleCreate = async (data) => {
    if (!me) return base44.auth.redirectToLogin(window.location.href);
    await base44.entities.CommunityGroup.create({
      ...data,
      category: "study_group",
      member_count: 1,
      verified: false,
      leader_email: me.email,
      member_emails: [me.email],
    });
    setShowCreate(false);
    await loadPlans();
  };

  const isMember = (plan) => !!me?.email && (plan.member_emails || []).includes(me.email);

  // Join / leave toggle: each user is counted once, however many times they tap.
  const handleJoin = async (plan) => {
    if (joining === plan.id) return;
    if (!me) return base44.auth.redirectToLogin(window.location.href);
    setJoining(plan.id);
    try {
      const emails = plan.member_emails || [];
      const already = emails.includes(me.email);
      const nextEmails = already ? emails.filter((e) => e !== me.email) : [...emails, me.email];
      const base = Math.max(plan.member_count || 1, emails.length);
      const nextCount = Math.max(1, already ? base - 1 : base + 1);
      await base44.entities.CommunityGroup.update(plan.id, { member_emails: nextEmails, member_count: nextCount });
      await loadPlans();
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 min-h-[8rem]"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--t-gold)" }} /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 flex-shrink-0" style={{ color: "var(--t-gold)" }} />
          <p className="font-cinzel text-sm font-semibold text-foreground truncate">{t.s5Community}</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCreate((v) => !v)} aria-label={t.s5Create}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#d9b77e", color: "#1a1408" }}>
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <CommunityPlanForm onCreate={handleCreate} />
          </motion.div>
        )}
      </AnimatePresence>

      {plans.length === 0 ? (
        <p className="text-sm font-inter text-center py-8" style={{ color: "rgb(var(--ink) / 0.75)" }}>{t.s5NoPlans}</p>
      ) : (
        plans.map((plan) => (
          <CommunityPlanCard key={plan.id} plan={plan} isMember={isMember(plan)} joining={joining === plan.id} onJoin={handleJoin} />
        ))
      )}
    </div>
  );
}