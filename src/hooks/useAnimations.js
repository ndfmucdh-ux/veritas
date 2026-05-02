import { useReducedMotion } from "framer-motion";

// Central animation variants — respects prefers-reduced-motion
export function useAnimationVariants() {
  const shouldReduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: shouldReduce ? 0 : -8, transition: { duration: 0.25 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35 } },
    exit:    { opacity: 0, transition: { duration: 0.2 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.93 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit:    { opacity: 0, scale: shouldReduce ? 1 : 0.95, transition: { duration: 0.2 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 28 } },
    exit:    { opacity: 0, y: shouldReduce ? 0 : 40, transition: { duration: 0.2 } },
  };

  const slideRight = {
    hidden: { opacity: 0, x: shouldReduce ? 0 : -24 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
    exit:    { opacity: 0, x: shouldReduce ? 0 : 24, transition: { duration: 0.2 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const staggerFast = {
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const bounceIn = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.5 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 18 } },
  };

  const contextMenu = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.88, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 22 } },
    exit:    { opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.15 } },
  };

  return { fadeUp, fadeIn, scaleIn, slideUp, slideRight, stagger, staggerFast, bounceIn, contextMenu };
}

// Tap animation for interactive elements
export const tapScale = { whileTap: { scale: 0.94 }, whileHover: { scale: 1.03 } };
export const tapScaleSm = { whileTap: { scale: 0.97 } };

// Page transition wrapper props
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};