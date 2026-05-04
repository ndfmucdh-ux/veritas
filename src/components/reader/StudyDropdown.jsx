import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function StudyDropdown({ label, value, items, onChange, icon = "📖" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const calcPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const maxH = Math.min(320, vh * 0.45);

    if (spaceBelow >= 160 || spaceBelow >= rect.top) {
      setMenuStyle({ position: "fixed", top: rect.bottom + 6, left: rect.left, width: rect.width, maxHeight: Math.min(320, spaceBelow - 12), zIndex: 9999 });
    } else {
      setMenuStyle({ position: "fixed", bottom: vh - rect.top + 6, left: rect.left, width: rect.width, maxHeight: Math.min(maxH, rect.top - 12), zIndex: 9999 });
    }
  };

  useEffect(() => {
    if (isOpen) calcPosition();
  }, [isOpen]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    const handleReposition = () => { if (isOpen) calcPosition(); };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  const selectedItem = items.find(item => item.value === value);

  return (
    <div className="relative w-full">
      <motion.button
        ref={triggerRef}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => { e.stopPropagation(); setIsOpen(v => !v); }}
        className="w-full flex items-center justify-between rounded-xl font-cinzel font-semibold transition-all"
        style={{
          padding: "10px 14px",
          background: isOpen ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)",
          border: isOpen ? "1px solid rgba(0,245,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
          color: isOpen ? "#00f5ff" : "rgba(255,255,255,0.75)"
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base flex-shrink-0">{icon}</span>
          <div className="text-left min-w-0">
            <p className="text-[9px] text-white/35 uppercase tracking-wider font-inter leading-none mb-0.5">{label}</p>
            <p className="text-xs truncate">{selectedItem?.label || "Select…"}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex-shrink-0 ml-2">
          <ChevronDown className="w-4 h-4 opacity-60" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scaleY: 0.88, y: -8 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.88, y: -8 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{
              ...menuStyle,
              transformOrigin: "top",
              background: "rgba(8,13,26,0.97)",
              border: "1px solid rgba(0,245,255,0.2)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,245,255,0.05)",
              borderRadius: "0.875rem",
              overflow: "hidden",
            }}
          >
            <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: menuStyle.maxHeight }}>
              {items.map((item, idx) => (
                <motion.button
                  key={item.value}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.012, duration: 0.15 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); onChange(item.value); setIsOpen(false); }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 group transition-colors"
                  style={{
                    background: value === item.value ? "rgba(0,245,255,0.1)" : "transparent",
                    borderLeft: value === item.value ? "2px solid #00f5ff" : "2px solid transparent",
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-inter text-white/85 group-hover:text-white transition-colors truncate">{item.label}</p>
                    {item.subtitle && <p className="text-[10px] text-white/30 mt-0.5 truncate">{item.subtitle}</p>}
                  </div>
                  {value === item.value && <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#00f5ff" }} />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}