import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { listRecentLibrary, listPlanSessions } from "@/lib/dataAccess";

export default function useProfileData() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each source is independently guarded so one failing request can never
    // leave the page stuck on a blank loading screen. `loading` is always
    // released in finally, and all views default to safe arrays.
    Promise.all([
      base44.auth.me().catch(() => null),
      listRecentLibrary({ limit: 20 }).catch(() => ({})),
      listPlanSessions().catch(() => []),
    ]).then(([u, lib, rp]) => {
      setUser(u);
      setBookmarks(lib?.bookmarks || []);
      setHighlights(lib?.highlights || []);
      setNotes(lib?.notes || []);
      setPlans(rp || []);
      if (u?.full_name && !sessionStorage.getItem("veritas_display_name")) {
        sessionStorage.setItem("veritas_display_name", u.full_name);
      }
      if (u?.avatar_url && !sessionStorage.getItem("veritas_avatar_url")) {
        sessionStorage.setItem("veritas_avatar_url", u.avatar_url);
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveName = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await base44.auth.updateMe({ full_name: trimmed });
    setUser(u => ({ ...u, full_name: trimmed }));
    sessionStorage.setItem("veritas_display_name", trimmed);
    window.dispatchEvent(new Event("veritas:profile"));
  };

  const uploadAvatar = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    sessionStorage.setItem("veritas_avatar_url", file_url);
    window.dispatchEvent(new Event("veritas:profile"));
    return file_url;
  };

  const uploadHero = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ hero_url: file_url });
    return file_url;
  };

  const downloadLibrary = async () => {
    const res = await base44.functions.invoke("exportLibraryData", {});
    const blob = new Blob([res.data], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veritas-library-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    user,
    bookmarks,
    highlights,
    notes,
    plans,
    loading,
    saveName,
    uploadAvatar,
    uploadHero,
    downloadLibrary,
  };
}