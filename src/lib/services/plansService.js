// Reading-plans domain service.
//
// Owns reads for preset plan progress (ReadingSession/ReadingProgress filtered
// by plan_id) and custom plans (CustomPlan). Keeps plan-progress querying in
// one place so progress UIs don't touch base44.entities directly.

import { base44 } from "@/api/base44Client";
import { listPlanSessions } from "@/lib/services/readingService";

// Sessions linked to a plan (consolidated-first via readingService).
export async function listPlanProgress() {
  return listPlanSessions();
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