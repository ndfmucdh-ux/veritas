import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function StudyDropdown({ label, value, items, onChange, icon = "📖" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Calculate position when opening so the menu is never clipped
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const menuHeight = Math.min(384, viewportHeight * 0.5); // max-h-96 = 384px

      if (spaceBelow >= menuHeight || spaceBelow > 150) {
        // Open downward
        setMenuStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.min(384, spaceBelow - 16),
          zIndex: 9999,
        });
      } else {
        // Open upward
        setMenuStyle({
          position: "fixed",
          bottom: viewportHeight - rect.top + 8,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.min(384, rect.top - 16),
          zIndex: 9999,
        });
      }
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const menuHeight = Math.min(384, viewportHeight * 0.5);
        if (spaceBelow >= menuHeight || spaceBelow > 150) {
          setMenuStyle(prev => ({ ...prev, top: rect.bottom + 8, bottom: undefined, left: rect.left, width: rect.width, maxHeight: Math.min(384, spaceBelow - 16) }));
        } else {
          setMenuStyle(prev => ({ ...prev, bottom: viewportHeight - rect.top + 8, top: undefined, left: rect.left, width: rect.width, maxHeight: Math.min(384, rect.top - 16) }));
        }
      }
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen]);

  const selectedItem = items.find(item => item.value === value);

  return (
    <div className="relative w-full">
      <motion.button
        ref={triggerRef}
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
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              ...menuStyle,
              background: "rgba(10,15,30,0.97)",
              border: "1px solid rgba(0,245,255,0.25)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            <div className="overflow-y-auto scrollbar-hide h-full">
              {items.map((item) => (
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
                    <div className="w-2 h-2 rounded-full bg-cyan flex-shrink-0" />
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