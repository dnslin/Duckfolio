# COMPONENTS GUIDE

This file is path-local. Use the root `AGENTS.md` for repo-wide commands, validation, and deployment rules.

## OVERVIEW

`src/components` holds app-specific client UI: motion, cursor/theme controls, embeds, and composition around store-backed data.

## WHERE TO LOOK

| Task                       | Location                                              | Notes                                                              |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Theme shell                | `theme-provider.tsx`, `toggle-theme.tsx`              | avatar-based colors + theme switching                              |
| Cursor / hover affordances | `custom-cursor.tsx`                                   | global listeners, `MutationObserver`, `.magnetic-element` contract |
| Media/embed UI             | `music-player.tsx`                                    | whitelist + iframe sandbox rules                                   |
| Hero card interaction      | `interactive-card.tsx`                                | 3D tilt and touch/mouse behavior                                   |
| Simple store consumers     | `avatar.tsx`, `social-links.tsx`, `website-links.tsx` | presentational wrappers around `useProfileStore`                   |

## CONVENTIONS

- Keep app composition here; keep generic primitives in `src/packages/ui` and shared data/schema logic in `src/lib`.
- Use `useProfileStore` or props for content/state; do not import `public/platform-config.json` directly from a component.
- Add `"use client"` only when the file truly needs browser APIs, local state, effects, motion, or event listeners.
- Preserve reduced-motion, keyboard focus, aria labels, and mobile behavior when adding animations or embeds.
- Reuse existing CSS variables (`--theme-*`) and established hooks/classes like `.magnetic-element` only when the effect is intentional across the app.
- Clean up global listeners, timers, observers, and animation frames inside effects.
- Treat raw SVG icon markup as trusted config input only; be explicit when using `dangerouslySetInnerHTML`.

## ANTI-PATTERNS

- Do not move config/store parsing or schema logic into components.
- Do not add app-specific markup or state to `src/packages/ui`.
- Do not add new browser-global listeners without cleanup and a real need.
- Do not add motion that ignores `prefers-reduced-motion` or breaks small screens.
- Do not fetch or generate GitHub/config data from components; that belongs in `scripts` or `src/lib`.
