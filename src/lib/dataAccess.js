// Backwards-compatible barrel for the domain service layer.
//
// The data-access logic now lives in focused, domain-split services under
// lib/services/ (libraryService, readingService, plansService). This file
// re-exports them so existing imports (`@/lib/dataAccess`) keep working with no
// path changes — new code should import from the specific service instead.
//
// See docs/SERVICE_LAYER_ARCHITECTURE.md.

export {
  listInteractions,
  deriveViews,
  listLegacyViews,
  loadLibraryViews,
  setBookmark,
  setHighlight,
  setNote,
  loadChapterAnnotations,
  getNote,
  listRecentLibrary,
  deleteNoteItem,
} from "@/lib/services/libraryService";

export {
  recordReadingSession,
  listReadingHistory,
  listPlanSessions,
  listReadingActivity,
} from "@/lib/services/readingService";

export {
  listPlanProgress,
  listCustomPlans,
  loadPlanDashboard,
} from "@/lib/services/plansService";