import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function usePlansData() {
  const [progress, setProgress] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);

  const loadPlansData = async () => {
    const [p, cp] = await Promise.all([
      base44.entities.ReadingProgress.list("-created_date", 500).catch(() => []),
      base44.entities.CustomPlan.list("-created_date", 20).catch(() => []),
    ]);
    setProgress(p || []);
    setCustomPlans(cp || []);
  };

  useEffect(() => {
    loadPlansData();
  }, []);

  const getCompletedDays = (planTitle) => progress.filter(p => p.plan_id === planTitle).length;
  const isDayComplete = (planTitle, day) => progress.some(p => p.plan_id === planTitle && p.chapter === day);

  const completeDay = async (planTitle, day) => {
    if (isDayComplete(planTitle, day)) return;
    await base44.entities.ReadingProgress.create({
      plan_id: planTitle,
      book: "Plan",
      chapter: day,
      translation: "KJV",
      completed_at: new Date().toISOString(),
    }).catch(() => {});
    setProgress(prev => [...prev, { plan_id: planTitle, chapter: day }]);
  };

  const toggleCustomChapter = async (plan, bookName, chapter) => {
    const key = `${bookName}:${chapter}`;
    const completed = new Set(plan.completed_chapters || []);
    if (completed.has(key)) completed.delete(key);
    else completed.add(key);

    const completedChapters = [...completed];
    await base44.entities.CustomPlan.update(plan.id, { completed_chapters: completedChapters });

    const updatedPlan = { ...plan, completed_chapters: completedChapters };
    setCustomPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
    return updatedPlan;
  };

  const deleteCustomPlan = async (id) => {
    await base44.entities.CustomPlan.delete(id);
    setCustomPlans(prev => prev.filter(p => p.id !== id));
  };

  return {
    progress,
    customPlans,
    loadPlansData,
    getCompletedDays,
    isDayComplete,
    completeDay,
    toggleCustomChapter,
    deleteCustomPlan,
  };
}