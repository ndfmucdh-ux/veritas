import { useEffect, useState } from "react";
import {
  listPresetProgress,
  listCustomPlans,
  completePresetDay,
  updateCustomPlanChapters,
  deleteCustomPlan as deleteCustomPlanSvc,
} from "@/lib/services/plansService";

export default function usePlansData() {
  const [progress, setProgress] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadPlansData = async () => {
    const [p, cp] = await Promise.all([
      listPresetProgress({ limit: 500 }),
      listCustomPlans({ limit: 20 }),
    ]);
    setProgress(p || []);
    setCustomPlans(cp || []);
    setLoaded(true);
  };

  useEffect(() => {
    loadPlansData();
  }, []);

  const getCompletedDays = (planTitle) => progress.filter(p => p.plan_id === planTitle).length;
  const isDayComplete = (planTitle, day) => progress.some(p => p.plan_id === planTitle && p.chapter === day);

  const completeDay = async (planTitle, day) => {
    if (isDayComplete(planTitle, day)) return;
    await completePresetDay(planTitle, day);
    setProgress(prev => [...prev, { plan_id: planTitle, chapter: day }]);
  };

  const toggleCustomChapter = async (plan, bookName, chapter) => {
    const key = `${bookName}:${chapter}`;
    const completed = new Set(plan.completed_chapters || []);
    if (completed.has(key)) completed.delete(key);
    else completed.add(key);

    const completedChapters = [...completed];
    await updateCustomPlanChapters(plan.id, completedChapters);

    const updatedPlan = { ...plan, completed_chapters: completedChapters, completed_count: completedChapters.length };
    setCustomPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
    return updatedPlan;
  };

  const deleteCustomPlan = async (id) => {
    await deleteCustomPlanSvc(id);
    setCustomPlans(prev => prev.filter(p => p.id !== id));
  };

  return {
    progress,
    customPlans,
    loaded,
    loadPlansData,
    getCompletedDays,
    isDayComplete,
    completeDay,
    toggleCustomChapter,
    deleteCustomPlan,
  };
}