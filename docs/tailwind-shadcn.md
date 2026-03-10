# Tailwind + shadcn Coexistence

- Tailwind is loaded in `src/styles/tailwind.css` after the existing Bootstrap and Velzon theme.
- Preflight is intentionally disabled to avoid competing with Bootstrap reboot styles.
- Use Tailwind classes with the official v4 prefix form: `tw:flex`, `tw:bg-primary`, `tw:hover:bg-primary/90`.
- Import generated or hand-authored shadcn components from `@shadcn/ui/*`.
- Keep legacy Bootstrap and Reactstrap pages untouched unless you are intentionally refactoring an isolated screen.
- Prefer sharing hooks, API clients, and business logic while keeping the presentational layer separate.
- Use `pnpm ui:add <component>` to add future shadcn components through the CLI.
