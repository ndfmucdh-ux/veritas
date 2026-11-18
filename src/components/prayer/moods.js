import { BookOpen, Sprout, Feather, HeartHandshake, Sun } from "lucide-react";

// Mood definitions: label key (translated), icon, theme colour variable
export const MOODS = [
  { id: "all", labelKey: "moodAll", Icon: BookOpen, v: "--primary" },
  { id: "grateful", labelKey: "moodGrateful", Icon: Sprout, v: "--gold" },
  { id: "confessing", labelKey: "moodConfessing", Icon: Feather, v: "--accent" },
  { id: "interceding", labelKey: "moodInterceding", Icon: HeartHandshake, v: "--purple" },
  { id: "celebrating", labelKey: "moodCelebrating", Icon: Sun, v: "--success" },
];

export const tone = (v, a = 1) => `hsl(var(${v}) / ${a})`;