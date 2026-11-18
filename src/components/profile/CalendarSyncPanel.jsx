import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Link2, Check, AlertCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CalendarSyncPanel() {
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [readingPlans, setReadingPlans] = useState([]);
  const [syncing, setSyncing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        // Load reading plans
        const plans = await base44.entities.CustomPlan.filter(
          { created_by: user.email },
          '-created_date',
          10
        );
        setReadingPlans(plans);

        // Load synced calendars from user prefs
        const synced = user.synced_calendar_plans || [];
        setConnectedCalendars(synced);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSyncPlan = async (planId, calendarType) => {
    setSyncing(planId);

    try {
      const plan = readingPlans.find(p => p.id === planId);
      if (!plan) return;

      // Get connector ID based on type (would be set during auth flow)
      const connectorId = localStorage.getItem(`calendar_connector_${calendarType}`);
      if (!connectorId) {
        alert(`Please connect your ${calendarType} calendar first`);
        setSyncing(null);
        return;
      }

      const response = await base44.functions.invoke("syncPlanToCalendar", {
        planTitle: plan.title,
        planDays: plan.selections || [],
        calendarType,
        connectorId,
      });

      if (response.data?.success) {
        setConnectedCalendars(prev => [
          ...prev,
          {
            planTitle: plan.title,
            calendarType,
            syncedAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Failed to sync plan to calendar");
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-gradient-to-r from-cyan/10 to-purple/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl" style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-cyan" />
          <h3 className="font-cinzel font-semibold text-white">Calendar Sync</h3>
        </div>

        {readingPlans.length === 0 ? (
          <p className="text-xs font-inter text-muted-foreground">No reading plans to sync. Create a plan first.</p>
        ) : (
          <div className="space-y-3">
            {readingPlans.map(plan => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl"
                style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.05)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-cinzel font-semibold text-white">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">{plan.total_chapters} chapters</p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSyncPlan(plan.id, "google")}
                      disabled={syncing === plan.id}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(0,245,255,0.1)",
                        color: "#00f5ff",
                        border: "1px solid rgba(0,245,255,0.2)",
                      }}
                    >
                      {syncing === plan.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Google"
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSyncPlan(plan.id, "apple")}
                      disabled={syncing === plan.id}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(251,191,36,0.1)",
                        color: "#fbbf24",
                        border: "1px solid rgba(251,191,36,0.2)",
                      }}
                    >
                      {syncing === plan.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Apple"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {connectedCalendars.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="font-inter text-emerald-600">{connectedCalendars.length} plan(s) synced to calendar</span>
          </div>
        </div>
      )}
    </div>
  );
}