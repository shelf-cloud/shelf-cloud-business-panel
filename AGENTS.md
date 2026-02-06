# AGENTS.md

This file orients agentic coding assistants working in this repo.
Keep it in sync with actual configs and scripts.

## Scope

- Next.js app using the pages router under `src/pages`.
- TypeScript with some JavaScript allowed.
- Formatting/linting governed by Prettier and ESLint configs in repo root.

## Repo facts

- Next.js pages router lives in `src/pages`.
- TypeScript is primary; `allowJs` is enabled for legacy JS files.
- `pnpm` is the pinned package manager.
- Dev server runs on port 3001 via the `dev` script.

## Cursor/Copilot rules

- No rules found in `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md`.

## Package manager

- Use `pnpm` (see `package.json` `packageManager`).
- Prefer `pnpm exec` for ad-hoc CLIs.
- If you must use npm/yarn, keep commands equivalent.

## Common commands

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`
- Lint fix: `pnpm lint:fix`
- Format check: `pnpm format:check`
- Format write: `pnpm format`
- Typecheck (no script): `pnpm exec tsc --noEmit`

## Single file / single test

- Lint one file: `pnpm lint -- --file src/pages/Products.tsx`
- Lint a folder: `pnpm lint -- --dir src/pages`
- Format one file: `pnpm exec prettier --write src/pages/Products.tsx`
- Check formatting for one file: `pnpm exec prettier --check src/pages/Products.tsx`
- Tests: no test runner configured in `package.json`.
- If a test runner is added, include single-test command examples here.

## Project structure

- Next.js pages router in `src/pages`.
- Shared UI in `src/components`.
- Hooks in `src/hooks`.
- Context in `src/context`.
- Utilities in `src/lib`.
- Types in `src/types` and root `typings.d.ts`.
- Styling in `src/styles` with SCSS and Bootstrap/Reactstrap.

## Imports and module resolution

- Base URL is `src`; prefer aliases over long relative paths.
- Common aliases: `@components/*`, `@hooks/*`, `@context/*`, `@lib/*`, `@typesTs/*`, `@auth/*`.
- Import order is enforced by the Prettier sort plugin:
  - `react`/`next` first
  - third-party modules
  - alias imports
  - relative `./` and `../`
- Keep import groups separated with blank lines (plugin enforces).
- Avoid manual resorting; let Prettier handle it.

## Formatting (Prettier)

- No semicolons.
- Single quotes in JS/TS and JSX.
- `printWidth` 180, `tabWidth` 2, spaces only.
- Trailing commas where valid (`es5`).
- `bracketSpacing` true; `bracketSameLine` true.
- Arrow parens always.
- Import sorting enabled; avoid manual reordering.
- Run `pnpm format` after significant edits.

## Linting (ESLint)

- Extends `next/core-web-vitals`.
- Avoid disabling rules; keep scope narrow when needed.
- Hooks linting is enabled; only suppress `react-hooks/exhaustive-deps` with a clear reason.
- Fix lint errors before committing changes.

## TypeScript

- `strict` true; `noUnusedLocals`/`noUnusedParameters` true.
- `allowJs` true; prefer TS/TSX for new code.
- Prefer explicit types for public APIs, props, hooks, and context values.
- Use `type` for unions/aliases and `interface` for object shapes; be consistent per file.
- Avoid `any`; localize and document when unavoidable.
- Prefer narrowing (`typeof`, `in`) over casts.
- Use `ReturnType`, `Partial`, and discriminated unions when helpful.

## React/Next.js patterns

- Function components in PascalCase.
- Hooks start with `use` and live in `src/hooks`.
- Pages live in `src/pages`; use `getServerSideProps` when server data is required.
- `_app.tsx` sets up `SessionProvider` and `AppContext`.
- Keep side effects in `useEffect` and keep dependency arrays accurate.
- Use `React.Fragment` or `<>` where needed, avoid extra wrappers.

## Data fetching and state

- Axios is used for API calls; prefer typed responses.
- SWR is used for client fetches; call `mutate` after writes.
- Use `toast` for user-facing success/error feedback.
- Confirm destructive actions (`confirm()`) before calling APIs.
- Guard early when required inputs are missing.

## Naming conventions

- Components: `PascalCase` file and component names.
- Hooks: `useX`.
- Variables/functions: `camelCase`.
- Types/interfaces: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE` only when truly constant.
- Prefer descriptive names over abbreviations.

## Styling

- Uses SCSS, Bootstrap, and Reactstrap; keep class usage consistent.
- Prefer existing layout components and utility classes before adding new styles.
- If using styled-components, keep it local and avoid global overrides.

## Error handling

- Handle async failures with `try/catch` or `.catch`.
- Backend responses often include `response.data.error` and `response.data.msg`; check both.
- Show meaningful toast messages on errors.
- Avoid swallowing errors silently; log or surface when appropriate.

## JavaScript vs TypeScript

- JS files exist; do not refactor to TS unless required.
- New files should be TS/TSX unless a library requires JS.
- Keep lint/format consistent across both.

## Files to check when changing conventions

- `package.json` for scripts and dependencies.
- `.prettierrc.json` for formatting rules.
- `.eslintrc.json` for lint rules.
- `tsconfig.json` for aliases and TS options.
- `.vscode/settings.json` for on-save behavior.

## Agent workflow tips

- Run `pnpm lint` and `pnpm format:check` before finalizing changes.
- Use `pnpm exec tsc --noEmit` for strict type checking when touching types.
- Keep changes focused; avoid reformatting unrelated files.
- Update this file when scripts or rules change.

## Nonexistent rules notice

- No Cursor/Copilot instruction files detected; if added later, mirror them here.

## Examples

- Lint current file: `pnpm lint -- --file src/pages/Products.tsx`
- Format current file: `pnpm exec prettier --write src/pages/Products.tsx`
- Typecheck: `pnpm exec tsc --noEmit`
- Start dev server: `pnpm dev`
- Build for production: `pnpm build`

## Maintenance

- Keep guidance aligned with actual configs; avoid aspirational rules.
- If a test runner is added, add single-test examples.
