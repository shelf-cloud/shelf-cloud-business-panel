/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { KitRow } from '@typings'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import AppContext from '@context/AppContext'
import { DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'
// import TooltipComponent from '../constants/Tooltip'
import KitExpandedDetails from './KitExpandedDetails'
import Link from 'next/link'

type Props = {
  tableData: KitRow[]
  pending: boolean
  changeProductState: (kitId: number, businessId: number, sku: string) => {}
  setMsg: string
  icon: string
  activeText: string
}

const KitsTable = ({ tableData, pending }: Props) => {
  const { state, setModalKitDetails }: any = useContext(AppContext)

  const loadBarcode = (product: KitRow) => {
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
    html +=
      '<div class="barcodeSection"><p style="text-align:center;">' +
      product.sku +
      '</p><p style="text-align:center;white-space: nowrap;overflow: hidden;">' +
      product.title +
      '</p><svg id="barcode" width="100%" height="100%"></svg></div>'
    html +=
      '</body><script src="https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js"></script><script>JsBarcode("#barcode", "' +
      product.barcode +
      '", {text: "' +
      product.barcode +
      '",fontSize: 12,textMargin: 0, height:31});</script></html>'
    var wnd = window.open('about:Barcode-Generated', '', '_blank')
    wnd?.document.write(html)
  }

  const caseInsensitiveSort = (rowA: KitRow, rowB: KitRow) => {
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
  const quantitySort = (rowA: KitRow, rowB: KitRow) => {
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
  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>Image</span>,
      selector: (cell: { image: any }) => {
        return (
          <div
            style={{
              width: '70px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={
                cell.image
                  ? cell.image
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
    },
    {
      name: (
        <span className='font-weight-bold fs-13'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div>
            <p style={{ margin: '0px', fontWeight: '800' }}>{row.title}</p>
            <p style={{ margin: '0px' }} className='d-flex flex-row justify-content-start align-items-start'>
              {row.sku} {row.note && row.note != '' && <i className='ri-information-fill ms-2 fs-5 text-warning' id={`tooltip${row.sku}`}></i>}
            </p>
            {row.note != '' && (
              <UncontrolledTooltip placement='top' target={`tooltip${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>{row.note}</p>
              </UncontrolledTooltip>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.5,
      sortFunction: caseInsensitiveSort,
      //   compact: true,
    },
    {
      name: (
        <span className='font-weight-bold fs-13'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div>
            <p style={{ margin: '0px' }}>
              <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/exec/obidos/ASIN${row.asin}`} target='blank'>
                {row.asin}
              </a>
            </p>
            <p style={{ margin: '0px' }}>{row.fnSku}</p>
            <p style={{ margin: '0px' }}>
              <a href='#' onClick={() => loadBarcode(row)}>
                {row.barcode}
              </a>
            </p>
          </div>
        )
      },
      sortable: false,
      compact: true,
      grow: 1.3,
    },
    {
      name: <span className='font-weight-bold fs-13'>Quantity</span>,
      selector: (cell: any) => cell.quantity,
      sortable: true,
      compact: true,
      center: true,
      sortFunction: quantitySort,
    },
    {
      name: <span className='font-weight-bold fs-13'>Unit Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (cell: any) => {
        return (
          <div style={{ padding: '7px 0px' }}>
            <Row>
              <span>
                Weight: {cell.weight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
              </span>
            </Row>
            <Row>
              <span>
                Length: {cell.length} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Width: {cell.width} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Height: {cell.height} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='font-weight-bold fs-13'>Box Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (cell: any) => {
        return (
          <div style={{ padding: '7px 5px 7px 0px' }}>
            <Row>
              <span>
                Weight: {cell.boxweight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
              </span>
            </Row>
            <Row>
              <span>
                Length: {cell.boxlength} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Width: {cell.boxwidth} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
            <Row>
              <span>
                Height: {cell.boxheight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='font-weight-bold fs-13'>Qty/Box</span>,
      selector: (row: { boxQty: number }) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Action</span>,
      sortable: false,
      compact: true,
      cell: (row: KitRow) => {
        return (
          <UncontrolledDropdown className='dropdown d-inline-block'>
            <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical align-middle fs-2 m-0 p-2' style={{ color: '#919FAF' }}></i>
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end' container={'body'}>
              <DropdownItem className='edit-item-btn' onClick={() => setModalKitDetails(row.kitId, state.user.businessId, row.sku)}>
                <i className='ri-pencil-fill align-middle me-2 fs-5 text-muted'></i>
                <span className='fs-6 fw-normal'>Edit</span>
              </DropdownItem>
              <DropdownItem className='edit-item-btn'>
                <Link href={`/kit/${row.kitId}/${row.sku}`} passHref>
                  <a>
                    <i className='ri-file-list-line align-middle me-2 fs-5 text-muted'></i>
                    <span className='fs-6 fw-normal text-dark'>View Details</span>
                  </a>
                </Link>
              </DropdownItem>
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
        defaultSortFieldId={2}
        expandableRows
        expandableRowsComponent={KitExpandedDetails}
      />
    </>
  )
}

export default KitsTable
