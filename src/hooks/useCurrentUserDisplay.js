import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useCurrentUserDisplay() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem("veritas_display_name") || "");
  const [displayAvatar, setDisplayAvatar] = useState(() => sessionStorage.getItem("veritas_avatar_url") || null);

  useEffect(() => {
    base44.auth.me().catch(() => null).then((u) => {
      setUser(u);
      const name = sessionStorage.getItem("veritas_display_name") || u?.full_name || "";
      const avatar = sessionStorage.getItem("veritas_avatar_url") || u?.avatar_url || null;

      setDisplayName(name);
      setDisplayAvatar(avatar);

      if (u?.full_name && !sessionStorage.getItem("veritas_display_name")) {
        sessionStorage.setItem("veritas_display_name", u.full_name);
      }
      if (u?.avatar_url && !sessionStorage.getItem("veritas_avatar_url")) {
        sessionStorage.setItem("veritas_avatar_url", u.avatar_url);
      }
    });
  }, []);

  // Profile page saves a new photo or name: refresh the top bar right away.
  useEffect(() => {
    const sync = () => {
      setDisplayName(sessionStorage.getItem("veritas_display_name") || "");
      setDisplayAvatar(sessionStorage.getItem("veritas_avatar_url") || null);
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