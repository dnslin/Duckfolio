'use client';

import { useEffect } from 'react';
import ColorThief from 'color-thief-browser';
import { applyThemePreset, clearInlineThemeStyles, generateColorScale, rgbArrayToHex } from './themes';
import type { ThemeColors } from './types';

function rgbToRgba(rgb: readonly [number, number, number], alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function useDynamicTheme(
  avatarUrl: string,
  activePresetId: string,
  isDark: boolean,
  customColors?: Partial<ThemeColors>,
) {
  useEffect(() => {
    if (activePresetId !== 'default') {
      applyThemePreset(activePresetId, isDark, customColors);
      return;
    }

    clearInlineThemeStyles();
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;

      const thief = new ColorThief();
      const main = thief.getColor(img);
      const palette = thief.getPalette(img, 3) ?? [];
      const secondary = palette[1] ?? main;

      const root = document.documentElement;
      const alpha = isDark ? 0.85 : 1;

      root.style.setProperty('--theme-primary', rgbToRgba(main, alpha));
      root.style.setProperty('--theme-secondary', rgbToRgba(secondary, alpha));

      const primaryScale = generateColorScale(rgbArrayToHex(main), isDark);
      const secondaryScale = generateColorScale(rgbArrayToHex(secondary), isDark);

      for (const [step, value] of Object.entries(primaryScale)) {
        root.style.setProperty(`--theme-primary-${step}`, value);
      }
      for (const [step, value] of Object.entries(secondaryScale)) {
        root.style.setProperty(`--theme-secondary-${step}`, value);
      }
    };
    img.src = avatarUrl;

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [avatarUrl, activePresetId, isDark, customColors]);
}
