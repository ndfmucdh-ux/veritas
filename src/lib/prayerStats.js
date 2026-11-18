// Pure helpers for the prayer journal overview. All days use the user's local calendar.
export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

export const lastDays = (n) => Array.from({ length: n }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1 - i));
  return dayKey(d);
});

export function computeStreaks(prayers) {
  const dates = new Set(prayers.map((p) => p.created_date && dayKey(p.created_date)).filter(Boolean));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(dayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }

  let longest = 0, run = 0, prev = null;
  [...dates].sort().forEach((k) => {
    const [y, m, d] = k.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && Math.round((cur - prev) / 86400000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = cur;
  });
  return { streak, longest: Math.max(longest, streak), dates };
}

export function topTopics(prayers, limit = 6) {
  const counts = {};
  prayers.forEach((p) => (p.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
}

export function frequency(prayers, days = 30) {
  const keys = lastDays(days);
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  prayers.forEach((p) => { const k = p.created_date && dayKey(p.created_date); if (k in map) map[k]++; });
  return keys.map((k) => ({ key: k, count: map[k] }));
}