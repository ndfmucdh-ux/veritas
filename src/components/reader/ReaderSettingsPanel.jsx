import { motion, AnimatePresence } from "framer-motion";

export default function ReaderSettingsPanel({
  open,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  showNumbers,
  setShowNumbers,
  oledMode,
  setOledMode,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.07)" }}
          >
            <SettingRow label="Font Size">
              <div className="flex items-center gap-2">
                <Stepper onClick={() => setFontSize(f => Math.max(12, f - 2))}>−</Stepper>
                <span className="text-sm text-white/70 w-7 text-center font-inter">{fontSize}</span>
                <Stepper onClick={() => setFontSize(f => Math.min(32, f + 2))}>+</Stepper>
              </div>
            </SettingRow>
            <SettingRow label="Font">
              <div className="flex gap-2">
                {[["inter", "Sans"], ["playfair", "Serif"], ["cinzel", "Classic"]].map(([f, l]) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFontFamily(f)}
                    className="text-xs px-3 py-1 rounded-lg font-inter transition-all focus:outline-none focus:ring-2 focus:ring-cyan/70"
                    style={{
                      background: fontFamily === f ? "rgba(0,245,255,0.15)" : "rgb(var(--ink) / 0.05)",
                      color: fontFamily === f ? "#00f5ff" : "rgb(var(--ink) / 0.4)",
                      border: fontFamily === f ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Verse Numbers">
              <Toggle value={showNumbers} onChange={() => setShowNumbers(v => !v)} />
            </SettingRow>
            <SettingRow label="OLED Dark Mode">
              <Toggle value={oledMode} onChange={() => {
                const next = !oledMode;
                setOledMode(next);
                localStorage.setItem("veritas_oled_mode", String(next));
              }} />
            </SettingRow>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stepper({ children, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold font-inter focus:outline-none focus:ring-2 focus:ring-cyan/70"
      style={{ background: "var(--fill-3)", color: "rgb(var(--ink) / 0.6)" }}
    >
      {children}
    </motion.button>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.35)" }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <motion.button
      type="button"
      aria-pressed={value}
      onClick={onChange}
      className="w-11 h-6 rounded-full relative flex items-center px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/70"
      style={{ background: value ? "rgba(0,245,255,0.3)" : "rgb(var(--ink) / 0.08)" }}
    >
      <motion.span
        animate={{ x: value ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}