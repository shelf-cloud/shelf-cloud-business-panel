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
  Input,
  Row,
  UncontrolledDropdown,
} from 'reactstrap'

type Props = {
  tableData: ProductRowType[]
  pending: boolean
  changeProductState: (
    inventoryId: number,
    businessId: number,
    sku: string,
  ) => {},
  setMsg: string,
  icon: string,
  activeText: string
}

const ProductsTable = ({ tableData, pending, changeProductState, setMsg, icon, activeText }: Props) => {
  const { setModalProductInfo, setModalProductDetails }: any =
    useContext(AppContext)

  const columns: any = [
    {
      name: (
        <Input
          className="form-check-input fs-15"
          type="checkbox"
          name="checkAll"
          value="option1"
        />
      ),
      cell: () => (
        <input
          className="form-check-input fs-15"
          type="checkbox"
          name="checkAll"
          value="option1"
        />
      ),
      sortable: false,
      width: '50px',
      compact: true,
      center: true,
    },
    {
      name: <span className="font-weight-bold fs-13">Image</span>,
      selector: (cell: { Image: any }) => {
        return (
          <div style={{ height: '60px' }}>
            <Image
              src={
                cell.Image
                  ? cell.Image
                  : 'https://electrostoregroup.com/Onix/img/no-image.png'
              }
              alt="product Image"
              layout="fill"
              className="imagesFit"
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
            <p style={{ margin: '0px' }}>{row.ASIN}</p>
            <p style={{ margin: '0px' }}>{row.FNSKU}</p>
            <p style={{ margin: '0px' }}>{row.Barcode}</p>
          </div>
        )
      },
      sortable: true,
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
              <span>Width: {cell.boxDimensions.weight} in</span>
            </Row>
            <Row>
              <span>Height: {cell.boxDimensions.weight} in</span>
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
                      row.btns.sku,
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
      />
    </>
  )
}

export default ProductsTable
