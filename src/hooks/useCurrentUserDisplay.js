import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// The saved account is the source of truth; the local copy only avoids a flash while it loads.
const cached = (k) => localStorage.getItem(k) || "";

export default function useCurrentUserDisplay() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState(() => cached("veritas_display_name"));
  const [displayAvatar, setDisplayAvatar] = useState(() => cached("veritas_avatar_url") || null);

  useEffect(() => {
    base44.auth.me().catch(() => null).then((u) => {
      setUser(u);
      if (!u) return;
      const name = u.full_name || "";
      const avatar = u.avatar_url || null;
      setDisplayName(name);
      setDisplayAvatar(avatar);
      localStorage.setItem("veritas_display_name", name);
      if (avatar) localStorage.setItem("veritas_avatar_url", avatar);
      else localStorage.removeItem("veritas_avatar_url");
    });
  }, []);

  // Profile page saves a new photo or name: refresh the top bar right away.
  useEffect(() => {
    const sync = () => {
      setDisplayName(cached("veritas_display_name"));
      setDisplayAvatar(cached("veritas_avatar_url") || null);
    };
    window.addEventListener("veritas:profile", sync);
    return () => window.removeEventListener("veritas:profile", sync);
  }, []);

  return {
    user,
    displayName,
    displayAvatar,
    firstName: displayName.split(" ")[0],
  };
}