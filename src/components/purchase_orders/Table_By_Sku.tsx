/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { PurchaseOrder, PurchaseOrderBySkus, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { Badge } from 'reactstrap'

import Table_By_Skus_Orders from './Table_By_Skus_Orders'

type Props = {
  filterDataTable: PurchaseOrderBySkus[]
  pending: boolean
}

const Table_By_Sku = ({ filterDataTable, pending }: Props) => {
  const { state }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Image</span>,
      selector: (row: PurchaseOrderBySkus) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer' className='text-black'>
            <div
              style={{
                width: '100%',
                maxWidth: '80px',
                height: '50px',
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
          </Link>
        )
      },
      sortable: false,
      wrap: false,
      grow: 0,
    },
    {
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: PurchaseOrderBySkus) => {
        return (
          <>
            <Link href={`/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer' className='text-black'>
              <span className='fs-6 fw-semibold'>{row.title}</span>
            </Link>
            {row.asin && (
              <>
                <br />
                <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/exec/obidos/ASIN${row.asin}`} target='blank' rel='noopener noreferrer'>
                  <span className='fs-7 fw-normal'>{row.asin}</span>
                </a>
              </>
            )}
            {row.barcode && (
              <>
                <br />
                <span className='text-muted fs-7 fw-normal'>{row.barcode}</span>
              </>
            )}
          </>
        )
      },
      sortable: true,
      compact: true,
      grow: 1.5,
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => sortStringsLocaleCompare(rowA.title, rowB.title),
    },
    {
      name: <span className='fw-bolder fs-6'>SKU</span>,
      selector: (row: PurchaseOrderBySkus) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer' className='text-black'>
            <span className='fs-7'>{row.sku}</span>
          </Link>
        )
      },
      sortable: true,
      compact: true,
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => sortStringsLocaleCompare(rowA.sku, rowB.sku),
    },
    {
      name: <span className='fw-bolder fs-6'>Ordered</span>,
      selector: (row: PurchaseOrderBySkus) => {
        const totalSkuOrdered = row.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
          const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
            if (item.sku == row.sku) {
              return subtotal + item.orderQty
            } else {
              return subtotal
            }
          }, 0)
          return totalSku + totalOrdered
        }, 0)

        return FormatIntNumber(state.currentRegion, totalSkuOrdered)
      },
      sortable: true,
      compact: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) =>
        sortNumbers(
          rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowA.sku) {
                return subtotal + item.orderQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0),
          rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowB.sku) {
                return subtotal + item.orderQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0)
        ),
    },
    {
      name: <span className='fw-bolder fs-6'>Inbound</span>,
      selector: (row: PurchaseOrderBySkus) => {
        const totalSkuOrdered = row.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
          const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
            if (item.sku == row.sku) {
              return subtotal + item.inboundQty
            } else {
              return subtotal
            }
          }, 0)
          return totalSku + totalOrdered
        }, 0)

        return FormatIntNumber(state.currentRegion, totalSkuOrdered)
      },
      sortable: true,
      compact: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) =>
        sortNumbers(
          rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowA.sku) {
                return subtotal + item.inboundQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0),
          rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowB.sku) {
                return subtotal + item.inboundQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0)
        ),
    },
    {
      name: <span className='fw-bolder fs-6'>Arrived</span>,
      selector: (row: PurchaseOrderBySkus) => {
        const totalSkuOrdered = row.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
          const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
            if (item.sku == row.sku) {
              return subtotal + item.receivedQty
            } else {
              return subtotal
            }
          }, 0)
          return totalSku + totalOrdered
        }, 0)

        return FormatIntNumber(state.currentRegion, totalSkuOrdered)
      },
      sortable: true,
      compact: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) =>
        sortNumbers(
          rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowA.sku) {
                return subtotal + item.receivedQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0),
          rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
            const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
              if (item.sku == rowB.sku) {
                return subtotal + item.receivedQty
              } else {
                return subtotal
              }
            }, 0)
            return totalSku + totalOrdered
          }, 0)
        ),
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrderBySkus) => {
        const totalReceivingQty = Object.entries(state.receivingFromPo.items).reduce((total: number, po: [string, any]) => {
          const poTotal = Object.entries(po[1]).reduce((subtotal: number, inventoryId: [string, any]) => {
            if (inventoryId[1].sku == row.sku) {
              return subtotal + inventoryId[1].receivingQty
            } else {
              return subtotal
            }
          }, 0)
          return total + poTotal
        }, 0)

        if (totalReceivingQty > 0) {
          return (
            <Badge pill color='success' className='fs-7'>
              {FormatIntNumber(state.currentRegion, totalReceivingQty)}
            </Badge>
          )
        } else {
          return <></>
        }
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]
  return (
    <>
      <DataTable
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        expandableRows
        expandableRowsComponent={Table_By_Skus_Orders}
        defaultSortFieldId={3}
      />
    </>
  )
}

export default Table_By_Sku
