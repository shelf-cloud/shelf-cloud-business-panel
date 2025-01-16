/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { wholesaleProductRow } from '@typings'
import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import { Button } from 'reactstrap'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsCaseInsensitive } from '@lib/helperFunctions'

type Props = {
  allData: wholesaleProductRow[]
  filteredItems: wholesaleProductRow[]
  setAllData: (allData: wholesaleProductRow[]) => void
  pending: boolean
}

const ReceivingOrderTable = ({ allData, filteredItems, setAllData, pending }: Props) => {
  const { state, setModalProductInfo }: any = useContext(AppContext)

  const handleOrderQty = (value: string, sku: string) => {
    if (Number(value) == 0 || value == '') {
      const newData: any = allData.map((item) => {
        if (item.sku === sku) {
          item.orderQty = ''
          return item
        } else {
          return item
        }
      })

      setAllData(newData)
      return
    }
    const newData: any = allData.map((item) => {
      if (item.sku === sku) {
        item.orderQty = value
        return item
      } else {
        return item
      }
    })
    setAllData(newData)
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

  const conditionalRowStyles = [
    {
      when: (row: wholesaleProductRow) => Number(row.orderQty) > 0,
      classNames: ['bg-success bg-opacity-25'],
    },
    {
      when: (row: wholesaleProductRow) => Number(row.orderQty) < 0,
      classNames: ['bg-danger bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Image</span>,
      selector: (row: wholesaleProductRow) => {
        return (
          <div
            style={{
              width: '50px',
              height: '60px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={row.image ? row.image : NoImageAdress}
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
      name: <span className='fw-bold fs-6'>Title</span>,
      selector: (row: wholesaleProductRow) => <span className='fs-7 fw-semibold'>{row.title}</span>,
      sortable: true,
      wrap: true,
      grow: 1.5,
      sortFunction: (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => sortStringsCaseInsensitive(rowA.title, rowB.title),
    },
    {
      name: <span className='fw-bold fs-6'>SKU</span>,
      selector: (row: wholesaleProductRow) => <span className='fs-7'>{row.sku}</span>,
      sortable: true,
      wrap: false,
      compact: false,
      sortFunction: (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => sortStringsCaseInsensitive(rowA.sku, rowB.sku),
    },
    {
      name: <span className='fw-bold fs-6'>Inventory</span>,
      selector: (cell: any) => {
        return (
          <Button
            color='info'
            outline
            size='sm'
            className='btn btn-ghost-info'
            onClick={() => {
              setModalProductInfo(cell.quantity.inventoryId, state.user.businessId, cell.quantity.sku)
            }}>
            {cell.quantity.quantity}
          </Button>
        )
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: quantitySort,
    },
    {
      name: <span className='fw-bold fs-6'>Qty To Receive</span>,
      selector: (row: wholesaleProductRow) => {
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              debounceTimeout={300}
              className='form-control fs-7'
              placeholder={'Receiving Qty...'}
              value={row.orderQty}
              onChange={(e) => {
                if (Number(e.target.value) < 0) {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'block'
                  handleOrderQty(e.target.value, row.sku)
                } else {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'none'
                  handleOrderQty(e.target.value, row.sku)
                }
              }}
              min={0}
            />
            <span className='fs-6 fw-normal text-danger' id={`Error-${row.sku}`} style={{ display: 'none' }}>
              Quantity Error
            </span>
          </>
        )
      },
      sortable: false,
      center: true,
      compact: false,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={filteredItems} progressPending={pending} striped={true} defaultSortFieldId={2} conditionalRowStyles={conditionalRowStyles} dense />
    </>
  )
}

export default ReceivingOrderTable
