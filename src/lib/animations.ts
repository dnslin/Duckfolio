import type { Variants } from "framer-motion";

// Shared easing curves (module-level constants per project convention)
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_QUINT = [0.19, 1, 0.22, 1] as const;

// ---------------------------------------------------------------------------
// Section container variants
// ---------------------------------------------------------------------------
// Used with AnimatePresence on section wrappers.
// Built-in staggerChildren propagates to direct children with matching variants.

export const sectionVariants: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: EASE_OUT_EXPO,
      filter: { duration: 0.4 },
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(8px)",
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, filter: { duration: 0.4 } },
  },
};

// Reduced-motion: opacity only, no stagger delay
export const sectionReducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

// ---------------------------------------------------------------------------
// Reusable animation variants
// ---------------------------------------------------------------------------
// Each can be used as stagger children under a sectionVariants parent,
// or standalone with explicit initial/animate props.

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

// Reduced-motion child variant (opacity only, shared by all reduced items)
export const reducedItem: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

// ---------------------------------------------------------------------------
// Stagger container (for nested stagger inside a section)
// ---------------------------------------------------------------------------

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};

// Stagger child items
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

// Faster stagger for small elements (badges, icons)
export const staggerItemCompact: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
  },
};
