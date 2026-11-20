// Single source of truth for lazy page chunks. App.jsx lazy-loads from here and
// prefetchRoute() warms the same chunk early (the browser dedupes the import).
export const routeLoaders = {
  "/read": () => import("@/pages/Read"),
  "/search": () => import("@/pages/Search"),
  "/library": () => import("@/pages/Library"),
  "/discover": () => import("@/pages/Discover"),
  "/plans": () => import("@/pages/Plans"),
  "/profile": () => import("@/pages/Profile"),
  "/study": () => import("@/pages/Study"),
  "/verse-art": () => import("@/pages/VerseImageGenerator"),
  "/study-center": () => import("@/pages/StudyCenter"),
  "/prayer-journal": () => import("@/pages/PrayerJournal"),
  "/community": () => import("@/pages/CommunityHub"),
  "/notification-studio": () => import("@/pages/NotificationStudio"),
  "/audio-dashboard": () => import("@/pages/AudioDashboard"),
  "/for-you": () => import("@/pages/ForYouSection"),
};

const warmed = new Set();

/** Starts loading a page's code for a pathname. Safe to call repeatedly. */
export function prefetchRoute(pathname) {
  const key = `/${pathname.split("/")[1] || ""}`;
  const loader = routeLoaders[key];
  if (!loader || warmed.has(key)) return;
  warmed.add(key);
  loader().catch(() => warmed.delete(key));
}