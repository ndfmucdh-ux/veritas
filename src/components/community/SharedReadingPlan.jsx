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

  useEffect(() => {
    loadPlans();
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

  const handleJoinPlan = async (plan) => {
    try {
      await base44.entities.CommunityGroup.update(plan.id, {
        member_count: (plan.member_count || 1) + 1
      });
      loadPlans();
    } catch (err) {
      console.error(err);
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
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.8)" }}
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
            <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {plan.member_count} member{plan.member_count > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SharedReadingPlanInvite planId={plan.id} planName={plan.name} />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleJoinPlan(plan)}
                    className="px-4 py-2 rounded-lg text-xs font-cinzel min-h-10"
                    style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff" }}>
                    Join
                  </motion.button>
                </div>
              </div>

              {plan.description && (
                <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
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