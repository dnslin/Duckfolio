import profileConfig from "../../public/platform-config.json" with { type: "json" };
import type { PlatformConfig, ThemeConfig } from "./types.js";

// JSON imports infer strings; narrow the background option at this boundary.
type JsonConfig = Omit<PlatformConfig, "theme"> & {
  theme?: Omit<ThemeConfig, "backgroundEffect"> & { backgroundEffect?: string };
};

const jsonConfig: JsonConfig = profileConfig;

export function getConfig(): PlatformConfig {
  const { theme, ...config } = jsonConfig;
  const backgroundEffect = theme?.backgroundEffect;
  if (
    backgroundEffect !== undefined &&
    backgroundEffect !== "none" &&
    backgroundEffect !== "gradient" &&
    backgroundEffect !== "geometric" &&
    backgroundEffect !== "waves"
  ) {
    throw new Error(`Unsupported background effect: ${backgroundEffect}`);
  }

  return {
    ...config,
    theme: theme ? { ...theme, backgroundEffect } : undefined,
  };
}
