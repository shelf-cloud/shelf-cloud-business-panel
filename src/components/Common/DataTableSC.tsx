import DataTable, { type TableProps } from 'react-data-table-component'

import { scTableStyles } from '@/lib/shadcn/dataTableStyles'

/**
 * Drop-in replacement for react-data-table-component's default export that
 * applies the shared Tailwind/shadcn-aligned table styles (scTableStyles) and
 * sensible defaults. Behavior (sorting, pagination, expansion, selection,
 * loading, conditional rows) is unchanged — only the visual chrome is themed.
 *
 * Migrate a table by swapping the import:
 *   - import DataTable from 'react-data-table-component'
 *   + import DataTable from '@components/Common/DataTableSC'
 *
 * Per-table `customStyles` are merged over the shared styles (caller wins per
 * top-level key).
 */
function DataTableSC<T>({ customStyles, highlightOnHover, ...props }: TableProps<T>) {
  return (
    <DataTable<T>
      customStyles={{ ...scTableStyles, ...customStyles }}
      highlightOnHover={highlightOnHover ?? true}
      {...props}
    />
  )
}

export default DataTableSC
