// Shared access checks for backend functions.

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Returns the signed-in user, or null when nobody is signed in.
export async function getUser(base44: any) {
  return await base44.auth.me().catch(() => null);
}

// Workflows call functions as the app admin; anyone else is turned away.
// Returns an error Response to send back, or null when the caller is an admin.
export async function denyUnlessAdmin(base44: any): Promise<Response | null> {
  const user = await getUser(base44);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
  return null;
}