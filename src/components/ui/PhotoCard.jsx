import { SEMANTIC_IMAGES } from "@/components/verse/verseArtData";

export const GOLD = "#d9b77e";

// Text on these cards is always light: re-point the theme tokens so nested ink/fill styles stay readable in both themes.
export const PHOTO_VARS = {
  "--ink": "255 255 255",
  "--fill-1": "rgba(255,255,255,0.07)",
  "--fill-2": "rgba(255,255,255,0.11)",
  "--fill-3": "rgba(255,255,255,0.16)",
  "--hairline": "rgba(255,255,255,0.16)",
  "--t-gold": GOLD,
  color: "#fff",
};

// Black-and-white photo, dark veil and a faint golden icon in the corner.
export function PhotoBackdrop({ photo, mark: Mark, markClass = "w-24 h-24" }) {
  const url = SEMANTIC_IMAGES.find((i) => i.id === photo)?.url;
  return (
    <>
      {url && <img src={url} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(1) contrast(1.05)" }} />}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.84) 100%)" }} />
      {Mark && <Mark aria-hidden="true" className={`absolute -right-2 -bottom-2 opacity-30 ${markClass}`} strokeWidth={0.9} style={{ color: GOLD }} />}
    </>
  );
}

export default function PhotoCard({ photo, mark, markClass, className = "", innerClassName = "", style, children }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: "#141414", border: "1px solid var(--hairline)", ...PHOTO_VARS, ...style }}>
      <PhotoBackdrop photo={photo} mark={mark} markClass={markClass} />
      <div className={`relative z-10 h-full ${innerClassName}`}>{children}</div>
    </div>
  );
}