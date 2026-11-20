// One navigation stack per bottom tab: each tab remembers the last screen opened in it.
const stacks = {};
let owner = "/";

/** The tab a pathname sits under, or null for screens opened from elsewhere (e.g. the More menu). */
export const tabRootFor = (pathname, roots) =>
  roots.find((r) => r !== "/" && (pathname === r || pathname.startsWith(`${r}/`))) || (pathname === "/" ? "/" : null);

/** Records the current screen in its tab's stack and returns the tab that owns it. */
export function trackTab(pathname, fullPath, roots) {
  owner = tabRootFor(pathname, roots) || owner;
  stacks[owner] = fullPath;
  return owner;
}

export const lastInTab = (root) => stacks[root] || root;