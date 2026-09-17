import { useEffect, useRef, useCallback, useState } from "react";
import {
  useMotionValue,
  animate,
  type MotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";

// ---------------------------------------------------------------------------
// Energy-accumulator overscroll navigation hook
// ---------------------------------------------------------------------------
// Scrolls within content are unaffected; only boundary overscroll accumulates
// "energy" (0→1). Reaching 1.0 triggers section navigation. Decay and lockout
// provide a damping feel similar to iOS pull-to-refresh.

type NavigationDirection = -1 | 1;
type Direction = NavigationDirection | 0;

interface SectionDef {
  key: string;
  label: string;
}

interface UseOverscrollNavigateOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  visibleSections: SectionDef[];
  activeSectionRef: React.RefObject<string>;
  onNavigate: (direction: NavigationDirection) => void;
  reduced: boolean;
}

export interface OverscrollState {
  energy: MotionValue<number>;
  /** MotionValue for smooth visual transforms — resets after energy animation */
  directionMv: MotionValue<number>;
  /** React state for render positioning (top/bottom) — resets immediately */
  direction: Direction;
  nextSectionLabel: string | null;
}

// Tuning knobs
const GAIN = 0.003;
const GAIN_REDUCED = 0.012;
const DECAY_DELAY_MS = 120;
const LOCKOUT_MS = 300;
const EDGE_PX = 5;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canScrollInDirection(
  target: EventTarget | null,
  delta: number,
  axis: "x" | "y" = "y",
): boolean {
  const scrollingEl = document.scrollingElement || document.documentElement;
  let el = target instanceof Element ? target : null;
  while (el) {
    const isPageScroller =
      el === document.body || el === document.documentElement;
    const src = isPageScroller ? scrollingEl : el;
    const position = axis === "y" ? src.scrollTop : src.scrollLeft;
    const extent = axis === "y" ? src.scrollHeight : src.scrollWidth;
    const viewport = axis === "y" ? src.clientHeight : src.clientWidth;
    const style = window.getComputedStyle(el);
    const overflow = axis === "y" ? style.overflowY : style.overflowX;
    const isScrollable =
      extent > viewport + 1 &&
      (overflow === "auto" || overflow === "scroll" || isPageScroller);

    if (isScrollable) {
      if (delta > 0 && position + viewport < extent - EDGE_PX)
        return true;
      if (delta < 0 && position > EDGE_PX) return true;
      if (isPageScroller) break;
    }

    if (!el.parentElement) break;
    el = el.parentElement;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOverscrollNavigate({
  containerRef,
  visibleSections,
  activeSectionRef,
  onNavigate,
  reduced,
}: UseOverscrollNavigateOptions): OverscrollState {
  const energy = useMotionValue(0);
  const directionMv = useMotionValue(0);
  const directionRef = useRef<Direction>(0);
  const labelRef = useRef<string | null>(null);
  const lockoutRef = useRef(false);
  const decayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animCtrlRef = useRef<AnimationPlaybackControls | null>(null);

  // Render-visible state (only updated on actual changes)
  const [direction, setDirection] = useState<Direction>(0);
  const [nextSectionLabel, setNextSectionLabel] = useState<string | null>(null);

  // Touch state
  const previousTouchYRef = useRef(0);
  const previousTouchXRef = useRef(0);

  const gain = reduced ? GAIN_REDUCED : GAIN;

  const resolveNextLabel = useCallback(
    (dir: NavigationDirection): string | null => {
      const idx = visibleSections.findIndex(
        (s) => s.key === activeSectionRef.current
      );
      const next = idx + dir;
      if (next >= 0 && next < visibleSections.length) {
        return visibleSections[next].label;
      }
      return null;
    },
    [visibleSections, activeSectionRef]
  );

  const resetEnergy = useCallback(
    (duration = 0.2) => {
      animCtrlRef.current?.stop();
      animCtrlRef.current = animate(energy, 0, {
        duration,
        ease: EASE,
        onComplete: () => directionMv.set(0),
      });
      directionRef.current = 0;
      labelRef.current = null;
      setDirection(0);
      setNextSectionLabel(null);
    },
    [energy, directionMv]
  );

  const scheduleDecay = useCallback(() => {
    if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
    decayTimerRef.current = setTimeout(() => {
      if (!lockoutRef.current && energy.get() > 0) {
        resetEnergy(0.4);
      }
    }, DECAY_DELAY_MS);
  }, [energy, resetEnergy]);

  // Returns true when energy was accumulated (caller should preventDefault)
  const accumulateEnergy = useCallback(
    (delta: number): boolean => {
      if (lockoutRef.current || delta === 0) return false;

      const dir: NavigationDirection = delta > 0 ? 1 : -1;


      // Direction reversal → reset
      if (directionRef.current !== 0 && directionRef.current !== dir) {
        resetEnergy(0.15);
        return false;
      }

      const label = resolveNextLabel(dir);
      if (!label) return false;

      // Update direction/label only when changed
      if (directionRef.current !== dir) {
        directionRef.current = dir;
        directionMv.set(dir);
        setDirection(dir);
      }
      if (labelRef.current !== label) {
        labelRef.current = label;
        setNextSectionLabel(label);
      }

      const current = energy.get();
      const resistanceFactor = 1 - current * 0.4;
      const increment = Math.abs(delta) * gain * resistanceFactor;
      const next = Math.min(1, current + increment);

      animCtrlRef.current?.stop();
      energy.set(next);

      if (next >= 1) {
        onNavigate(dir);
        lockoutRef.current = true;
        resetEnergy(0.2);
        setTimeout(() => {
          lockoutRef.current = false;
        }, LOCKOUT_MS);
        return true;
      }

      scheduleDecay();
      return true;
    },
    [energy, directionMv, gain, onNavigate, resetEnergy, resolveNextLabel, scheduleDecay]
  );

  // ------ Wheel ------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;
      if (canScrollInDirection(e.target, e.deltaY)) return;
      if (accumulateEnergy(e.deltaY)) {
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, accumulateEnergy]);

  // ------ Touch (vertical + horizontal swipe) ------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      previousTouchYRef.current = e.touches[0].clientY;
      previousTouchXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dy = previousTouchYRef.current - e.touches[0].clientY;
      const dx = previousTouchXRef.current - e.touches[0].clientX;
      // Always advance the sample, including while native scrolling owns the gesture.
      previousTouchYRef.current = e.touches[0].clientY;
      previousTouchXRef.current = e.touches[0].clientX;

      const isVertical = Math.abs(dy) >= Math.abs(dx);
      const primaryDelta = isVertical ? dy : dx;

      if (canScrollInDirection(e.target, primaryDelta, isVertical ? "y" : "x"))
        return;

      if (accumulateEnergy(primaryDelta * 0.3)) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (energy.get() > 0 && energy.get() < 1) {
        resetEnergy(0.4);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef, accumulateEnergy, energy, resetEnergy]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
      animCtrlRef.current?.stop();
    };
  }, []);

  return { energy, directionMv, direction, nextSectionLabel };
}
