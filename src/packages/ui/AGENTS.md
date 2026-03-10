# UI PRIMITIVES

This file is path-local. Use the root `AGENTS.md` for repo-wide commands, validation, and deployment rules.

## OVERVIEW

`src/packages/ui` contains reusable primitives and wrappers around Radix/shadcn-style building blocks. Keep this layer generic, accessible, and app-agnostic.

## WHERE TO LOOK

| Task                    | Location                 | Notes                                           |
| ----------------------- | ------------------------ | ----------------------------------------------- |
| Variant button patterns | `button.tsx`             | `cva` + `buttonVariants`                        |
| Menu primitives         | `dropdown-menu.tsx`      | `data-slot`, Radix semantics, keyboard behavior |
| Media shells            | `avatar.tsx`, `card.tsx` | thin wrappers using `cn`                        |
| Shared class merge      | `src/lib/utils.ts`       | `cn` helper used by this layer                  |

## CONVENTIONS

- Preserve generic APIs based on React/Radix props; compose app-specific behavior in `src/components`, not here.
- Follow the existing `cn(...)`, `cva(...)`, and `data-slot` patterns when extending primitives.
- Keep accessibility semantics intact: focus states, labels, roles, and Radix structure should survive refactors.
- Prefer additive variants or props over one-off hardcoded Duckfolio behavior.
- Avoid store/config imports here; this layer should not know about `useProfileStore`, `platform-config.json`, or feature copy.
- Verify Tailwind class generation when adding utility-heavy changes here, because `tailwind.config.mjs` does not explicitly scan `src/packages/ui`.
- Treat `components.json` as stale metadata; follow the live `src/packages/ui` and `src/styles` paths instead of the generated aliases.

## ANTI-PATTERNS

- Do not import app state, feature data, or business logic into this directory.
- Do not hardcode product-specific text, URLs, icons, or interaction rules into primitives.
- Do not replace Radix-friendly composition with brittle DOM rewrites when a variant or wrapper will do.
- Do not break exported names or class contracts casually; app components already depend on them.
