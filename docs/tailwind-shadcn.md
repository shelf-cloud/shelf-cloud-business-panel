# Tailwind + shadcn Coexistence

- Tailwind is loaded in `src/styles/tailwind.css` after the existing Bootstrap and Velzon theme.
- Preflight is intentionally disabled to avoid competing with Bootstrap reboot styles.
- Use Tailwind classes with the official v4 prefix form: `tw:flex`, `tw:bg-primary`, `tw:hover:bg-primary/90`.
- Import generated or hand-authored shadcn components from `@shadcn/ui/*`.
- Keep legacy Bootstrap and Reactstrap pages untouched unless you are intentionally refactoring an isolated screen.
- Prefer sharing hooks, API clients, and business logic while keeping the presentational layer separate.
- Use `pnpm ui:add <component>` to add future shadcn components through the CLI.

## Import conventions

- UI components: import from `@shadcn/ui/*` (maps to `src/components/shadcn/ui`).
- `cn` helper: import from `@/lib/shadcn/utils`.
- Keep the `tw:` prefix on every Tailwind utility until Bootstrap is fully removed (avoids class collisions).
- Use semantic tokens (`tw:bg-background`, `tw:text-foreground`, `tw:border-border`) instead of raw colors.

## Theming / dark mode

- Single source of truth is the `data-layout-mode` attribute. The `dark` variant resolves under `[data-layout-mode='dark']` (see `@custom-variant dark` in `src/styles/tailwind.css`).
- `next-themes` is installed but intentionally **not** mounted. Do not add a second theme provider.
- The shadcn semantic tokens bridge to the existing Velzon/Bootstrap variables (`--vz-*` / `--bs-*`) so colors match the current theme. Do not hardcode colors that already have a token.

## Config

- `components.json` `tailwind.css` points at `src/styles/tailwind.css` (the live, imported file). Keep these aligned so `shadcn add` writes to the correct file and does not clobber the token bridge.
