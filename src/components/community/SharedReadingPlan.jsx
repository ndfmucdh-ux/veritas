import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, TrendingUp, Loader2, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SharedReadingPlanInvite from "./SharedReadingPlanInvite";

export default function SharedReadingPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [me, setMe] = useState(null);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    loadPlans();
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  const loadPlans = async () => {
    try {
      const communityPlans = await base44.entities.CommunityGroup.filter({ category: "study_group" }).catch(() => []);
      setPlans(communityPlans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    
    try {
      await base44.entities.CommunityGroup.create({
        name: newPlanName,
        description: "A shared reading plan",
        category: "study_group",
        member_count: 1,
        verified: false
      });
      setNewPlanName("");
      setShowCreate(false);
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const isMember = (plan) => !!me?.email && (plan.member_emails || []).includes(me.email);

  // Join / leave toggle: each user is counted once, however many times they tap.
  const handleJoinPlan = async (plan) => {
    if (joining === plan.id) return;
    let user = me;
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    setJoining(plan.id);
    try {
      const emails = plan.member_emails || [];
      const already = emails.includes(user.email);
      const nextEmails = already ? emails.filter(e => e !== user.email) : [...emails, user.email];
      const base = Math.max(plan.member_count || 1, emails.length);
      const nextCount = Math.max(1, already ? base - 1 : base + 1);
      await base44.entities.CommunityGroup.update(plan.id, { member_emails: nextEmails, member_count: nextCount });
      await loadPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00f5ff" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "#00f5ff" }} />
          <p className="font-cinzel text-sm font-semibold text-white">Community Reading Plans</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(v => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff" }}
        >
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4 mb-4" style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
            <div className="flex gap-2">
              <input
                value={newPlanName}
                onChange={e => setNewPlanName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreatePlan()}
                placeholder="Plan name (e.g. 'Daily Psalms')"
                className="flex-1 px-3 py-2 rounded-lg text-sm font-inter focus:outline-none"
                style={{ background: "var(--fill-2)", border: "1px solid rgba(0,245,255,0.2)", color: "rgb(var(--ink) / 0.8)" }}
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleCreatePlan}
                className="px-4 py-2 rounded-lg text-sm font-cinzel"
                style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff" }}>
                Create
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans list */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>
              No community reading plans yet. Create one to get started!
            </p>
          </div>
        ) : (
          plans.map(plan => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)" }}>
              
              {/* Plan header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-cinzel text-sm font-semibold text-white">{plan.name}</p>
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                    {plan.member_count} member{plan.member_count > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SharedReadingPlanInvite planId={plan.id} planName={plan.name} />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleJoinPlan(plan)}
                    disabled={joining === plan.id}
                    aria-pressed={isMember(plan)}
                    className="px-4 py-2 rounded-lg text-xs font-cinzel min-h-10 disabled:opacity-60"
                    style={isMember(plan)
                      ? { background: "rgba(52,211,153,0.15)", color: "var(--t-green)" }
                      : { background: "rgba(0,245,255,0.15)", color: "var(--t-cyan)" }}>
                    {joining === plan.id ? "…" : isMember(plan) ? "Joined ✓" : "Join"}
                  </motion.button>
                </div>
              </div>

              {plan.description && (
                <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                  {plan.description}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}