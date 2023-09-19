/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { wholesaleProductRow } from '@typings'
import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import { Button, FormFeedback, Input } from 'reactstrap'
import DataTable from 'react-data-table-component'

type Props = {
  allData: wholesaleProductRow[]
  filteredItems: wholesaleProductRow[]
  setAllData: (allData: wholesaleProductRow[]) => void
  pending: boolean
  error: boolean
  setError: (state: boolean) => void
}

const WholeSaleTable = ({ allData, filteredItems, setAllData, pending, setError }: Props) => {
  const { state, setModalProductInfo }: any = useContext(AppContext)
  const handleOrderQty = (value: string, sku: string, qtyBox: number) => {
    if (Number(value) == 0 || value == '') {
      const newData: any = allData.map((item) => {
        if (item.sku === sku) {
          item.orderQty = ''
          item.totalToShip = 0
          return item
        } else {
          return item
        }
      })

      setAllData(newData)
      return
    }
    const totalQtyShip = Number(value) * qtyBox
    const newData: any = allData.map((item) => {
      if (item.sku === sku) {
        item.orderQty = value
        item.totalToShip = totalQtyShip
        return item
      } else {
        return item
      }
    })
    setAllData(newData)
  }

  const caseInsensitiveSort = (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => {
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

  const quantitySort = (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => {
    const a = Number(rowA.quantity.quantity)
    const b = Number(rowB.quantity.quantity)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const typeSort = (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => {
    const a = rowA.isKit!
    const b = rowB.isKit!

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const conditionalRowStyles = [
    {
      when: (row: wholesaleProductRow) => Number(row.maxOrderQty) == 0,
      classNames: ['bg-warning bg-opacity-25'],
    },
    {
      when: (row: wholesaleProductRow) => Number(row.orderQty) > 0,
      classNames: ['bg-success bg-opacity-25'],
    },
    {
      when: (row: wholesaleProductRow) => Number(row.orderQty) < 0 || !Number.isInteger(Number(row.orderQty)),
      classNames: ['bg-danger bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='fw-bold fs-5'>Image</span>,
      selector: (row: wholesaleProductRow) => {
        return (
          <div
            style={{
              width: '70px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              src={row.image ? row.image : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'}
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
        <span className='fw-bold fs-5'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        if (row.isKit) {
          return (
            <div style={{ padding: '4px 0px' }}>
              <p style={{ margin: '0px', fontWeight: '800' }}>{row.title}</p>
              <p style={{ margin: '0px' }}>{row.sku}</p>
              <ul style={{ margin: '0px' }}>
                {row.children?.map((child) => (
                  <li
                    style={{ margin: '0px', fontSize: '10px' }}
                    key={child.idInventory}>{`${child.title} | ${child.sku} | Available: ${child.available} | Used: ${child.qty}`}</li>
                ))}
              </ul>
            </div>
          )
        } else {
          return (
            <div>
              <p style={{ margin: '0px', fontWeight: '800' }}>{row.title}</p>
              <p style={{ margin: '0px' }}>{row.sku}</p>
            </div>
          )
        }
      },
      sortable: true,
      wrap: true,
      grow: 2,
      sortFunction: caseInsensitiveSort,
      //   compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6'>
          ASIN
          <br />
          UPC
          <br />
          FNSKU
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        return (
          <div>
            <p style={{ margin: '0px' }}>{row.asin}</p>
            <p style={{ margin: '0px' }}>{row.barcode}</p>
            <p style={{ margin: '0px' }}>{row.fnSku}</p>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      grow: 1,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-5'>Type</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return <span className='badge text-uppercase badge-soft-info p-2'>kit</span>
        } else {
          return <span className='badge text-uppercase badge-soft-primary p-2'>product</span>
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: typeSort,
    },
    {
      name: <span className='fw-bold fs-5'>Quantity</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return cell.quantity.quantity
        } else {
          return (
            <Button
              color='info'
              outline
              className='btn btn-ghost-info'
              onClick={() => {
                setModalProductInfo(cell.quantity.inventoryId, state.user.businessId, cell.quantity.sku)
              }}>
              {cell.quantity.quantity}
            </Button>
          )
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: quantitySort,
    },
    {
      name: <span className='fw-bold fs-5'>Qty/Box</span>,
      selector: (row: wholesaleProductRow) => row.qtyBox,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-5 text-center'>
          Order Qty <br /> (Master Boxes)
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        return (
          <>
            <Input
              type='number'
              disabled={(row?.maxOrderQty || 0) <= 0 ? true : false}
              className='form-control'
              placeholder={(row?.maxOrderQty || 0) <= 0 ? 'Not Enough Qty' : 'Order Qty...'}
              value={row.orderQty}
              onChange={(e) => {
                if (Number(e.target.value) < 0 || !Number.isInteger(Number(e.target.value))) {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'block'
                  setError(true)
                  handleOrderQty(e.target.value, row.sku, row?.qtyBox || 0)
                } else {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'none'
                  setError(false)
                  handleOrderQty(e.target.value, row.sku, row?.qtyBox || 0)
                }
              }}
              max={row.maxOrderQty}
              invalid={Number(row.orderQty) > (row?.maxOrderQty || 0) ? true : false}
            />
            {Number(row.orderQty) > (row?.maxOrderQty || 0) ? (
              <FormFeedback className='text-start' type='invalid'>
                Not enough Master Boxes!
              </FormFeedback>
            ) : null}
            <span className='fs-6 fw-normal text-danger' id={`Error-${row.sku}`} style={{ display: 'none' }}>
              Quantity Error
            </span>
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-5'>Total To Ship</span>,
      selector: (row: wholesaleProductRow) => Number(row.totalToShip).toFixed(0),
      sortable: true,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={pending}
        striped={true}
        defaultSortFieldId={2}
        conditionalRowStyles={conditionalRowStyles}
      />
    </>
  )
}

export default WholeSaleTable
