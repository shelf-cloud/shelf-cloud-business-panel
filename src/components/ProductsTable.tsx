/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { Product } from '@typings'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import AppContext from '@context/AppContext'
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'
import TooltipComponent from './constants/Tooltip'
import Link from 'next/link'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'

type CloneProductModal = {
  isOpen: boolean
  originalId: number
  originalName: string
  originalSku: string
}

type Props = {
  tableData: Product[]
  pending: boolean
  changeProductState: (inventoryId: number, businessId: number, sku: string) => {}
  setMsg: string
  icon: string
  activeText: string
  setSelectedRows: (selectedRows: Product[]) => void
  toggledClearRows: boolean
  setcloneProductModal?: (prev: CloneProductModal) => void
}

const ProductsTable = ({ tableData, pending, changeProductState, setMsg, icon, activeText, setSelectedRows, toggledClearRows, setcloneProductModal }: Props) => {
  const { setModalProductInfo, state }: any = useContext(AppContext)

  const loadBarcode = (product: Product) => {
    var html = '<!DOCTYPE html><html><head>'
    html += '<style>@page{margin:0px;}'
    html += 'body{width:21cm;margin:0px;padding:0px;}'
    html += '.pageBreak{page-break-after:always;}'
    html += '.barcodeSection{position:relative;float:left;top:0cm;left:0.9cm;width: 6.7cm;height: 2.5cm;margin-right:0.3cm;text-align: center;overflow:hidden;margin-bottom:2px;}'
    html += '.barcodeSection svg{transform: translate(0px, 0px) !important;}'
    html += '.barcodeSection svg text{font:12px monospace !important;}'
    html += '.barcodeSection p{position:relative;float:left;left:5%;width:95%;text-align:left;margin-top:0px;margin-bottom:0px;font-size:14px;z-index:5;}'
    html += '.barcodeSection svg{width:90%;transform: translate(0px, -10px) !important;}'
    html += '</style></head><body>'
    html += '<div class="barcodeSection"><p style="text-align:center;">' + product.sku + '</p><p style="text-align:center;white-space: nowrap;overflow: hidden;">' + product.title + '</p><svg id="barcode" width="100%" height="100%"></svg></div>'
    html +=
      '</body><script src="https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js"></script><script>JsBarcode("#barcode", "' + product.barcode + '", {text: "' + product.barcode + '",fontSize: 12,textMargin: 0, height:31});</script></html>'
    var wnd = window.open('about:Barcode-Generated', '', '_blank')
    wnd?.document.write(html)
  }
  const caseInsensitiveSort = (rowA: Product, rowB: Product) => {
    const a = rowA.title.toLowerCase()
    const b = rowB.title.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const quantitySort = (rowA: Product, rowB: Product) => {
    const a = Number(rowA.quantity)
    const b = Number(rowB.quantity)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const AddedOrderSort = (rowA: Product, rowB: Product) => {
    const a = Number(rowA.inventoryId)
    const b = Number(rowB.inventoryId)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
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
      sortFunction: AddedOrderSort,
    },
    {
      name: <span className='fw-bold fs-6'>Image</span>,
      selector: (row: Product) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`}>
            <div
              style={{
                width: '50px',
                height: '60px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : 'https://firebasestorage.googleapis.com/v0/b/shelf-cloud-bucket.appspot.com/o/operations%2Fno-image.png?alt=media&token=a4dc1fc9-fa29-40d8-9afc-fe7e09486d75'}
                onError={(e) => (e.currentTarget.src = 'https://firebasestorage.googleapis.com/v0/b/shelf-cloud-bucket.appspot.com/o/operations%2Fno-image.png?alt=media&token=a4dc1fc9-fa29-40d8-9afc-fe7e09486d75')}
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
          <>
            <Link href={`/product/${row.inventoryId}/${row.sku}`}>
              <p className='fs-7 m-0 fw-semibold text-black'>{row.title}</p>
            </Link>
            <p className='m-0 fs-7 d-flex flex-row justify-content-start align-items-start'>
              {row.sku} {row.note != '' && <i className='ri-information-fill ms-2 fs-5 text-warning' id={`tooltip${row.inventoryId}`}></i>}
            </p>
            {row.note != '' && <TooltipComponent target={`tooltip${row.inventoryId}`} text={row.note} />}
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      minWidth: '150px',
      sortFunction: caseInsensitiveSort,
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
          <div className='fs-7 d-flex flex-column justify-item-start gap-0'>
            {row.asin !== '' && (
              <a className='m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank'>
                {row.asin}
              </a>
            )}
            {row.fnSku !== '' && <p className='m-0'>{row.fnSku}</p>}
            {row.barcode !== '' && (
              <a className='m-0 text-info' href='#' onClick={() => loadBarcode(row)}>
                {row.barcode}
              </a>
            )}
          </div>
        )
      },
      sortable: false,
      compact: true,
      // grow: 1,
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
                setModalProductInfo(row.inventoryId, state.user.businessId, row.sku)
              }}>
              {row.quantity}
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
      sortFunction: quantitySort,
    },
    {
      name: <span className='fw-bold fs-6'>Unit Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='fs-7' style={{ padding: '7px 0px' }}>
            <Row>
              <span>
                Weight: {row.weight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.length} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.width} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.height} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='fw-bold fs-6'>Box Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (row: Product) => {
        return (
          <div className='fs-7' style={{ padding: '7px 5px 7px 0px' }}>
            <Row>
              <span>
                Weight: {row.boxWeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.boxLength} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.boxWidth} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.boxHeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='fw-bold fs-6'>Qty/Box</span>,
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
              <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
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
                <DropdownItem className={'fs-7 ' + activeText} onClick={() => changeProductState(row.inventoryId, state.user.businessId, row.sku)}>
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
