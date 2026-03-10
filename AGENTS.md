# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-10
**Commit:** 4920d0c
**Branch:** main

## OVERVIEW

Duckfolio is a static-export Next.js 15 personal-site template managed with `pnpm`.
Runtime content comes from `public/platform-config.json`; prebuild scripts enrich data under `public/`; deployment supports both Cloudflare Pages and Docker.

## LOCAL GUIDES

- `src/components/AGENTS.md`
- `src/lib/AGENTS.md`
- `src/packages/ui/AGENTS.md`
- `scripts/AGENTS.md`

## STRUCTURE

```text
.
|- src/app/          # layout + single home route
|- src/components/   # interactive client UI
|- src/lib/          # typed config/store boundary
|- src/packages/ui/  # reusable UI primitives
|- src/styles/       # global CSS vars + utilities
|- scripts/          # prebuild data mutation/generation
|- public/           # runtime config + assets
|- docs/             # deploy guide + PRD
`- root configs      # Next/Tailwind/ESLint/Wrangler/Docker
```

## WHERE TO LOOK

| Task                      | Location                                                                 | Notes                                                |
| ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Page shell, metadata      | `src/app/layout.tsx`                                                     | imports global styles; metadata comes from config    |
| Home experience           | `src/app/page.tsx`                                                       | single route; sections switch inside one client page |
| Interactive UI            | `src/components/`                                                        | motion, cursor, theme toggle, music player           |
| Shared config/state       | `src/lib/`                                                               | schema, loader, store, theme hook                    |
| Reusable primitives       | `src/packages/ui/`                                                       | generic Radix/shadcn wrappers                        |
| Theme variables/utilities | `src/styles/`                                                            | CSS vars, view transitions, cursor styles            |
| Runtime content           | `public/platform-config.json`                                            | authoritative hand-edited config                     |
| Generated GitHub data     | `public/github-data.json`                                                | build-generated fallback data                        |
| Build data scripts        | `scripts/`                                                               | prebuild mutates `public/`                           |
| Cloudflare deploy         | `wrangler.jsonc`, `docs/deploy-to-cloudflare-pages.md`                   | static Pages path                                    |
| Docker deploy             | `Dockerfile`, `docker-compose.yml`, `.github/workflows/docker-image.yml` | release-affecting                                    |

## CODE MAP

| Symbol             | Type      | Location                                | Refs | Role                                           |
| ------------------ | --------- | --------------------------------------- | ---- | ---------------------------------------------- |
| `Home`             | function  | `src/app/page.tsx:35`                   | 1    | single route UI and section switching          |
| `generateMetadata` | function  | `src/app/layout.tsx:13`                 | 1    | config-driven page metadata                    |
| `useProfileStore`  | store     | `src/lib/store.ts:45`                   | 13   | shared content/state for page + components     |
| `getConfig`        | function  | `src/lib/config.ts:6`                   | 6    | typed loader for `public/platform-config.json` |
| `PlatformConfig`   | interface | `src/lib/types.ts:90`                   | 7    | schema source of truth                         |
| `cn`               | function  | `src/lib/utils.ts:4`                    | 25   | shared class merge helper for primitives       |
| `main`             | function  | `scripts/fetch-github-data.ts:180`      | 1    | GitHub stats generation                        |
| `main`             | function  | `scripts/resolve-project-covers.mjs:55` | 1    | project cover URL resolution                   |

## CONVENTIONS

- `CLAUDE.md` delegates to `AGENTS.md`; keep project instructions here and keep child files path-local.
- Treat `public/platform-config.json` as the content source of truth; keep schema changes aligned with `src/lib/types.ts`, `src/lib/config.ts`, and `src/lib/store.ts`.
- `src/packages/ui/` is the real primitive layer; `components.json` still points at `src/app/globals.css` and `@/components/ui`, so follow the live tree, not the stale Shadcn metadata.
- Global styles live in `src/styles/globals.css`, which imports `src/styles/theme.css`; extend the existing `--theme-*` variables and animation/easing tokens instead of introducing a parallel theme system.
- `src/app/page.tsx` is data-driven: sections disappear when backing config arrays are empty; new sections/features should follow the same visibility pattern.
- `socialLinks.icon` stores raw SVG strings in `public/platform-config.json`; edits there change rendered markup, not a named icon enum.

## ANTI-PATTERNS (THIS PROJECT)

- Do not move or rename `public/platform-config.json`; app runtime, Docker mounts, and prebuild scripts hard-code that path.
- Do not assume `pnpm build` is read-only; `prebuild` may rewrite `public/platform-config.json` and regenerate `public/github-data.json`.
- Do not add server-only Next.js features without validating static export plus Cloudflare Pages compatibility.
- Do not hand-edit `public/github-data.json` as source data; it is generated by `scripts/fetch-github-data.ts`.
- Do not trust `components.json` paths without checking the live directory structure.
- Do not treat `out/` as authored source; it is generated export output and should be ignored when navigating the repo.

## UNIQUE STYLES

- Motion-heavy UI with reduced-motion-aware controls in interactive components.
- Dynamic theme colors derive from the profile avatar via `useDynamicTheme`.
- Theme switching uses View Transitions CSS plus a custom circular reveal.
- Custom cursor and `.magnetic-element` behavior are part of the visual language.
- Tailwind theme extends typography, easing, and `--theme-*` CSS variables.

## COMMANDS

```bash
pnpm dev
pnpm lint
pnpm build
pnpm pages:build
pnpm preview
pnpm deploy
```

## NOTES

- Baseline validation is `pnpm lint` plus `pnpm build`; there is no `pnpm test` script or checked-in test suite today.
- `pnpm build` runs `scripts/resolve-project-covers.mjs` and `scripts/fetch-github-data.ts` first; missing `gh` auth or `GITHUB_TOKEN` should fall back, not block local builds.
- Cloudflare Pages targets `.vercel/output/static` through `@cloudflare/next-on-pages` and Wrangler.
- Docker image publishing on `main` pushes and release creation makes Docker/workflow changes release-affecting.
- Update this file when repo-wide architecture, validation, or deployment rules materially change; keep subtree-specific rules in the nearest child `AGENTS.md`.
