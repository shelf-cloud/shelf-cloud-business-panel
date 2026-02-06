/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { loadBarcode, sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { Product } from '@typings'
import DataTable from 'react-data-table-component'
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'

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
  changeProductState: (inventoryId: number, sku: string) => {}
  setMsg: string
  icon: string
  activeText: string
  setSelectedRows: (selectedRows: Product[]) => void
  toggledClearRows: boolean
  setcloneProductModal?: (prev: CloneProductModal) => void
}

const ProductsTable = ({ tableData, pending, changeProductState, setMsg, icon, activeText, setSelectedRows, toggledClearRows, setcloneProductModal }: Props) => {
  const { setModalProductInfo, state } = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Product[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'></span>,
      selector: () => <></>,
      sortable: true,
      left: true,
      compact: true,
      width: '13px',
      sortFunction: (rowA: Product, rowB: Product) => sortNumbers(Number(rowA.inventoryId), Number(rowB.inventoryId)),
    },
    {
      name: <span className='fw-bold fs-6'>Image</span>,
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
        <span className='fw-bold fs-6'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: Product) => {
        return (
          <div className='fs-7 d-flex flex-column justify-content-start align-items-start gap-0 pe-2'>
            <div className='d-flex flex-row justify-content-start align-items-center fs-7'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</span>
            {row.note != '' && <i className='ri-information-fill fs-5 text-warning' id={`tooltip${row.inventoryId}`} />}
            {row.note != '' && (
              <SCTooltip target={`tooltip${row.inventoryId}`} placement='right' key={`tooltip${row.inventoryId}`}>
                <p className='fs-7 text-primary m-0 p-0'>{row.note}</p>
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
        <span className='fw-bold fs-6'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: Product) => {
        return (
          <div className='fs-7 d-flex flex-column justify-item-start gap-1'>
            {row.asin !== '' && (
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <a className='m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                  {row.asin}
                </a>
                <CopyTextToClipboard text={row.asin} label='ASIN' />
              </div>
            )}
            {row.fnSku !== '' && (
              <p className='m-0'>
                {row.fnSku} <CopyTextToClipboard text={row.fnSku} label='FNSKU' />
              </p>
            )}
            {row.barcode !== '' && (
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <a className='m-0 text-info' href='#' onClick={() => loadBarcode(row)}>
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
      name: <span className='fw-bold fs-6'>Brand</span>,
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
      name: <span className='fw-bold fs-6'>Supplier</span>,
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
      name: <span className='fw-bold fs-6'>Quantity</span>,
      selector: (row: Product) => {
        return (
          <div className='fs-7 d-flex flex-column justify-content-center align-items-center'>
            <Button
              color='primary'
              outline
              className='fs-7 btn btn-ghost-primary'
              onClick={() => {
                setModalProductInfo(row.inventoryId, row.sku)
              }}>
              {FormatIntNumber(state.currentRegion, row.quantity)}
            </Button>
            {row.reserved > 0 && (
              <>
                <span className='text-danger' id={`reservedQty${CleanSpecialCharacters(row.sku)}`}>
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
      name: <span className='fw-bold fs-6'>Retail Package Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='fs-7' style={{ padding: '7px 0px' }}>
            <Row>
              <span>
                Weight: {row.weight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.length} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.width} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.height} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='fw-bold fs-6'>Master Carton Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='fs-7' style={{ padding: '7px 5px 7px 0px' }}>
            <Row>
              <span>
                Weight: {row.boxWeight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.boxLength} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.boxWidth} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.boxHeight} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='fw-bold fs-6'>Qty/Carton</span>,
      selector: (row: Product) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Action</span>,
      sortable: false,
      compact: true,
      cell: (row: Product) => {
        return (
          <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
            <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-1 py-0' style={{ color: '#919FAF' }}></i>
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end' container={'body'}>
              <DropdownItem className='edit-item-btn'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                  <i className='ri-file-list-line align-middle me-2 fs-5 text-muted'></i>
                  <span className='fs-7 fw-normal text-dark'>View Details</span>
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
                    <i className='las la-copy label-icon align-middle fs-5 me-2' />
                    <span className='fs-7 fw-normal text-dark'>Clone</span>
                  </div>
                </DropdownItem>
              )}
              {(row.quantity == 0 || !row.activeState) && (
                <DropdownItem className={'fs-7 ' + activeText} onClick={() => changeProductState(row.inventoryId, row.sku)}>
                  <i className={'fs-5 ' + icon}></i> {setMsg}
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
