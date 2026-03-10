import type { ThemeColors } from './types';

// --- Types ---

export interface ThemePreset {
  id: string;
  name: string;
  colors: ThemeColors;
}

// --- Color Utilities ---

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  return [
    parseInt(full.substring(0, 2), 16),
    parseInt(full.substring(2, 4), 16),
    parseInt(full.substring(4, 6), 16),
  ];
}

export function rgbArrayToHex(rgb: number[]): string {
  return (
    '#' +
    rgb
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

function hexToHue(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60);
}

export function hexToRgba(hex: string, alpha = 1): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

// --- Color Scale Generation ---

// [saturation%, lightness%] per scale step
const LIGHT_SCALE: [number, number][] = [
  [100, 95], [95, 90], [90, 80], [85, 70], [80, 60],
  [77, 50], [80, 45], [85, 40], [90, 35], [95, 30],
];

const DARK_SCALE: [number, number][] = [
  [50, 15], [55, 20], [60, 25], [65, 30], [70, 35],
  [90, 48], [80, 55], [85, 60], [90, 65], [95, 70],
];

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export function generateColorScale(
  hex: string,
  isDark: boolean,
): Record<number, string> {
  const hue = hexToHue(hex);
  const scale = isDark ? DARK_SCALE : LIGHT_SCALE;
  const result: Record<number, string> = {};
  SCALE_STEPS.forEach((step, i) => {
    result[step] = `hsl(${hue}, ${scale[i][0]}%, ${scale[i][1]}%)`;
  });
  return result;
}

// --- Presets ---

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: '默认',
    colors: {
      primary: '#FF6747',
      secondary: '#FFC997',
      accent: '#FF8A65',
      background: '#FFFFFF',
      surface: '#F8F8F8',
      text: '#121212',
    },
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    colors: {
      primary: '#A855F7',
      secondary: '#22D3EE',
      accent: '#F472B6',
      background: '#0F0F1A',
      surface: '#1A1A2E',
      text: '#E0E0FF',
    },
  },
  {
    id: 'minimal',
    name: '极简',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#4B5563',
      background: '#FAFAFA',
      surface: '#F3F4F6',
      text: '#111827',
    },
  },
  {
    id: 'nature',
    name: '自然',
    colors: {
      primary: '#22C55E',
      secondary: '#86EFAC',
      accent: '#4ADE80',
      background: '#F0FDF4',
      surface: '#ECFDF5',
      text: '#14532D',
    },
  },
  {
    id: 'sunset',
    name: '日落',
    colors: {
      primary: '#F97316',
      secondary: '#FBBF24',
      accent: '#FB923C',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: '#78350F',
    },
  },
  {
    id: 'ocean',
    name: '海洋',
    colors: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#06B6D4',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0C4A6E',
    },
  },
];

export function getPresetById(id: string): ThemePreset {
  return themePresets.find((p) => p.id === id) ?? themePresets[0];
}

// --- Persistence ---

const STORAGE_KEY = 'duckfolio-theme-preset';

export function getSavedPresetId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function savePresetId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // silent
  }
}

// --- Apply / Clear ---

export function applyThemePreset(
  presetId: string,
  customColors?: Partial<ThemeColors>,
): void {
  if (typeof document === 'undefined') return;

  const preset = getPresetById(presetId);
  const colors = { ...preset.colors };

  if (customColors) {
    for (const [key, value] of Object.entries(customColors)) {
      if (value && isValidHexColor(value)) {
        colors[key as keyof ThemeColors] = value;
      }
    }
  }

  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const alpha = isDark ? 0.85 : 1;

  root.style.setProperty('--theme-primary', hexToRgba(colors.primary, alpha));
  root.style.setProperty('--theme-secondary', hexToRgba(colors.secondary, alpha));

  const primaryScale = generateColorScale(colors.primary, isDark);
  const secondaryScale = generateColorScale(colors.secondary, isDark);

  for (const [step, value] of Object.entries(primaryScale)) {
    root.style.setProperty(`--theme-primary-${step}`, value);
  }
  for (const [step, value] of Object.entries(secondaryScale)) {
    root.style.setProperty(`--theme-secondary-${step}`, value);
  }

  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-text', colors.text);
}

export function clearInlineThemeStyles(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const baseProps = [
    '--theme-primary', '--theme-secondary',
    '--theme-accent', '--theme-background', '--theme-surface', '--theme-text',
  ];
  for (const prop of baseProps) {
    root.style.removeProperty(prop);
  }
  for (const step of SCALE_STEPS) {
    root.style.removeProperty(`--theme-primary-${step}`);
    root.style.removeProperty(`--theme-secondary-${step}`);
  }
}
