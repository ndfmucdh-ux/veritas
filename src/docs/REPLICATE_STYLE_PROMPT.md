# Veritas: style + layout replication kit

## PROMPT (paste this first into the other Base44 chat)

Restyle my app to match the "Veritas" Bible app design system, without changing any existing functionality, data or pages. Apply the following in this order:

1. Replace `src/index.css` and `tailwind.config.js` with the files in the CODE section below (design tokens, fonts, dark default theme, light theme via `html[data-theme="light"]`).
2. Add `src/components/ui/VeritasLogo.jsx` and `src/components/layout/AppLayout.jsx` from below, and wrap my routes in `<Route element={<AppLayout />}>`. Keep my existing pages and routes; add them to the side/bottom navigation instead of Veritas ones.
3. Use only token classes (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-gold`, `font-cinzel`, `font-inter`, `font-cursive`). No hardcoded hex colors in JSX.
4. Pages are cards on a warm charcoal background: rounded-3xl cards (`bg-card border border-border`), soft shadow `0 4px 24px rgba(40,30,15,0.08)`, max width 2xl to 3xl centered, generous padding (px-4 md:px-8), headings in Cormorant Garamond, body in Inter, scripture text in EB Garamond.
5. Header: sticky, translucent (`var(--chrome-surface)`, blur 20px, hairline bottom border), logo + "VERITAS" in Cormorant Garamond bold with 0.1em tracking, then the cursive word "by" (Great Vibes) and the partner logo.
6. Navigation: left side nav on desktop, bottom tab bar on mobile and portrait tablet. Active item uses primary (sage) color.
7. Support a light theme (cream) and dark theme (charcoal) with a toggle that sets `document.documentElement.dataset.theme`.
8. Loading, empty and error states use shared primitives (spinner, skeleton, empty state with description and action). Respect reduced motion. Keep tap targets at least 40px on mobile.

## COLOR PALETTE

Dark (default):
- Background hsl(40 6% 8%) warm charcoal
- Foreground hsl(40 25% 90%) warm off-white
- Card hsl(40 5% 12%), Popover hsl(40 5% 15%)
- Primary / ring / "cyan" hsl(114 18% 62%) sage green
- Accent / "purple" hsl(18 50% 62%) terracotta
- Gold hsl(36 40% 62%) (#d9b77e)
- Muted foreground hsl(40 8% 66%), Border hsl(40 5% 20%)
- Destructive hsl(8 65% 60%), Success hsl(114 25% 55%), Warning hsl(36 60% 60%)

Light:
- Background hsl(33 33% 95%) cream (#F7F3EE)
- Foreground hsl(0 0% 17%) charcoal (#2C2C2C)
- Card hsl(40 50% 99%)
- Primary hsl(114 18% 40%) deep sage, Accent hsl(18 45% 42%) terracotta, Gold hsl(33 50% 36%)
- Border hsl(33 20% 84%)

Brand: header band and buttons #d9b77e on black text, page backdrop #141414, card #f7f3ee, 0px radius in emails.

## TYPOGRAPHY
- Headings (h1-h3, `font-cinzel`): Cormorant Garamond 400-700
- Scripture / reading text (`font-playfair`): EB Garamond
- UI body (`font-inter`): Inter 300-700
- Branding script (`font-cursive`): Great Vibes
- Reading text: `clamp(16px, 2.5vw, 22px)`, line-height 1.9

## PAGES IN THE SOURCE APP (routes)
/ Home, /read, /search, /discover, /study, /plans, /library, /profile, /verse-art, /study-center, /prayer-journal, /community, /notification-studio, /audio-dashboard, /for-you/:category. Public: first six. Protected: the rest (login gate). Pages are lazy-loaded; Home is eager. A global error boundary wraps the routes and a branded splash/loader (logo + spinner + "VERITAS") shows while auth loads.

---

## CODE

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: {
        cinzel: ['Cormorant Garamond', 'EB Garamond', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
        playfair: ['EB Garamond', 'Georgia', 'serif'],
      },
      colors: {
        white: 'rgb(var(--ink) / <alpha-value>)',
        onimage: 'rgb(var(--text-on-image) / <alpha-value>)',
        onbright: 'hsl(var(--text-on-bright))',
        onprimary: 'hsl(var(--primary-foreground))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--destructive))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        gold: 'hsl(var(--gold))',
        cyan: 'hsl(var(--cyan))',
        purple: 'hsl(var(--purple))',
        chart: { '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))' }
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        pulse: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } }
      },
      animation: { 'accordion-down': 'accordion-down 0.2s ease-out', 'accordion-up': 'accordion-up 0.2s ease-out' }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

### src/index.css (core tokens and utilities)
```css
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 40 6% 8%;  --foreground: 40 25% 90%;
    --card: 40 5% 12%;  --card-foreground: 40 25% 90%;
    --popover: 40 5% 15%;  --popover-foreground: 40 25% 90%;
    --primary: 114 18% 62%;  --primary-foreground: 40 6% 8%;
    --secondary: 40 5% 16%;  --secondary-foreground: 40 25% 90%;
    --muted: 40 5% 14%;  --muted-foreground: 40 8% 66%;
    --accent: 18 50% 62%;  --accent-foreground: 40 6% 8%;
    --destructive: 8 65% 60%;  --destructive-foreground: 40 25% 90%;
    --border: 40 5% 20%;  --input: 40 5% 18%;
    --surface-1: 40 6% 10%; --surface-2: 40 5% 13%; --surface-3: 40 5% 16%; --surface-4: 40 5% 19%;
    --chrome-surface: hsl(var(--surface-1) / 0.92);
    --panel-surface: hsl(var(--surface-1) / 0.98);
    --popover-surface: hsl(var(--surface-4) / 0.98);
    --fill-1: rgba(240,230,210,0.05); --fill-2: rgba(240,230,210,0.08); --fill-3: rgba(240,230,210,0.11);
    --hairline: rgba(240,230,210,0.1);
    --ring: 114 18% 62%;  --radius: 0.9rem;
    --gold: 36 40% 62%;  --cyan: 114 18% 62%;  --purple: 18 50% 62%;
    --chart-1: 114 18% 62%; --chart-2: 36 40% 62%; --chart-3: 18 50% 62%; --chart-4: 114 25% 50%; --chart-5: 8 65% 60%;
    --body-glow: 40 6% 10%;
    --success: 114 25% 55%;  --warning: 36 60% 60%;
    --ink: 240 233 220;
    --text-on-image: 255 255 255;
    --text-on-bright: 40 6% 8%;
    color-scheme: dark;
  }

  html[data-theme="light"] {
    --background: 33 33% 95%;  --foreground: 0 0% 17%;
    --card: 40 50% 99%;  --card-foreground: 0 0% 17%;
    --popover: 40 50% 99%;  --popover-foreground: 0 0% 17%;
    --primary: 114 18% 40%;  --primary-foreground: 40 50% 99%;
    --secondary: 36 25% 90%;  --secondary-foreground: 0 0% 17%;
    --muted: 36 25% 92%;  --muted-foreground: 30 6% 30%;
    --accent: 18 45% 42%;  --accent-foreground: 40 50% 99%;
    --destructive: 0 65% 42%;  --destructive-foreground: 0 0% 100%;
    --border: 33 20% 84%;  --input: 33 20% 86%;
    --surface-1: 33 33% 96%; --surface-2: 40 50% 99%; --surface-3: 34 30% 93%; --surface-4: 40 50% 99%;
    --fill-1: rgba(60,45,20,0.035); --fill-2: rgba(60,45,20,0.055); --fill-3: rgba(60,45,20,0.08);
    --hairline: rgba(60,45,20,0.12);
    --ring: 114 18% 40%;
    --gold: 33 50% 36%;  --cyan: 114 18% 36%;  --purple: 18 45% 40%;
    --body-glow: 36 40% 98%;
    --success: 114 25% 30%;  --warning: 33 60% 36%;
    --ink: 44 44 44;
    color-scheme: light;
  }
}

html, body { overscroll-behavior: none; overflow-x: clip; max-width: 100%; touch-action: pan-x pan-y; -webkit-tap-highlight-color: transparent; }
input, textarea, select { font-size: max(16px, 1em); }
.grid > * { min-width: 0; }

@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground font-inter;
    background: radial-gradient(ellipse at top, hsl(var(--body-glow)) 0%, hsl(var(--background)) 70%);
    background-attachment: fixed;
    min-height: 100vh;
  }
  h1, h2, h3 { @apply font-cinzel; }
}

@layer utilities {
  .font-cinzel { font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif; }
  .font-inter { font-family: 'Inter', sans-serif; }
  .font-cursive { font-family: 'Great Vibes', cursive; }
  .font-playfair { font-family: 'EB Garamond', Georgia, serif; }
  .glass { background: var(--fill-2); backdrop-filter: blur(20px); border: 1px solid var(--hairline); box-shadow: 0 8px 24px rgba(8,11,20,0.18); }
  .text-gold { color: hsl(var(--gold)); }
  .text-cyan { color: hsl(var(--cyan)); }
  .text-purple { color: hsl(var(--purple)); }
  .bg-gold { background-color: hsl(var(--gold)); }
  .gradient-gold { background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--accent))); }
  .gradient-cyan { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--cyan))); }
  .red-letter { color: hsl(var(--destructive)); }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .reading-text { font-size: clamp(16px, 2.5vw, 22px); line-height: 1.9; letter-spacing: 0.01em; }
  .fade-in { animation: fadeIn 0.5s ease forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
}
```

### src/components/ui/VeritasLogo.jsx
```jsx
export default function VeritasLogo({ size = 40, className = "" }) {
  return (
    <img
      src="https://media.base44.com/images/public/69f67135f4b5e8717434ca7b/6a1ac5ac1_IMG_1831.jpeg"
      width={size} height={size} alt="Veritas" className={className}
      style={{ borderRadius: "22%", objectFit: "cover" }}
    />
  );
}
```

### src/components/layout/AppLayout.jsx (simplified; plug in your own SideNav / BottomNav)
```jsx
import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import VeritasLogo from "@/components/ui/VeritasLogo";
import SideNav from "./SideNav.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SideNav />
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between md:px-6"
        style={{ background: "var(--chrome-surface)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--hairline)" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl"><VeritasLogo size={34} /></motion.div>
          <span className="font-cinzel font-bold text-xl tracking-[0.1em] text-foreground">VERITAS</span>
          <span className="font-cursive text-lg italic text-foreground/70 ml-1.5">by</span>
          <img src="https://base44.app/api/apps/69f67135f4b5e8717434ca7b/files/mp/public/69f67135f4b5e8717434ca7b/2d2084bf6_awaken-logo-transparent.png" alt="Awaken Apostolic Network" className="h-8 w-auto object-contain" />
        </Link>
      </header>
      <main className="flex-1">
        <Suspense fallback={null}><Outlet /></Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
```

### Page card pattern
```jsx
<div className="mx-3 sm:mx-auto sm:w-full max-w-2xl my-3 rounded-3xl bg-card border border-border px-4 md:px-8 pb-6 pt-1"
     style={{ boxShadow: "0 4px 24px rgba(40,30,15,0.08)" }}>
  ...
</div>
```

## NOTE
This kit covers the visual system and shell. The full app is several hundred files (pages, components, backend functions, entities), too large to paste into one chat. To merge the whole app, use GitHub sync or clone from the dashboard, then ask the other chat to combine the two.
