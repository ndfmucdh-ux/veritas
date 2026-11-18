import { base44 } from "@/api/base44Client";

// Every friend and group action goes through one backend function.
export async function community(action, payload = {}) {
  const res = await base44.functions.invoke("community", { action, ...payload });
  return res.data;
}