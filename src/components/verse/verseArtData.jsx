export const TEMPLATES = [
  { id: "dark_gold",  label: "Gold",      bg: "linear-gradient(135deg, #0a0f1e 0%, #1a1400 100%)",             textColor: "#fbbf24",             refColor: "#f59e0b",              font: "'Cinzel', serif" },
  { id: "midnight",   label: "Midnight",  bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", textColor: "#e0e7ff",             refColor: "#a78bfa",              font: "'Playfair Display', serif" },
  { id: "sunrise",    label: "Sunrise",   bg: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",              textColor: "#fff7ed",             refColor: "rgba(255,255,255,0.85)", font: "'Cinzel', serif" },
  { id: "ocean",      label: "Ocean",     bg: "linear-gradient(135deg, #006994 0%, #00b4db 100%)",              textColor: "#f0f9ff",             refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "forest",     label: "Forest",    bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",              textColor: "#f0fdf4",             refColor: "rgba(255,255,255,0.75)", font: "'Cinzel', serif" },
  { id: "rose",       label: "Rose",      bg: "linear-gradient(135deg, #f43f5e 0%, #fda4af 100%)",              textColor: "#fff1f2",             refColor: "rgba(255,255,255,0.8)", font: "'Playfair Display', serif" },
  { id: "parchment",  label: "Parchment", bg: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)",              textColor: "#5c3d11",             refColor: "#92400e",              font: "'Playfair Display', serif" },
  { id: "cosmic",     label: "Cosmic",    bg: "linear-gradient(135deg, #1a0533 0%, #0d1b4b 50%, #1a0533 100%)", textColor: "#e9d5ff",             refColor: "#c084fc",              font: "'Cinzel', serif" },
];

export const ELEGANT_THEMES = [
  { id: "holy_light", label: "Holy Light", emoji: "☀️", preview: "linear-gradient(135deg, #fff8e7 0%, #fde68a 100%)", bgMode: "image", imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", template: { bg: "", textColor: "#fffbeb", refColor: "#fbbf24", font: "'Cinzel', serif" } },
  { id: "deep_prayer", label: "Deep Prayer", emoji: "🙏", preview: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)", bgMode: "gradient", imageUrl: null, template: { bg: "linear-gradient(160deg, #0d0a20 0%, #1a1040 50%, #0d0a20 100%)", textColor: "#e9d5ff", refColor: "#a78bfa", font: "'Playfair Display', serif" } },
  { id: "mountain_faith", label: "Mountain Faith", emoji: "⛰️", preview: "linear-gradient(135deg, #1a2540 0%, #4a6fa5 100%)", bgMode: "image", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", template: { bg: "", textColor: "#f0f9ff", refColor: "#93c5fd", font: "'Cinzel', serif" } },
  { id: "ancient_scroll", label: "Ancient Scroll", emoji: "📜", preview: "linear-gradient(135deg, #fdf6e3 0%, #d4a96a 100%)", bgMode: "gradient", imageUrl: null, template: { bg: "linear-gradient(160deg, #fdf6e3 0%, #f5e6c8 60%, #e8d5a3 100%)", textColor: "#4a2c0a", refColor: "#92400e", font: "'Playfair Display', serif" } },
  { id: "still_waters", label: "Still Waters", emoji: "🌊", preview: "linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)", bgMode: "image", imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80", template: { bg: "", textColor: "#f0f9ff", refColor: "#7dd3fc", font: "'Playfair Display', serif" } },
  { id: "evening_peace", label: "Evening Peace", emoji: "🌙", preview: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", bgMode: "image", imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80", template: { bg: "", textColor: "#ede9fe", refColor: "#c084fc", font: "'Cinzel', serif" } },
  { id: "garden_hope", label: "Garden Hope", emoji: "🌸", preview: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", bgMode: "image", imageUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=800&q=80", template: { bg: "", textColor: "#f0fdf4", refColor: "#86efac", font: "'Playfair Display', serif" } },
  { id: "fire_spirit", label: "Holy Fire", emoji: "🔥", preview: "linear-gradient(135deg, #7c1010 0%, #ef4444 50%, #f97316 100%)", bgMode: "gradient", imageUrl: null, template: { bg: "linear-gradient(160deg, #1c0505 0%, #7c1010 40%, #3d0c0c 100%)", textColor: "#fef2f2", refColor: "#fca5a5", font: "'Cinzel', serif" } },
];

export const SEMANTIC_IMAGES = [
  { id: "mountains",  label: "Mountains",  url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
  { id: "ocean",      label: "Ocean",      url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80" },
  { id: "sunrise",    label: "Sunrise",    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80" },
  { id: "forest",     label: "Forest",     url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80" },
  { id: "starfield",  label: "Stars",      url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80" },
  { id: "desert",     label: "Desert",     url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80" },
  { id: "wheat",      label: "Harvest",    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },
  { id: "candle",     label: "Candle",     url: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=800&q=80" },
  { id: "dove",       label: "Dove",       url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80" },
  { id: "waterfall",  label: "Waterfall",  url: "https://images.unsplash.com/photo-1548182294-b8c6b0e0e451?w=800&q=80" },
  { id: "chapel",     label: "Chapel",     url: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&q=80" },
  { id: "lily",       label: "Lily",       url: "https://images.unsplash.com/photo-1490750967868-88df5691cc3c?w=800&q=80" },
];

export const LOGO_URL = "https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg";

export const POPULAR_EN = [
  { ref: "John 3:16",        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Psalm 23:1",       text: "The LORD is my shepherd; I shall not want." },
  { ref: "Isaiah 40:31",     text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "Romans 8:28",      text: "And we know that all things work together for good to them that love God." },
  { ref: "Jeremiah 29:11",   text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you." },
];

export const POPULAR_ES = [
  { ref: "Juan 3:16",         text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
  { ref: "Filipenses 4:13",   text: "Todo lo puedo en Cristo que me fortalece." },
  { ref: "Salmo 23:1",        text: "Jehová es mi pastor; nada me faltará." },
  { ref: "Isaías 40:31",      text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas." },
  { ref: "Romanos 8:28",      text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien." },
  { ref: "Jeremías 29:11",    text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal." },
];