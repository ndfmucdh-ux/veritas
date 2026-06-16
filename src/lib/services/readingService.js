// Reading-progress domain service.
//
// Owns reading sessions and history/activity reads against the consolidated
// `ReadingSession` entity, with a legacy `ReadingProgress` fallback. Pages and
// components depend on these functions instead of base44.entities directly.

import { base44 } from "@/api/base44Client";
import { bookOrder } from "@/lib/verseKeys";

// Idempotent completion record keyed by session_key.
export async function recordReadingSession({ book, chapter, translation, planId, readingTimeSeconds = 0 }) {
  const day = new Date().toISOString().slice(0, 10);
  const me = await base44.auth.me().catch(() => null);
  const session_key = `${me?.email || "anon"}|${day}|${translation || "KJV"}|${book}|${chapter}`;
  const existing = await base44.entities.ReadingSession.filter({ session_key }).catch(() => []);
  if (existing && existing[0]) return existing[0];
  return base44.entities.ReadingSession.create({
    session_key, plan_id: planId, book, book_order: bookOrder(book), chapter,
    translation: translation || "KJV", reading_day: day,
    completed_at: new Date().toISOString(),
    reading_time_seconds: readingTimeSeconds, completion_source: "reader",
  }).catch(() => null);
}

// Reading history (consolidated ReadingSession first, legacy ReadingProgress fallback).
export async function listReadingHistory({ limit = 20 } = {}) {
  const sessions = await base44.entities.ReadingSession.list("-completed_at", limit).catch(() => []);
  if (sessions && sessions.length > 0) return sessions;
  return base44.entities.ReadingProgress.list("-completed_at", limit).catch(() => []);
}

// Plan-linked sessions for the profile (consolidated first).
export async function listPlanSessions() {
  const sessions = await base44.entities.ReadingSession.filter({ plan_id: { $exists: true } }).catch(() => []);
  if (sessions && sessions.length > 0) return sessions;
  return base44.entities.ReadingProgress.filter({ plan_id: { $exists: true } }).catch(() => []);
}

// Reading activity for stats (consolidated ReadingSession first, legacy fallback).
// Returns rows with created_date / book / chapters_read shape used by charts.
export async function listReadingActivity({ limit = 50 } = {}) {
  const sessions = await base44.entities.ReadingSession.list("-completed_at", limit).catch(() => []);
  if (sessions && sessions.length > 0) {
    return sessions.map(s => ({
      created_date: s.completed_at || s.created_date,
      book: s.book,
      chapters_read: 1,
    }));
  }
  return base44.entities.ReadingProgress.list("-created_date", limit).catch(() => []);
}