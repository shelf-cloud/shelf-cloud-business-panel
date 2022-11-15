/* eslint-disable react-hooks/exhaustive-deps */
import { ProductRowType } from '@typings'
import Image from 'next/image'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import AppContext from '@context/AppContext'
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap'

type Props = {
  tableData: ProductRowType[]
  pending: boolean
  changeProductState: (
    inventoryId: number,
    businessId: number,
    sku: string
  ) => {}
  setMsg: string
  icon: string
  activeText: string
}

const ProductsTable = ({
  tableData,
  pending,
  changeProductState,
  setMsg,
  icon,
  activeText,
}: Props) => {
  const { setModalProductInfo, setModalProductDetails }: any =
    useContext(AppContext)

  const loadBarcode = (product: ProductRowType) => {
    var html = '<!DOCTYPE html><html><head>'
    html += '<style>@page{margin:0px;}'
    html += 'body{width:21cm;margin:0px;padding:0px;}'
    html += '.pageBreak{page-break-after:always;}'
    html +=
      '.barcodeSection{position:relative;float:left;top:0cm;left:0.9cm;width: 6.7cm;height: 2.5cm;margin-right:0.3cm;text-align: center;overflow:hidden;margin-bottom:2px;}'
    html += '.barcodeSection svg{transform: translate(0px, 0px) !important;}'
    html += '.barcodeSection svg text{font:12px monospace !important;}'
    html +=
      '.barcodeSection p{position:relative;float:left;left:5%;width:95%;text-align:left;margin-top:0px;margin-bottom:0px;font-size:14px;z-index:5;}'
    html +=
      '.barcodeSection svg{width:90%;transform: translate(0px, -10px) !important;}'
    html += '</style></head><body>'
    html +=
      '<div class="barcodeSection"><p style="text-align:center;">' +
      product.SKU +
      '</p><p style="text-align:center;white-space: nowrap;overflow: hidden;">' +
      product.Title +
      '</p><svg id="barcode" width="100%" height="100%"></svg></div>'
    html +=
      '</body><script src="https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js"></script><script>JsBarcode("#barcode", "' +
      product.Barcode +
      '", {text: "'+product.Barcode+'",fontSize: 12,textMargin: 0, height:31});</script></html>'
    var wnd = window.open('about:Barcode-Generated', '', '_blank')
    wnd?.document.write(html)
  }

  const caseInsensitiveSort = (rowA: ProductRowType, rowB: ProductRowType) => {
    const a = rowA.Title.toLowerCase()
    const b = rowB.Title.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const quantitySort = (rowA: ProductRowType, rowB: ProductRowType) => {
    const a = Number(rowA.Quantity.quantity)
    const b = Number(rowB.Quantity.quantity)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const columns: any = [
    // {
    //   name: (
    //     <Input
    //       className="form-check-input fs-15"
    //       type="checkbox"
    //       name="checkAll"
    //       value="option1"
    //     />
    //   ),
    //   cell: () => (
    //     <input
    //       className="form-check-input fs-15"
    //       type="checkbox"
    //       name="checkAll"
    //       value="option1"
    //     />
    //   ),
    //   sortable: false,
    //   width: '50px',
    //   compact: true,
    //   center: true,
    // },
    {
      name: <span className="font-weight-bold fs-13">Image</span>,
      selector: (cell: { Image: any }) => {
        return (
          <div
            style={{
              width: '70px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}
          >
            <Image
              src={
                cell.Image
                  ? cell.Image
                  : 'https://electrostoregroup.com/Onix/img/no-image.png'
              }
              alt="product Image"
              layout="fill"
              objectFit="contain"
              objectPosition="center"
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
        <span className="font-weight-bold fs-13">
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: any) => {
        return (
          <div>
            <p style={{ margin: '0px', fontWeight: '800' }}>{row.Title}</p>
            <p style={{ margin: '0px' }}>{row.SKU}</p>
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
        <span className="font-weight-bold fs-13">
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: any) => {
        return (
          <div>
            <p style={{ margin: '0px' }}>
              <a
                href={`https://www.amazon.com/exec/obidos/ASIN${row.ASIN}`}
                target="blank"
              >
                {row.ASIN}
              </a>
            </p>
            <p style={{ margin: '0px' }}>{row.FNSKU}</p>
            <p style={{ margin: '0px' }}>
              <a href="#" onClick={() => loadBarcode(row)}>
                {row.Barcode}
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
      name: <span className="font-weight-bold fs-13">Quantity</span>,
      selector: (cell: any) => {
        return (
          <Button
            color="info"
            outline
            className="btn btn-ghost-info"
            onClick={() => {
              setModalProductInfo(
                cell.Quantity.inventoryId,
                cell.Quantity.businessId,
                cell.Quantity.sku
              )
            }}
          >
            {cell.Quantity.quantity}
          </Button>
        )
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: quantitySort,
    },
    {
      name: <span className="font-weight-bold fs-13">Unit Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (cell: any) => {
        return (
          <div style={{ padding: '7px 0px' }}>
            <Row>
              <span>Weight: {cell.unitDimensions.weight} lbs</span>
            </Row>
            <Row>
              <span>Length: {cell.unitDimensions.length} in</span>
            </Row>
            <Row>
              <span>Width: {cell.unitDimensions.width} in</span>
            </Row>
            <Row>
              <span>Height: {cell.unitDimensions.height} in</span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Box Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.4,
      selector: (cell: { boxDimensions: any }) => {
        return (
          <div style={{ padding: '7px 5px 7px 0px' }}>
            <Row>
              <span>Weight: {cell.boxDimensions.weight} lbs</span>
            </Row>
            <Row>
              <span>Length: {cell.boxDimensions.length} in</span>
            </Row>
            <Row>
              <span>Width: {cell.boxDimensions.width} in</span>
            </Row>
            <Row>
              <span>Height: {cell.boxDimensions.height} in</span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className="font-weight-bold fs-13">Qty/Box</span>,
      selector: (row: { qtyBox: any }) => row.qtyBox,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Action</span>,
      sortable: false,
      compact: true,
      cell: (row: any) => {
        return (
          <UncontrolledDropdown className="dropdown d-inline-block">
            <DropdownToggle
              className="btn btn-soft-secondary btn-sm"
              tag="button"
            >
              <i className="ri-more-fill align-middle"></i>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem
                className="edit-item-btn"
                onClick={() =>
                  setModalProductDetails(
                    row.btns.inventoryId,
                    row.btns.businessId,
                    row.btns.sku
                  )
                }
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                Edit
              </DropdownItem>
              {(row.Quantity.quantity == 0 || !row.btns.state) && (
                <DropdownItem
                  className={activeText}
                  onClick={() =>
                    changeProductState(
                      row.btns.inventoryId,
                      row.btns.businessId,
                      row.btns.sku
                    )
                  }
                >
                  <i className={icon}></i> {setMsg}
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
        defaultSortFieldId={2}
      />
    </>
  )
}

export default ProductsTable
