import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const coversPath = resolve(process.cwd(), "public/project-covers.json");

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1:3000", "localhost:3000"],
  env: {
    NEXT_PUBLIC_PROJECT_COVERS: existsSync(coversPath) ? readFileSync(coversPath, "utf8") : "{}",
  },
};

export default nextConfig;

