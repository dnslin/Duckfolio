# Repository Guidelines

## Project Structure & Module Organization
This repository is a single-package Next.js app managed with `pnpm`. App routes and layouts live in `src/app/`; reusable UI lives in `src/components/` and `src/packages/ui/`; shared logic and hooks live in `src/lib/`; styles live in `src/styles/`; static assets live in `public/`; deployment notes live in `docs/`; extra type declarations live in `types/`. Root config files such as `next.config.ts`, `tailwind.config.mjs`, `wrangler.jsonc`, and `Dockerfile` define build and deployment behavior.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies. Use Node `^18.18.0 || ^20.9.0 || >=22` and `pnpm >=9`.
- `pnpm dev`: start the local Next.js dev server with Turbopack.
- `pnpm build`: create a production build.
- `pnpm start`: serve the production build locally.
- `pnpm lint`: run ESLint with Next.js and TypeScript rules.
- `pnpm pages:build`, `pnpm preview`, `pnpm deploy`: build, preview, and deploy the Cloudflare Pages target.

## Coding Style & Naming Conventions
Use TypeScript/TSX and keep changes localized. Match the surrounding file style: existing code uses 2-space indentation, and quote style is not fully uniform, so consistency within a file matters more than global reformatting. Prefer small single-purpose functions. Export React components in PascalCase (for example, `CustomCursor`), hooks/utilities in camelCase (for example, `useDynamicTheme`), and keep component filenames kebab-case where that pattern already exists, such as `src/components/custom-cursor.tsx`. Run `pnpm lint` before opening a PR.

## Testing Guidelines
There is no standard test runner or `pnpm test` script yet. For now, treat `pnpm lint` and `pnpm build` as the minimum validation gate for every change. If you introduce tests, keep them close to the feature or under a dedicated `tests/` folder, use `*.test.ts(x)` or `*.spec.ts(x)`, and document the command you add.

## Commit & Pull Request Guidelines
Recent history favors descriptive commits, often `feat: ...`, `fix: ...`, or `refactor: ...`, but the repo does not enforce commitlint. Prefer `type: short summary` and keep one logical change per commit. PRs should explain what changed, why it changed, and how it was validated; include screenshots for UI work and mention deployment impact when touching `wrangler.jsonc`, Docker files, or release workflows.

## Security & Configuration Tips
Do not commit secrets. Be careful with changes to `.github/workflows/docker-image.yml`, `Dockerfile`, `docker-compose.yml`, and Cloudflare Pages settings, because they affect release and deployment paths.
