import profileConfig from "../../public/platform-config.json" with { type: "json" };
import type { PlatformConfig, ThemeConfig } from "./types.js";

// JSON imports infer strings; narrow the background option at this boundary.
type JsonConfig = Omit<PlatformConfig, "theme"> & {
  theme?: Omit<ThemeConfig, "backgroundEffect"> & { backgroundEffect?: string };
};

const jsonConfig: JsonConfig = profileConfig;

function isCoverMap(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((cover: unknown) => typeof cover === "string")
  );
}

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

  const covers: unknown = JSON.parse(process.env.NEXT_PUBLIC_PROJECT_COVERS ?? "{}");
  if (!isCoverMap(covers)) {
    throw new Error("Generated project covers must map repository URLs to image URLs");
  }

  return {
    ...config,
    projects: config.projects?.map((project) => {
      const cover = project.links.code ? covers[project.links.code] : undefined;
      return cover ? { ...project, cover } : project;
    }),
    theme: theme ? { ...theme, backgroundEffect } : undefined,
  };
}
