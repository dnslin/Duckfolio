# SCRIPTS GUIDE

This file is path-local. Use the root `AGENTS.md` for repo-wide commands, validation, and deployment rules.

## OVERVIEW

`scripts` contains build-time Node/TSX utilities. These files run during `prebuild`, talk to external services, and may mutate or generate files under `public/`.

## WHERE TO LOOK

| Task                     | Location                     | Notes                                                       |
| ------------------------ | ---------------------------- | ----------------------------------------------------------- |
| GitHub stats generation  | `fetch-github-data.ts`       | GraphQL + fallback `public/github-data.json`                |
| Project cover resolution | `resolve-project-covers.mjs` | updates `public/platform-config.json` from GitHub/Socialify |
| Script TS settings       | `../tsconfig.scripts.json`   | Node-style module resolution for TS scripts                 |

## CONVENTIONS

- Keep scripts idempotent: repeated runs should converge on the same file contents when inputs have not changed.
- Preserve output paths: `public/platform-config.json` is authoritative runtime config; `public/github-data.json` is generated fallback/build data.
- Degrade gracefully when optional auth/tools are missing. `gh` and `GITHUB_TOKEN` improve results but should not make local builds unusable.
- Load script-only env/config the way existing scripts do; `fetch-github-data.ts` manually reads `.env.local` because `tsx` does not auto-load it.
- Use Node APIs, explicit logs, and schema-stable JSON writes; new scripts should fit `tsconfig.scripts.json`.
- Assume `pnpm build` may dirty the worktree because `prebuild` runs these files first.

## ANTI-PATTERNS

- Do not move or rename generated output paths without updating runtime consumers, docs, and deployment mounts.
- Do not assume network, `gh`, or `GITHUB_TOKEN` are always available.
- Do not silently change JSON shape for generated/public data.
- Do not use browser-only APIs or app-layer imports in build scripts.
