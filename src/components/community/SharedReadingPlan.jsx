import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen, TrendingUp, Loader2, Plus, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
      
      // Mock member progress data
      const plansWithProgress = (communityPlans || []).map(plan => ({
        ...plan,
        members: [
          { name: "Sarah", progress: Math.floor(Math.random() * 100) },
          { name: "Michael", progress: Math.floor(Math.random() * 100) },
          { name: "Emma", progress: Math.floor(Math.random() * 100) },
          { name: "David", progress: Math.floor(Math.random() * 100) },
        ]
      }));

      setPlans(plansWithProgress);
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
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleJoinPlan(plan)}
                  className="px-3 py-1.5 rounded-lg text-xs font-cinzel"
                  style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff" }}>
                  Join
                </motion.button>
              </div>

              {/* Member progress */}
              <div className="space-y-2.5">
                {plan.members?.map(member => (
                  <div key={member.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-inter text-white/70">{member.name}</span>
                      <span className="text-[10px] font-cinzel font-bold" style={{ color: "#00f5ff" }}>
                        {member.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, #00f5ff, ${member.progress > 50 ? "#34d399" : "#fbbf24"})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Average progress */}
              {plan.members && plan.members.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>Group average</p>
                    </div>
                    <span className="font-cinzel text-sm font-bold" style={{ color: "#34d399" }}>
                      {Math.round(plan.members.reduce((sum, m) => sum + m.progress, 0) / plan.members.length)}%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}