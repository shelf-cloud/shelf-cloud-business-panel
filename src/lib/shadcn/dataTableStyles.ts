import type { TableStyles } from 'react-data-table-component'

/**
 * Shared react-data-table-component (RDT) styling aligned to the Tailwind/shadcn
 * semantic tokens, so tables match the app theme without depending on Bootstrap.
 *
 * RDT injects these via styled-components; CSS variables resolve at runtime, so
 * the values track the same `--background`/`--foreground`/`--border`/... bridge
 * the rest of the UI uses.
 *
 * Apply via the `DataTableSC` wrapper (preferred) or pass directly as the RDT
 * `customStyles` prop.
 */
export const scTableStyles: TableStyles = {
  table: {
    style: {
      backgroundColor: 'var(--card)',
      color: 'var(--foreground)',
    },
  },
  responsiveWrapper: {
    style: {
      scrollbarWidth: 'thin',
    },
  },
  head: {
    style: {
      color: 'var(--foreground)',
      fontSize: '0.8125rem',
      fontWeight: 600,
    },
  },
  headRow: {
    style: {
      backgroundColor: 'var(--muted)',
      color: 'var(--foreground)',
      borderBottomColor: 'var(--border)',
      minHeight: '40px',
    },
  },
  headCells: {
    style: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  rows: {
    style: {
      backgroundColor: 'var(--card)',
      color: 'var(--foreground)',
      minHeight: '44px',
      '&:not(:last-of-type)': {
        borderBottomColor: 'var(--border)',
      },
    },
    stripedStyle: {
      backgroundColor: 'var(--muted)',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
      transitionDuration: '0.15s',
      transitionProperty: 'background-color',
      outlineColor: 'var(--border)',
    },
  },
  cells: {
    style: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  expanderRow: {
    style: {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
    },
  },
  expanderButton: {
    style: {
      color: 'var(--foreground)',
      backgroundColor: 'transparent',
      borderRadius: '4px',
    },
  },
  pagination: {
    style: {
      backgroundColor: 'var(--card)',
      color: 'var(--muted-foreground)',
      borderTopColor: 'var(--border)',
    },
    pageButtonsStyle: {
      color: 'var(--foreground)',
      fill: 'var(--foreground)',
    },
  },
  noData: {
    style: {
      backgroundColor: 'var(--card)',
      color: 'var(--muted-foreground)',
    },
  },
  progress: {
    style: {
      backgroundColor: 'var(--card)',
      color: 'var(--muted-foreground)',
    },
  },
}

/**
 * Token-based background tints for `conditionalRowStyles` `style`, replacing
 * Bootstrap class names like `bg-success bg-opacity-25`.
 */
export const tableRowTint = {
  success: { backgroundColor: 'color-mix(in srgb, var(--success) 22%, var(--card))' },
  danger: { backgroundColor: 'color-mix(in srgb, var(--destructive) 22%, var(--card))' },
  warning: { backgroundColor: 'color-mix(in srgb, var(--warning) 22%, var(--card))' },
  info: { backgroundColor: 'color-mix(in srgb, var(--info) 22%, var(--card))' },
  muted: { backgroundColor: 'var(--muted)' },
} as const
