import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { TestContext } from "node:test";
import profileConfig from "../../../public/platform-config.json" with { type: "json" };
import { getConfig } from "../config.js";

test("unsupported background effects are rejected at the configuration boundary", () => {
  const originalEffect = profileConfig.theme.backgroundEffect;
  profileConfig.theme.backgroundEffect = "unsupported-effect";
  try {
    assert.throws(() => getConfig(), Error);
  } finally {
    profileConfig.theme.backgroundEffect = originalEffect;
  }
  assert.equal(getConfig().theme?.backgroundEffect, originalEffect);
});

function coverFixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "duckfolio-covers-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ["scripts", "public", "src/lib"]) {
    mkdirSync(join(root, directory), { recursive: true });
  }
  for (const file of ["scripts/resolve-project-covers.mjs", "next.config.ts", "src/lib/config.ts"]) {
    copyFileSync(new URL(`../../../${file}`, import.meta.url), join(root, file));
  }
  writeFileSync(join(root, "package.json"), '{"type":"module"}');
  const projects = [
    {
      id: "public-project", title: "Public project", description: "Example", cover: "/configured.webp",
      tags: [], category: "tools", links: { code: "https://github.com/example/project" },
    },
    {
      id: "website", title: "Website", description: "Not GitHub", cover: "/website.webp",
      tags: [], category: "tools", links: { demo: "https://example.com" },
    },
  ];
  const source = JSON.stringify({ ...profileConfig, projects }, null, 4) + "\n";
  const sourcePath = join(root, "public/platform-config.json");
  writeFileSync(sourcePath, source);

  function resolveCovers(ghResponse: string) {
    const mockPath = join(root, "mock-gh.mjs");
    writeFileSync(mockPath, `import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
childProcess.execFileSync = (command, args) => { ${ghResponse} };
syncBuiltinESMExports();`);
    execFileSync(process.execPath, ["--import", pathToFileURL(mockPath).href, join(root, "scripts/resolve-project-covers.mjs")], { stdio: "pipe" });
    assert.deepEqual(readFileSync(sourcePath), Buffer.from(source), "cover resolution must preserve source bytes");
  }

  function consumeProjects(): unknown {
    const code = `import nextConfig from ${JSON.stringify(pathToFileURL(join(root, "next.config.ts")).href)};
import { getConfig } from ${JSON.stringify(pathToFileURL(join(root, "src/lib/config.ts")).href)};
process.env.NEXT_PUBLIC_PROJECT_COVERS = nextConfig.env?.NEXT_PUBLIC_PROJECT_COVERS ?? "{}";
console.log(JSON.stringify(getConfig().projects));`;
    const output = execFileSync(process.execPath, ["--import", import.meta.resolve("tsx"), "--input-type=module", "--eval", code], { cwd: root, encoding: "utf8", stdio: "pipe" });
    return JSON.parse(output);
  }

  return { projects, resolveCovers, consumeProjects };
}

test("metadata failures retain every project and use generated fallback covers", (t) => {
  const fixture = coverFixture(t);
  fixture.resolveCovers('if (args[0] === "auth") return ""; throw new Error("API outage");');
  assert.deepEqual(fixture.consumeProjects(), [
    { ...fixture.projects[0], cover: "https://socialify.git.ci/example/project/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto" },
    fixture.projects[1],
  ]);
});

test("generated custom previews reach the page configuration without changing source data", (t) => {
  const fixture = coverFixture(t);
  const preview = "https://repository-images.githubusercontent.com/example/custom";
  fixture.resolveCovers(`if (args[0] === "auth") return ""; return ${JSON.stringify(JSON.stringify({ data: { repository: { isPrivate: false, openGraphImageUrl: preview } } }))};`);
  assert.deepEqual(fixture.consumeProjects(), [{ ...fixture.projects[0], cover: preview }, fixture.projects[1]]);
});

test("unavailable gh still generates usable covers without rewriting source data", (t) => {
  const fixture = coverFixture(t);
  fixture.resolveCovers('throw new Error("gh unavailable");');
  assert.deepEqual(fixture.consumeProjects(), [
    { ...fixture.projects[0], cover: "https://socialify.git.ci/example/project/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto" },
    fixture.projects[1],
  ]);
});

test("development without generated covers keeps configured projects and covers", (t) => {
  const fixture = coverFixture(t);
  assert.deepEqual(fixture.consumeProjects(), fixture.projects);
});
