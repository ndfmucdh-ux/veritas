// Reading-plans domain service.
//
// Owns reads for preset plan progress (ReadingSession/ReadingProgress filtered
// by plan_id) and custom plans (CustomPlan). Keeps plan-progress querying in
// one place so progress UIs don't touch base44.entities directly.

import { base44 } from "@/api/base44Client";
import { listPlanSessions } from "@/lib/services/readingService";

// Sessions linked to a plan (consolidated-first via readingService). Bounded.
export async function listPlanProgress({ limit = 500 } = {}) {
  return listPlanSessions({ limit });
}

// User-authored custom plans, bounded + sorted.
export async function listCustomPlans({ limit = 10 } = {}) {
  return base44.entities.CustomPlan.list("-created_date", limit).catch(() => []);
}

// Convenience aggregate for progress dashboards: returns both sources in one call.
export async function loadPlanDashboard({ customLimit = 10 } = {}) {
  const [progress, customPlans] = await Promise.all([
    listPlanProgress(),
    listCustomPlans({ limit: customLimit }),
  ]);
  return { progress: progress || [], customPlans: customPlans || [] };
}

// --- Plan-tracking page reads/writes ----------------------------------------

// Raw preset-plan progress rows (bounded) for the plan-tracking UI.
export async function listPresetProgress({ limit = 500 } = {}) {
  return base44.entities.ReadingProgress.list("-created_date", limit).catch(() => []);
}

// Mark a preset-plan day complete (idempotent at call site).
export async function completePresetDay(planTitle, day) {
  return base44.entities.ReadingProgress.create({
    plan_id: planTitle,
    book: "Plan",
    chapter: day,
    translation: "KJV",
    completed_at: new Date().toISOString(),
  }).catch(() => {});
}

// Persist a custom plan's completed chapters + denormalized count.
export async function updateCustomPlanChapters(planId, completedChapters) {
  return base44.entities.CustomPlan.update(planId, {
    completed_chapters: completedChapters,
    completed_count: completedChapters.length,
  });
}

export async function deleteCustomPlan(planId) {
  return base44.entities.CustomPlan.delete(planId);
}