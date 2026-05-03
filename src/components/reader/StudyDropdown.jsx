import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function StudyDropdown({ label, value, items, onChange, icon = "📖" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = items.find(item => item.value === value);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-cinzel text-sm font-semibold transition-all"
        style={{
          background: isOpen ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.06)",
          border: isOpen ? "1px solid rgba(0,245,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
          color: isOpen ? "#00f5ff" : "rgba(255,255,255,0.8)"
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div className="text-left">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-inter">{label}</p>
            <p className="text-sm">{selectedItem?.label || "Select..."}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-hidden shadow-2xl"
            style={{
              background: "rgba(10,15,30,0.95)",
              border: "1px solid rgba(0,245,255,0.25)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {items.map((item, idx) => (
                <motion.button
                  key={item.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-inter transition-colors flex items-center justify-between group"
                  style={{
                    background: value === item.value ? "rgba(0,245,255,0.12)" : "transparent",
                    borderLeft: value === item.value ? "3px solid #00f5ff" : "3px solid transparent"
                  }}
                >
                  <div>
                    <p className="text-white group-hover:text-cyan transition-colors">{item.label}</p>
                    {item.subtitle && <p className="text-[11px] text-white/30 mt-0.5">{item.subtitle}</p>}
                  </div>
                  {value === item.value && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-2 h-2 rounded-full bg-cyan"
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}