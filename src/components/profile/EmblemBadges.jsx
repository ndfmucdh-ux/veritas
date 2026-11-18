import { motion } from "framer-motion";

// Professional emblem shapes rendered via SVG — no cartoonish emojis
// Each emblem is a geometric heraldic design unique to its achievement

function EmblemSVG({ type, color, size = 56, locked }) {
  const opacity = locked ? 0.25 : 1;
  const glow = locked ? "none" : `drop-shadow(0 0 6px ${color}66)`;

  const emblems = {
    // Cross + flame: first steps
    first_read: (
      <g opacity={opacity} filter={glow}>
        <polygon points="28,6 50,22 50,50 28,62 6,50 6,22" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="28" y1="20" x2="28" y2="48" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="30" x2="38" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="34" r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      </g>
    ),
    // Shield with streak lines
    week_streak: (
      <g opacity={opacity} filter={glow}>
        <path d="M28,8 L48,16 L48,38 Q48,54 28,62 Q8,54 8,38 L8,16 Z" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M20,26 L24,30 L36,18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="20" y1="36" x2="36" y2="36" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <line x1="22" y1="43" x2="34" y2="43" stroke={color} strokeWidth="1.5" opacity="0.3" />
      </g>
    ),
    // Laurel wreath + cross for devoted heart
    month_streak: (
      <g opacity={opacity} filter={glow}>
        <circle cx="28" cy="34" r="14" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M14,34 Q10,28 12,20 Q16,28 20,34" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M42,34 Q46,28 44,20 Q40,28 36,34" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="28" y1="24" x2="28" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="21" y1="31" x2="35" y2="31" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    // Star of David / illuminated: highlights
    highlighter: (
      <g opacity={opacity} filter={glow}>
        <polygon points="28,10 32,22 44,22 35,30 38,42 28,35 18,42 21,30 12,22 24,22" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="28" cy="34" r="5" fill={color} opacity="0.6" />
        <circle cx="28" cy="34" r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
      </g>
    ),
    // Quill + scroll
    scribe: (
      <g opacity={opacity} filter={glow}>
        <rect x="14" y="20" width="28" height="30" rx="3" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M36,16 Q42,10 40,6 Q34,10 36,16 L34,28 Z" fill={color} opacity="0.7" />
        <line x1="20" y1="32" x2="32" y2="32" stroke={color} strokeWidth="1.5" />
        <line x1="20" y1="38" x2="34" y2="38" stroke={color} strokeWidth="1.5" />
        <line x1="20" y1="44" x2="28" y2="44" stroke={color} strokeWidth="1.5" />
      </g>
    ),
    // Chi-Rho + halo
    nt_complete: (
      <g opacity={opacity} filter={glow}>
        <circle cx="28" cy="34" r="20" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="28" cy="34" r="14" fill="none" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <path d="M24,22 L32,46" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20,26 Q28,14 36,26" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="21" y1="36" x2="35" y2="36" stroke={color} strokeWidth="1.5" opacity="0.6" />
      </g>
    ),
    // Column / ancient pillar
    ot_complete: (
      <g opacity={opacity} filter={glow}>
        <rect x="22" y="16" width="12" height="36" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
        <rect x="18" y="14" width="20" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
        <rect x="18" y="48" width="20" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="26" y1="20" x2="26" y2="48" stroke={color} strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="20" x2="30" y2="48" stroke={color} strokeWidth="1" opacity="0.4" />
        <polygon points="28,6 34,14 22,14" fill="none" stroke={color} strokeWidth="1.2" />
      </g>
    ),
    // Target / compass rose
    plan_finish: (
      <g opacity={opacity} filter={glow}>
        <circle cx="28" cy="34" r="18" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="28" cy="34" r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
        <circle cx="28" cy="34" r="5" fill={color} opacity="0.8" />
        <line x1="28" y1="12" x2="28" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="50" x2="28" y2="56" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="34" x2="12" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="34" x2="50" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    // Sword + shield: memorize
    memorize: (
      <g opacity={opacity} filter={glow}>
        <path d="M28,8 L46,14 L46,34 Q46,50 28,60 Q10,50 10,34 L10,14 Z" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="28" y1="18" x2="28" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="28" x2="34" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="52" r="2.5" fill={color} />
      </g>
    ),
    // Prayer hands silhouette
    prayer_50: (
      <g opacity={opacity} filter={glow}>
        <circle cx="28" cy="34" r="18" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M22,26 Q20,34 22,44 L24,44 Q22,36 24,26 Z" fill={color} opacity="0.7" />
        <path d="M34,26 Q36,34 34,44 L32,44 Q34,36 32,26 Z" fill={color} opacity="0.7" />
        <path d="M24,26 Q28,18 32,26" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="38" x2="32" y2="38" stroke={color} strokeWidth="1.5" opacity="0.5" />
      </g>
    ),
    // Open book with rays
    highlights_100: (
      <g opacity={opacity} filter={glow}>
        <path d="M28,20 Q18,22 12,30 Q18,38 28,40 Q38,38 44,30 Q38,22 28,20 Z" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="28" y1="20" x2="28" y2="40" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <circle cx="28" cy="30" r="4" fill={color} opacity="0.7" />
        <line x1="28" y1="12" x2="28" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="16" x2="37" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="16" x2="19" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
    // Stack of books / ledger
    notes_50: (
      <g opacity={opacity} filter={glow}>
        <rect x="14" y="26" width="28" height="22" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
        <rect x="16" y="20" width="24" height="22" rx="2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
        <rect x="18" y="14" width="20" height="22" rx="2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
        <line x1="20" y1="34" x2="36" y2="34" stroke={color} strokeWidth="1.5" />
        <line x1="20" y1="40" x2="32" y2="40" stroke={color} strokeWidth="1.5" opacity="0.7" />
      </g>
    ),
    // Soundwave / headphones
    audio_days_14: (
      <g opacity={opacity} filter={glow}>
        <path d="M16,34 Q16,20 28,20 Q40,20 40,34" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <rect x="12" y="32" width="6" height="12" rx="3" fill={color} opacity="0.8" />
        <rect x="38" y="32" width="6" height="12" rx="3" fill={color} opacity="0.8" />
        <line x1="24" y1="26" x2="24" y2="44" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        <line x1="28" y1="22" x2="28" y2="46" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="26" x2="32" y2="44" stroke={color} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      </g>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 56 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      {emblems[type] || (
        <circle cx="28" cy="34" r="20" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
      )}
    </svg>
  );
}

const EMBLEMS = [
  { id: "first_read",     name: "First Steps",      desc: "Read your first chapter",       color: "#94a3b8", tier: "I",   xp: 50 },
  { id: "week_streak",    name: "Faithful",          desc: "7-day reading streak",          color: "#00e5ff", tier: "II",  xp: 100 },
  { id: "month_streak",   name: "Devoted",           desc: "30-day reading streak",         color: "#f59e0b", tier: "III", xp: 500 },
  { id: "highlighter",    name: "Illuminated",       desc: "Highlight 10 verses",           color: "#fbbf24", tier: "II",  xp: 75 },
  { id: "scribe",         name: "The Scribe",        desc: "Write 10 study notes",          color: "#a78bfa", tier: "II",  xp: 100 },
  { id: "nt_complete",    name: "New Covenant",      desc: "Read all NT books",             color: "#00f5ff", tier: "IV",  xp: 1000 },
  { id: "ot_complete",    name: "Ancient Paths",     desc: "Read all OT books",             color: "#fbbf24", tier: "V",   xp: 2000 },
  { id: "plan_finish",    name: "Plan Finisher",     desc: "Complete a reading plan",       color: "#34d399", tier: "III", xp: 300 },
  { id: "memorize",       name: "Word Keeper",       desc: "Memorize 5 verses",             color: "#a78bfa", tier: "III", xp: 250 },
  { id: "prayer_50",      name: "Intercessor",       desc: "50 prayer journal entries",     color: "#f472b6", tier: "III", xp: 350 },
  { id: "highlights_100", name: "Verse Collector",   desc: "100 verses highlighted",        color: "#34d399", tier: "IV",  xp: 400 },
  { id: "notes_50",       name: "Reflection Keeper", desc: "50 study notes written",        color: "#a78bfa", tier: "III", xp: 300 },
  { id: "audio_days_14",  name: "The Listener",      desc: "14 days of audio listening",    color: "#60a5fa", tier: "II",  xp: 175 },
];

const TIER_COLORS = { I: "#94a3b8", II: "#00e5ff", III: "#fbbf24", IV: "#f97316", V: "#a78bfa" };
const TIER_LABELS = { I: "Bronze", II: "Silver", III: "Gold", IV: "Platinum", V: "Legendary" };

export { EMBLEMS, TIER_COLORS, TIER_LABELS };

export default function EmblemBadges({ streak = 0, prayerCount = 0, highlightCount = 0, noteCount = 0, audioDays = 0, memorizeCount = 0, planCount = 0 }) {

  const isUnlocked = (id) => {
    if (id === "first_read") return streak > 0 || highlightCount > 0 || noteCount > 0;
    if (id === "week_streak") return streak >= 7;
    if (id === "month_streak") return streak >= 30;
    if (id === "highlighter") return highlightCount >= 10;
    if (id === "highlights_100") return highlightCount >= 100;
    if (id === "scribe") return noteCount >= 10;
    if (id === "notes_50") return noteCount >= 50;
    if (id === "prayer_50") return prayerCount >= 50;
    if (id === "audio_days_14") return audioDays >= 14;
    if (id === "memorize") return memorizeCount >= 5;
    if (id === "plan_finish") return planCount >= 1;
    if (id === "nt_complete" || id === "ot_complete") return false; // tracked separately
    return false;
  };

  const unlockedCount = EMBLEMS.filter(e => isUnlocked(e.id)).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>
            Emblems & Honours
          </p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.2)" }}>
            {unlockedCount} of {EMBLEMS.length} earned
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {["I","II","III","IV","V"].map(t => (
            <div key={t} className="w-5 h-5 rounded-sm flex items-center justify-center"
              style={{ background: `${TIER_COLORS[t]}18`, border: `1px solid ${TIER_COLORS[t]}35` }}
              title={TIER_LABELS[t]}>
              <span className="font-cinzel" style={{ fontSize: "7px", color: TIER_COLORS[t] }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {EMBLEMS.map(emblem => {
          const unlocked = isUnlocked(emblem.id);
          return (
            <motion.div key={emblem.id}
              whileTap={unlocked ? { scale: 0.96 } : {}}
              className="flex flex-col items-center gap-2 rounded-2xl px-2 pt-4 pb-3 transition-all relative overflow-hidden"
              style={{
                background: unlocked
                  ? `linear-gradient(160deg, ${emblem.color}0d 0%, ${emblem.color}04 100%)`
                  : "rgb(var(--ink) / 0.02)",
                border: unlocked
                  ? `1px solid ${emblem.color}30`
                  : "1px solid rgb(var(--ink) / 0.05)",
              }}
              title={emblem.desc}
            >
              {/* Tier indicator */}
              <div className="absolute top-2 right-2 w-4 h-4 rounded-sm flex items-center justify-center"
                style={{
                  background: unlocked ? `${TIER_COLORS[emblem.tier]}22` : "rgb(var(--ink) / 0.04)",
                  border: `1px solid ${unlocked ? TIER_COLORS[emblem.tier] + "40" : "rgb(var(--ink) / 0.07)"}`,
                }}>
                <span className="font-cinzel" style={{ fontSize: "6px", color: unlocked ? TIER_COLORS[emblem.tier] : "rgb(var(--ink) / 0.2)" }}>
                  {emblem.tier}
                </span>
              </div>

              {/* Emblem SVG */}
              <EmblemSVG type={emblem.id} color={emblem.color} size={52} locked={!unlocked} />

              {/* Name */}
              <p className="font-cinzel text-[10px] text-center leading-tight font-semibold"
                style={{ color: unlocked ? emblem.color : "rgb(var(--ink) / 0.2)" }}>
                {emblem.name}
              </p>

              {/* Desc */}
              <p className="text-[8px] font-inter text-center leading-tight"
                style={{ color: unlocked ? "rgb(var(--ink) / 0.4)" : "rgb(var(--ink) / 0.15)" }}>
                {emblem.desc}
              </p>

              {/* XP */}
              {unlocked && (
                <span className="text-[8px] font-cinzel px-1.5 py-0.5 rounded-sm"
                  style={{ background: `${emblem.color}15`, color: emblem.color }}>
                  +{emblem.xp} XP
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}