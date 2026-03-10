# LIB GUIDE

This file is path-local. Use the root `AGENTS.md` for repo-wide commands, validation, and deployment rules.

## OVERVIEW

`src/lib` is the typed config/state boundary. It owns the `PlatformConfig` schema, config loading, store bootstrapping, and shared helpers/hooks.

## WHERE TO LOOK

| Task             | Location             | Notes                                             |
| ---------------- | -------------------- | ------------------------------------------------- |
| Config schema    | `types.ts`           | source of truth for `platform-config.json` fields |
| JSON loader      | `config.ts`          | single loader / re-export boundary                |
| Shared store     | `store.ts`           | derives app state from config                     |
| Theme extraction | `useDynamicTheme.ts` | browser-side avatar color sampling                |
| Class helpers    | `utils.ts`           | `cn` shared by UI primitives                      |

## CONVENTIONS

- Change `PlatformConfig` in `types.ts` before or alongside edits to `public/platform-config.json`.
- Keep `config.ts` as the only direct import boundary from `public/platform-config.json`; UI should consume typed exports/store, not the JSON file.
- Keep store logic deterministic and config-derived; prefer fallback values for optional sections instead of component-side branching.
- Keep this directory free of app presentation concerns; no component imports, no DOM markup, no feature copy.
- Isolate browser-only behavior to focused helpers/hooks like `useDynamicTheme`; keep the rest of `src/lib` platform-agnostic.
- Maintain compatibility with build-generated data and config fallbacks; `scripts` own generation, `src/lib` owns typed consumption.

## ANTI-PATTERNS

- Do not rename/remove config fields without updating types, loader, store, and `public/platform-config.json` together.
- Do not import `src/components` or `src/packages/ui` from `src/lib`.
- Do not hardcode feature defaults in UI when they can live in typed config/store helpers.
- Do not move `public/platform-config.json` or create alternate loader paths without updating all producers/consumers.
