import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function StudyDropdown({ label, value, items, onChange, placeholder = "Select…" }) {
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
        className={`w-full flex items-center justify-between rounded-xl font-cinzel font-semibold transition-all bg-card border px-4 py-3 ${isOpen ? "border-primary text-primary" : "border-border text-foreground"}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="text-left min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-inter leading-none mb-1">{label}</p>
            <p className="text-sm truncate">{selectedItem?.label || placeholder}</p>
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
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 12px 32px rgba(40,30,15,0.28)",
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
                    background: value === item.value ? "hsl(var(--primary) / 0.12)" : "transparent",
                    borderLeft: value === item.value ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{item.label}</p>
                    {item.subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>}
                  </div>
                  {value === item.value && <Check className="w-3.5 h-3.5 flex-shrink-0 text-primary" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}