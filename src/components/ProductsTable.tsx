/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import type { ProductStateValue } from '@hooks/products/productFilters'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { loadBarcode, sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import type { Product } from '@typings'
import DataTable from 'react-data-table-component'
import { Badge, Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from '@/components/migration-ui'

import CopyTextToClipboard from './ui/CopyTextToClipboard'
import SCTooltip from './ui/SCTooltip'

type CloneProductModal = {
  isOpen: boolean
  originalId: number
  originalName: string
  originalSku: string
}

type Props = {
  tableData: Product[]
  pending: boolean
  changeProductState: (newState: ProductStateValue, inventoryId: number, sku: string) => Promise<void>
  setSelectedRows: (selectedRows: Product[]) => void
  toggledClearRows: boolean
  setcloneProductModal?: (prev: CloneProductModal) => void
}

const ProductsTable = ({ tableData, pending, changeProductState, setSelectedRows, toggledClearRows, setcloneProductModal }: Props) => {
  const { setModalProductInfo, state } = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Product[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'></span>,
      selector: () => <></>,
      sortable: true,
      left: true,
      compact: true,
      width: '13px',
      sortFunction: (rowA: Product, rowB: Product) => sortNumbers(Number(rowA.inventoryId), Number(rowB.inventoryId)),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Image</span>,
      selector: (row: Product) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`}>
            <div
              style={{
                width: '35px',
                height: '45px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '65px',
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: Product) => {
        return (
          <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-0 tw:pe-2'>
            <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:text-[11.2px]'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='tw:m-0 tw:p-0 tw:text-primary tw:font-semibold tw:text-[13px]'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='tw:m-0 tw:p-0 tw:text-black tw:font-semibold tw:text-[11.2px] tw:text-wrap'>{row.title}</span>
            {row.note != '' && <i className='ri-information-fill tw:text-[16.25px] tw:text-warning' id={`tooltip${row.inventoryId}`} />}
            {row.note != '' && (
              <SCTooltip target={`tooltip${row.inventoryId}`} placement='right' key={`tooltip${row.inventoryId}`}>
                <p className='tw:text-[11.2px] tw:text-primary tw:m-0 tw:p-0'>{row.note}</p>
              </SCTooltip>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      minWidth: '200px',
      sortFunction: (rowA: Product, rowB: Product) => sortStringsCaseInsensitive(rowA.title.toLowerCase(), rowB.title.toLowerCase()),
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: Product) => {
        return (
          <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:justify-start tw:gap-1'>
            {row.asin !== '' && (
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <a className='tw:m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                  {row.asin}
                </a>
                <CopyTextToClipboard text={row.asin} label='ASIN' />
              </div>
            )}
            {row.fnSku !== '' && (
              <p className='tw:m-0'>
                {row.fnSku} <CopyTextToClipboard text={row.fnSku} label='FNSKU' />
              </p>
            )}
            {row.barcode !== '' && (
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <a className='tw:m-0 tw:text-info' href='#' onClick={() => loadBarcode(row)}>
                  {row.barcode}
                </a>
                <CopyTextToClipboard text={row.barcode} label='Barcode' />
              </div>
            )}
          </div>
        )
      },
      sortable: false,
      compact: true,
      minWidth: '130px',
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Status</span>,
      selector: (row: Product) => (row.activeState ? 'Active' : 'Inactive'),
      sortable: true,
      compact: true,
      width: '90px',
      cell: (row: Product) => <Badge color={row.activeState ? 'success' : 'secondary'}>{row.activeState ? 'Active' : 'Inactive'}</Badge>,
      sortFunction: (rowA: Product, rowB: Product) => sortNumbers(Number(rowA.activeState), Number(rowB.activeState)),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Brand</span>,
      selector: (row: Product) => row.brand,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Supplier</span>,
      selector: (row: Product) => row.supplier,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
      width: '100px',
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Quantity</span>,
      selector: (row: Product) => {
        return (
          <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:justify-center tw:items-center'>
            <Button
              color='ghost'
              className='tw:text-[11.2px] tw:!text-primary tw:hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]'
              onClick={() => {
                setModalProductInfo(row.inventoryId, row.sku)
              }}>
              {FormatIntNumber(state.currentRegion, row.quantity)}
            </Button>
            {row.reserved > 0 && (
              <>
                <span className='tw:text-destructive' id={`reservedQty${CleanSpecialCharacters(row.sku)}`}>
                  -{row.reserved}
                </span>
                <UncontrolledTooltip placement='right' target={`reservedQty${CleanSpecialCharacters(row.sku)}`}>
                  Reserved in Awaiting Orders.
                </UncontrolledTooltip>
              </>
            )}
          </div>
        )
      },
      sortable: true,
      compact: true,
      left: true,
      width: '90px',
      sortFunction: (rowA: Product, rowB: Product) => sortNumbers(rowA.quantity, rowB.quantity),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Retail Package Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='tw:text-[11.2px]' style={{ padding: '7px 0px' }}>
            <div>
              <span>
                Weight: {row.weight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </div>
            <div>
              <span>
                Length: {row.length} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div>
              <span>
                Width: {row.width} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div>
              <span>
                Height: {row.height} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Master Carton Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='tw:text-[11.2px]' style={{ padding: '7px 5px 7px 0px' }}>
            <div>
              <span>
                Weight: {row.boxWeight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </div>
            <div>
              <span>
                Length: {row.boxLength} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div>
              <span>
                Width: {row.boxWidth} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
            <div>
              <span>
                Height: {row.boxHeight} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Qty/Carton</span>,
      selector: (row: Product) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Action</span>,
      sortable: false,
      compact: true,
      cell: (row: Product) => {
        return (
          <UncontrolledDropdown className='tw:inline-block' direction='start'>
            <DropdownToggle className='tw:m-0 tw:p-0 tw:bg-transparent tw:border tw:border-[rgba(68,129,253,0.06)] tw:rounded-md' tag='button'>
              <i className='mdi mdi-dots-vertical tw:align-middle tw:text-[19.5px] tw:m-0 tw:px-1 tw:py-0' style={{ color: '#919FAF' }}></i>
            </DropdownToggle>
            <DropdownMenu end container={'body'}>
              <DropdownItem className='edit-item-btn'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                  <i className='ri-file-list-line tw:align-middle tw:me-2 tw:text-[16.25px] tw:text-[color:var(--bs-secondary-color)]'></i>
                  <span className='tw:text-[11.2px] tw:font-normal tw:text-dark'>View Details</span>
                </Link>
              </DropdownItem>
              <DropdownItem header>Actions</DropdownItem>
              {setcloneProductModal && (
                <DropdownItem
                  onClick={() =>
                    setcloneProductModal({
                      isOpen: true,
                      originalId: row.inventoryId,
                      originalName: row.title,
                      originalSku: row.sku,
                    })
                  }>
                  <div>
                    <i className='las la-copy label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                    <span className='tw:text-[11.2px] tw:font-normal tw:text-dark'>Clone</span>
                  </div>
                </DropdownItem>
              )}
              {row.activeState && Number(row.quantity) === 0 && (
                <DropdownItem className='tw:text-[11.2px] tw:text-destructive' onClick={() => changeProductState(0, row.inventoryId, row.sku)}>
                  <i className='tw:text-[16.25px] las la-eye-slash tw:align-middle tw:me-2'></i> Set Inactive
                </DropdownItem>
              )}
              {!row.activeState && (
                <DropdownItem className='tw:text-[11.2px] tw:text-success' onClick={() => changeProductState(1, row.inventoryId, row.sku)}>
                  <i className='tw:text-[16.25px] las la-eye tw:align-bottom tw:me-2'></i> Set Active
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        dense
        defaultSortFieldId={3}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        pagination={tableData.length > 100 ? true : false}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Products per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default ProductsTable
