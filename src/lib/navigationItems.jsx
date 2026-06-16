import { Home, BookOpen, Search, BookMarked, User, Map, Compass, GraduationCap, Image, Heart, Users } from "lucide-react";

export function getSideNavItems(t) {
  return [
    { path: "/", icon: Home, label: t.home },
    { path: "/read", icon: BookOpen, label: t.read },
    { path: "/study", icon: GraduationCap, label: t.study },
    { path: "/search", icon: Search, label: t.search },
    { path: "/library", icon: BookMarked, label: t.library },
    { path: "/plans", icon: Map, label: t.plans },
    { path: "/discover", icon: Compass, label: t.discover },
    { path: "/verse-art", icon: Image, label: t.verseArt },
    { path: "/profile", icon: User, label: t.profile },
  ];
}

export function getBottomNavItems(t) {
  return [
    { path: "/", icon: Home, label: t.home },
    { path: "/read", icon: BookOpen, label: t.read },
    { path: "/study-center", icon: BookMarked, label: t.study },
    { path: "/prayer-journal", icon: Heart, label: t.prayer },
    { path: "/community", icon: Users, label: t.community },
  ];
}