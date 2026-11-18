import { Home, BookOpen, Search, BookMarked, User, Map, Compass, GraduationCap, Image, Heart, Users, PenLine, Headphones, Bell, Library } from "lucide-react";

// Every page in the app, in sidebar order. `group` splits the sidebar into two blocks.
export function getSideNavItems(t) {
  return [
    { path: "/", icon: Home, label: t.home, group: 1 },
    { path: "/read", icon: BookOpen, label: t.read, group: 1 },
    { path: "/plans", icon: Map, label: t.plans, group: 1 },
    { path: "/library", icon: BookMarked, label: t.library, group: 1 },
    { path: "/prayer-journal", icon: Heart, label: t.prayer, group: 1 },
    { path: "/study", icon: GraduationCap, label: t.study, group: 1 },
    { path: "/study-center", icon: Library, label: t.studyCenter, group: 1 },
    { path: "/search", icon: Search, label: t.search, group: 2 },
    { path: "/discover", icon: Compass, label: t.discover, group: 2 },
    { path: "/community", icon: Users, label: t.community, group: 2 },
    { path: "/verse-art", icon: Image, label: t.verseArt, group: 2 },
    { path: "/audio-dashboard", icon: Headphones, label: t.audio || "Audio", group: 2 },
    { path: "/notification-studio", icon: Bell, label: t.notifications || "Notifications", group: 2 },
    { path: "/profile", icon: User, label: t.profile, group: 2 },
  ];
}

// Phone tab bar: Home, Read, Discover, Notes, then a "More" menu.
export function getBottomNavItems(t) {
  return [
    { path: "/", icon: Home, label: t.home },
    { path: "/read", icon: BookOpen, label: t.read },
    { path: "/discover", icon: Compass, label: t.discover },
    { path: "/library", icon: PenLine, label: t.notes || "Notes" },
  ];
}