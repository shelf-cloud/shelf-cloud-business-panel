import { UnsellablesType } from '@typesTs/returns/unsellables'
import { EllipsisVerticalIcon, ImagesIcon } from 'lucide-react'
import DataTable from 'react-data-table-component'

import { Button } from '../shadcn/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../shadcn/ui/dropdown-menu'

type Props = {
  filterDataTable: UnsellablesType[]
  pending: boolean
  openImagesDialog: (item: UnsellablesType) => void
}

const ReturnUnsellablesTable = ({ filterDataTable, pending, openImagesDialog }: Props) => {
  const conditionalRowStyles = [
    {
      when: (row: UnsellablesType) => row.converted && !row.dispose,
      classNames: ['text-muted'],
    },
    {
      when: (row: UnsellablesType) => !row.converted && row.dispose,
      classNames: ['text-danger'],
    },
  ]

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>SKU</span>,
      selector: (row: UnsellablesType) => row.sku,
      sortable: true,
      wrap: true,
      grow: 0.6,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: UnsellablesType) => row.title,
      sortable: true,
      wrap: true,
      grow: 1.5,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>RMA</span>,
      selector: (row: UnsellablesType) => row.returnRMA,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Date</span>,
      selector: (row: UnsellablesType) => row.date,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Return</span>,
      selector: (row: UnsellablesType) => row.orderNumber,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Reason</span>,
      selector: (row: UnsellablesType) => row.returnReason,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-start fs-6'>Status</span>,
      selector: (row: UnsellablesType) => (row.dispose ? 'Disposed' : row.converted ? 'Converted Sellable' : 'Unsellable'),
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Unsellable Barcode</span>,
      selector: (row: UnsellablesType) => row.barcode,
      sortable: true,
      wrap: false,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'></span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: UnsellablesType) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='tw:data-[state=open]:bg-muted tw:text-muted-foreground tw:flex tw:size-8' size='icon'>
                <EllipsisVerticalIcon />
                <span className='sr-only'>Open actions menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='tw:w-38 tw:rounded-md'>
              <DropdownMenuItem className='tw:text-xs' onSelect={() => openImagesDialog(row)}>
                <ImagesIcon className='tw:mr-2 tw:size-4' />
                Images
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
  return (
    <>
      <DataTable
        // noTableHead={true}
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        dense
        defaultSortAsc={false}
        defaultSortFieldId={4}
        pagination={filterDataTable.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Orders per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
        conditionalRowStyles={conditionalRowStyles}
      />
    </>
  )
}

export default ReturnUnsellablesTable
