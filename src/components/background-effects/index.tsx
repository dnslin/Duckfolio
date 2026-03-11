"use client";

import dynamic from "next/dynamic";
import type { ThemeConfig } from "@/lib/types";

const effects: Record<string, React.ComponentType> = {
  gradient: dynamic(() => import("./gradient-bg")),
  geometric: dynamic(() => import("./geometric-bg")),
  waves: dynamic(() => import("./waves-bg")),
};

interface BackgroundEffectsProps {
  effect?: ThemeConfig["backgroundEffect"];
}

export default function BackgroundEffects({ effect }: BackgroundEffectsProps) {
  if (!effect || effect === "none") return null;
  const Effect = effects[effect];
  return Effect ? <Effect /> : null;
}
