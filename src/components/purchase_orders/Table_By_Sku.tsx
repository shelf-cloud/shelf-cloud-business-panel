/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { PurchaseOrder, PurchaseOrderBySkus, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { Badge } from 'reactstrap'
import Table_By_Skus_Orders from './Table_By_Skus_Orders'
import Link from 'next/link'

type Props = {
  filterDataTable: PurchaseOrderBySkus[]
  pending: boolean
}

const Table_By_Sku = ({ filterDataTable, pending }: Props) => {
  const { state }: any = useContext(AppContext)
  const sortTitle = (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => {
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
  const sortOrdered = (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => {
    const totalSkuOrderedA = rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowA.sku) {
          return subtotal + item.orderQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    const totalSkuOrderedB = rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowB.sku) {
          return subtotal + item.orderQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    if (totalSkuOrderedA > totalSkuOrderedB) {
      return 1
    }
    if (totalSkuOrderedB > totalSkuOrderedA) {
      return -1
    }
    return 0
  }
  const sortInbound = (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => {
    const totalSkuOrderedA = rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowA.sku) {
          return subtotal + item.inboundQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    const totalSkuOrderedB = rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowB.sku) {
          return subtotal + item.inboundQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    if (totalSkuOrderedA > totalSkuOrderedB) {
      return 1
    }
    if (totalSkuOrderedB > totalSkuOrderedA) {
      return -1
    }
    return 0
  }
  const sortArrived = (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => {
    const totalSkuOrderedA = rowA.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowA.sku) {
          return subtotal + item.receivedQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    const totalSkuOrderedB = rowB.orders.reduce((totalOrdered: number, order: PurchaseOrder) => {
      const totalSku = order.poItems.reduce((subtotal: number, item: PurchaseOrderItem) => {
        if (item.sku == rowB.sku) {
          return subtotal + item.receivedQty
        } else {
          return subtotal
        }
      }, 0)
      return totalSku + totalOrdered
    }, 0)

    if (totalSkuOrderedA > totalSkuOrderedB) {
      return 1
    }
    if (totalSkuOrderedB > totalSkuOrderedA) {
      return -1
    }
    return 0
  }

  const sortString = (a: string, b: string) => a.localeCompare(b)

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Image</span>,
      selector: (row: PurchaseOrderBySkus) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
            <a target='blank' className='text-black'>
              <div
                style={{
                  width: '100%',
                  maxWidth: '80px',
                  height: '50px',
                  margin: '2px 0px',
                  position: 'relative',
                }}>
                <img
                  src={
                    row.image
                      ? row.image
                      : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                  }
                  alt='product Image'
                  style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                />
              </div>
            </a>
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
            <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
              <a target='blank' className='text-black'>
                <span className='fs-6 fw-semibold'>{row.title}</span>
              </a>
            </Link>
            {row.asin && (
              <>
                <br />
                <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/exec/obidos/ASIN${row.asin}`} target='blank'>
                  <span className='fs-6 fw-normal'>{row.asin}</span>
                </a>
              </>
            )}
            {row.barcode && (
              <>
                <br />
                <span className='text-muted fs-6 fw-normal'>{row.barcode}</span>
              </>
            )}
          </>
        )
      },
      sortable: true,
      compact: true,
      sortFunction: sortTitle,
    },
    {
      name: <span className='fw-bolder fs-6'>SKU</span>,
      selector: (row: PurchaseOrderBySkus) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
            <a target='blank' className='text-black'>
              <span className='fs-6'>{row.sku}</span>
            </a>
          </Link>
        )
      },
      sortable: true,
      compact: true,
      grow: 0,
      sortFunction: (rowA: PurchaseOrderBySkus, rowB: PurchaseOrderBySkus) => sortString(rowA.sku, rowB.sku),
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
      grow: 0,
      sortFunction: sortOrdered,
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
      grow: 0,
      sortFunction: sortInbound,
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
      grow: 0,
      sortFunction: sortArrived,
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrderBySkus) => {
        const totalReceivingQty = Object.entries(state.receivingFromPo).reduce((total: number, po: [string, any]) => {
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
            <Badge pill color='success' className='fs-6'>
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
