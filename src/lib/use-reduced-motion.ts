"use client";

import { useSyncExternalStore } from "react";

const preference = typeof window === "undefined"
  ? null
  : window.matchMedia("(prefers-reduced-motion: reduce)");

function subscribe(onChange: () => void) {
  preference?.addEventListener("change", onChange);
  return () => preference?.removeEventListener("change", onChange);
}

const getSnapshot = () => preference?.matches ?? true;
const getServerSnapshot = () => true;

// Motion 13 samples this preference once; native change events also cover live changes.
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
