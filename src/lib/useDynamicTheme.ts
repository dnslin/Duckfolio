'use client';

import { useEffect } from 'react';
import ColorThief from 'color-thief-browser';
import { generateColorScale, rgbArrayToHex } from './themes';

function rgbToRgba(rgb: number[], alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function useDynamicTheme(
  avatarUrl: string,
  activePresetId: string,
  isDark: boolean,
) {
  useEffect(() => {
    if (activePresetId !== 'default') return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl;

    img.onload = () => {
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
  }, [avatarUrl, activePresetId, isDark]);
}
