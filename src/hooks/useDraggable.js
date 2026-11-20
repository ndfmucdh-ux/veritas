import { useCallback, useEffect, useRef } from "react";
import { animate, useDragControls, useMotionValue } from "framer-motion";

const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || { x: 0, y: 0 }; } catch { return { x: 0, y: 0 }; }
};

/**
 * Lets the user drag a fixed floating element by a handle. The spot is remembered,
 * kept on screen, and a drag never counts as a tap.
 * Spread `rootProps` on the motion element and `handleProps` on the part you grab.
 */
export default function useDraggable(storageKey) {
  const ref = useRef(null);
  const dragged = useRef(false);
  const controls = useDragControls();
  const x = useMotionValue(load(storageKey).x);
  const y = useMotionValue(load(storageKey).y);

  const keepOnScreen = useCallback((save = false) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 8;
    const top = pad + 56; // stay below the header
    const dx = r.left < pad ? pad - r.left : r.right > window.innerWidth - pad ? window.innerWidth - pad - r.right : 0;
    const dy = r.top < top ? top - r.top : r.bottom > window.innerHeight - pad ? window.innerHeight - pad - r.bottom : 0;
    if (dx || dy) {
      animate(x, x.get() + dx, { duration: 0.2 });
      animate(y, y.get() + dy, { duration: 0.2 });
    }
    if (save) localStorage.setItem(storageKey, JSON.stringify({ x: x.get() + dx, y: y.get() + dy }));
  }, [storageKey, x, y]);

  useEffect(() => {
    keepOnScreen();
    const onResize = () => keepOnScreen(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [keepOnScreen]);

  return {
    rootProps: {
      ref,
      drag: true,
      dragListener: false,
      dragControls: controls,
      dragMomentum: false,
      dragElastic: 0,
      style: { x, y },
      onDragStart: () => { dragged.current = true; },
      onDragEnd: () => {
        keepOnScreen(true);
        setTimeout(() => { dragged.current = false; }, 50);
      },
    },
    handleProps: {
      onPointerDown: (e) => controls.start(e),
      style: { touchAction: "none" },
    },
    /** Wrap a click handler so it is ignored right after a drag. */
    onTap: (fn) => (e) => { if (!dragged.current) fn(e); },
  };
}