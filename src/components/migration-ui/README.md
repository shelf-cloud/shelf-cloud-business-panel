# migration-ui

App-owned compatibility wrappers that keep the **reactstrap prop surface** but
render **Tailwind + shadcn** internally. They let us migrate Bootstrap usage
screen-by-screen by changing only the import line:

```diff
- import { Button, Card, CardBody, Row, Col } from 'reactstrap'
+ import { Button, Card, CardBody, Row, Col } from '@/components/migration-ui'
```

Scope rule: support **only the props the app actually uses** (audited from the
codebase), not the full reactstrap API.

## Components & supported props

| Wrapper | Supported props | Notes |
| --- | --- | --- |
| `Button` | `color`, `size`, `outline`, `block`, `disabled`, `type`, `className`, `onClick`, `tag`, `href`, `asChild` | `color` maps Bootstrap colors (primary/secondary/success/info/warning/danger/light/dark/ghost/muted/link). `size` accepts `sm`/`lg`/`icon` (anything else = default). |
| `Badge` | `color`, `pill`, `className`, `tag`, `asChild` | All Bootstrap colors incl. success/info that shadcn's badge lacks. |
| `Spinner` | `color`, `size`, `className`, `type` | `size="sm"` smaller; `type` accepted but no visual effect. |
| `Card` family | `Card`, `CardBody`→CardContent, `CardHeader`, `CardFooter`, `CardTitle`; `className`, `tag` | Maps reactstrap names to shadcn card primitives. |
| `Container` | `fluid`, `className`, `tag` | Centered with responsive max-widths; `fluid` = full width. |
| `Row` | `className`, `tag` | `flex flex-wrap` with negative gutter margin. |
| `Col` | `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `className`, `tag` | 12-column flex widths + gutter padding. No size = equal flex. Numeric only (object/offset form is not used in the app). |
| `Input` | `type`, `invalid`, `valid`, `bsSize`, `value`, `onChange`, `name`, `id`, `placeholder`, `disabled`, `checked`, `rows`, children (select), `innerRef`, `className` | Polymorphic by `type`: text-like→shadcn Input, `textarea`→shadcn Textarea, `select`→native styled select, `checkbox`/`radio`→native input. `invalid`→`aria-invalid`. `innerRef` only applies to native (select/checkbox/radio) — shadcn Input/Textarea are React-18 function components without `forwardRef`. |
| `Label` | `htmlFor`, `for`, `check`, `className`, `tag` | Accepts both `htmlFor` and reactstrap's `for`. |
| `Modal` family | `Modal` (`isOpen`, `toggle`, `size`, `scrollable`, `backdrop`, `keyboard`), `ModalHeader`→DialogTitle, `ModalBody`, `ModalFooter` | Renders shadcn `Dialog`. `toggle`→`onOpenChange` (close-only). DialogContent renders its own close (X), so `ModalHeader`'s `toggle` X is dropped. |
| `Offcanvas` family | `Offcanvas` (`isOpen`, `toggle`, `direction`), `OffcanvasHeader`→SheetTitle, `OffcanvasBody` | Renders shadcn `Sheet`. `direction` end→right, start→left. |
| `Form` family | `Form`→`<form>`, `FormGroup` (`check`, `row`, default `mb-3`), `FormFeedback` (`type`, `valid`) | `FormFeedback` renders only when it has content (reactstrap passes the error string as children). |
| Dropdown family | `UncontrolledDropdown`, `Dropdown` (`isOpen`/`toggle`), `UncontrolledButtonDropdown`, `DropdownToggle` (`caret`, `tag`), `DropdownMenu` (`end`, `container`), `DropdownItem` (`divider`, `header`, `onClick`), `ButtonGroup` | Renders shadcn (Radix) `DropdownMenu`. `dropdown-menu-end` class or `end` → `align="end"`. `DropdownToggle` uses `asChild` over the button/tag. |
| `Collapse` | `isOpen`, `className`, `id` | CSS grid-rows (0fr/1fr) height animation; children stay mounted (state preserved). |
| `UncontrolledTooltip` | `target` (element id), `placement`, `innerClassName`, `popperClassName`, `style` | Faithful target-by-id reimplementation (portal-positioned on hover/focus) — Radix Tooltip can't reference a target by id. `SCTooltip` builds on this. |
| Tabs family | `Nav` (`tabs`/`pills`/`vertical`…), `NavItem`, `NavLink` (`active`), `TabContent` (`activeTab`), `TabPane` (`tabId`) | Caller keeps active-tab state + click handlers; `TabContent`/`TabPane` use context, panes stay mounted (hidden when inactive). |

## Forms: the Formik ↔ shadcn Field adapter (locked convention)

The app is Formik-driven; shadcn's `Field` docs assume react-hook-form. Migrated
forms use the adapter in `formik-field.tsx`:

```tsx
import { useFormik } from 'formik'
import { FormikField, FieldGroup, getFieldState } from '@/components/migration-ui'

const validation = useFormik({ /* ... */ })

<FieldGroup>
  <FormikField formik={validation} name="title" label="Title" />
  <FormikField formik={validation} name="notes" label="Notes" as="textarea" />
</FieldGroup>
```

- `FormikField` wires `value`/`onChange`/`onBlur`, `touched`/`error`,
  `aria-invalid`, and the `FieldError` message via Formik's `getIn` (dotted &
  nested names work).
- For controls the adapter doesn't cover (custom selects, switches), use the
  re-exported Field primitives directly and read state with `getFieldState`.
- Existing forms can also be migrated by import-swap only, keeping their current
  markup, using the `Form`/`FormGroup`/`FormFeedback` compat wrappers — adopt the
  adapter when a form's structure is actually reworked.

## Tables (react-data-table-component)

Short-term strategy: keep the `react-data-table-component` engine, restyle to
tokens. Migrate a table by swapping its import:

```diff
- import DataTable from 'react-data-table-component'
+ import DataTable from '@components/Common/DataTableSC'
```

`DataTableSC` applies the shared `scTableStyles` (from `@/lib/shadcn/dataTableStyles`)
and `highlightOnHover` by default; per-table `customStyles` merge over the shared
styles. All behavior (sorting, pagination, expansion, selection, loading,
conditional rows) is unchanged — only chrome is themed. For `conditionalRowStyles`,
replace Bootstrap classes (`bg-success bg-opacity-25`) with `style: tableRowTint.success`.
Normalize table action menus with the Dropdown family above (`DropdownMenu`, `DropdownItem`),
status chips with `Badge`, and hints with `UncontrolledTooltip`.

## Conventions

- Wrappers use **self-contained `cva`** color variants rather than layering over
  the shadcn variants, so every Bootstrap color (incl. success/info/warning,
  which shadcn's own variants lack) and Velzon's exact visual treatment are
  preserved. `cn`/tailwind-merge now runs unprefixed, so callers can still rely
  on `cn(variants, className)` (caller `className` last) to override.
- Every wrapper forwards the caller's `className` through `cn(...)` last, so
  caller overrides win.
