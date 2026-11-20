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
    setProgress(prev => [...prev, { plan_id: planTitle, chapter: day }]);
    try {
      await completePresetDay(planTitle, day);
    } catch (e) {
      setProgress(prev => prev.filter(p => !(p.plan_id === planTitle && p.chapter === day)));
      throw e;
    }
  };

  const toggleCustomChapter = async (plan, bookName, chapter) => {
    const key = `${bookName}:${chapter}`;
    const completed = new Set(plan.completed_chapters || []);
    if (completed.has(key)) completed.delete(key);
    else completed.add(key);

    const completedChapters = [...completed];
    const updatedPlan = { ...plan, completed_chapters: completedChapters, completed_count: completedChapters.length };
    setCustomPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
    try {
      await updateCustomPlanChapters(plan.id, completedChapters);
    } catch (e) {
      setCustomPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      throw e;
    }
    return updatedPlan;
  };

  const deleteCustomPlan = async (id) => {
    let removed;
    setCustomPlans(prev => { removed = prev; return prev.filter(p => p.id !== id); });
    try {
      await deleteCustomPlanSvc(id);
    } catch (e) {
      setCustomPlans(removed);
      throw e;
    }
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