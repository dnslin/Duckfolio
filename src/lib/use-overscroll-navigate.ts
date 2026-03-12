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

interface SectionDef {
  key: string;
  label: string;
}

interface UseOverscrollNavigateOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  visibleSections: SectionDef[];
  activeSectionRef: React.RefObject<string>;
  onNavigate: (direction: 1 | -1) => void;
  reduced: boolean | null;
}

export interface OverscrollState {
  energy: MotionValue<number>;
  direction: number;
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
  target: HTMLElement | null,
  deltaY: number
): boolean {
  const scrollingEl = document.scrollingElement || document.documentElement;
  let el = target;
  while (el) {
    const isPageScroller =
      el === document.body || el === document.documentElement;
    const src = isPageScroller ? scrollingEl : el;
    const { scrollTop, scrollHeight, clientHeight } = src;
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollable =
      scrollHeight > clientHeight + 1 &&
      (overflowY === "auto" || overflowY === "scroll" || isPageScroller);

    if (isScrollable) {
      if (deltaY > 0 && scrollTop + clientHeight < scrollHeight - EDGE_PX)
        return true;
      if (deltaY < 0 && scrollTop > EDGE_PX) return true;
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
  const directionRef = useRef(0);
  const labelRef = useRef<string | null>(null);
  const lockoutRef = useRef(false);
  const decayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animCtrlRef = useRef<AnimationPlaybackControls | null>(null);

  // Render-visible state (only updated on actual changes)
  const [direction, setDirection] = useState(0);
  const [nextSectionLabel, setNextSectionLabel] = useState<string | null>(null);

  // Touch state
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);

  const gain = reduced ? GAIN_REDUCED : GAIN;

  const resolveNextLabel = useCallback(
    (dir: number): string | null => {
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
      animCtrlRef.current = animate(energy, 0, { duration, ease: EASE });
      directionRef.current = 0;
      labelRef.current = null;
      setDirection(0);
      setNextSectionLabel(null);
    },
    [energy]
  );

  const scheduleDecay = useCallback(() => {
    if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
    decayTimerRef.current = setTimeout(() => {
      if (!lockoutRef.current && energy.get() > 0) {
        resetEnergy(0.4);
      }
    }, DECAY_DELAY_MS);
  }, [energy, resetEnergy]);

  const accumulateEnergy = useCallback(
    (delta: number) => {
      if (lockoutRef.current) return;

      const dir = delta > 0 ? 1 : -1;

      const label = resolveNextLabel(dir);
      if (!label) return;

      // Direction reversal → reset
      if (directionRef.current !== 0 && directionRef.current !== dir) {
        resetEnergy(0.15);
        return;
      }

      // Update direction/label only when changed
      if (directionRef.current !== dir) {
        directionRef.current = dir;
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
        onNavigate(dir as 1 | -1);
        lockoutRef.current = true;
        resetEnergy(0.2);
        setTimeout(() => {
          lockoutRef.current = false;
        }, LOCKOUT_MS);
        return;
      }

      scheduleDecay();
    },
    [energy, gain, onNavigate, resetEnergy, resolveNextLabel, scheduleDecay]
  );

  // ------ Wheel ------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;
      if (canScrollInDirection(e.target as HTMLElement, e.deltaY)) return;
      e.preventDefault();
      accumulateEnergy(e.deltaY);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, accumulateEnergy]);

  // ------ Touch ------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dy = touchStartYRef.current - e.touches[0].clientY;
      const dx = touchStartXRef.current - e.touches[0].clientX;

      if (Math.abs(dy) < Math.abs(dx)) return;
      if (canScrollInDirection(e.target as HTMLElement, dy)) return;

      e.preventDefault();
      accumulateEnergy(dy * 0.3);
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

  return { energy, direction, nextSectionLabel };
}
