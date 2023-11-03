/* eslint-disable react-hooks/exhaustive-deps */
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { OrderRowType } from '@typings'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import ShipmentExpandedDetail from './ShipmentExpandedDetail'
import AppContext from '@context/AppContext'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
}

const ReceivingTable = ({ tableData, pending }: Props) => {
  const { state }: any = useContext(AppContext)
  const columns: any = [
    {
      name: <span className='fw-bolder fs-13'>Order Number</span>,
      selector: (row: OrderRowType) => {
        return <div style={{ margin: '0px', fontWeight: '800' }}>{row.orderNumber}</div>
      },
      sortable: true,
      wrap: true,
      grow: 1.3,
      left: true,
      //   compact: true,
    },
    {
      name: <span className='fw-bolder fs-13'>Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='badge text-uppercase badge-soft-success p-2'> {row.orderStatus} </span>
            break
          case 'awaiting_shipment':
          case 'awating':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{' awating '}</span>
            break
          case 'on_hold':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{' on hold '}</span>
            break
          case 'cancelled':
            return <span className='badge text-uppercase badge-soft-danger p-2'> {row.orderStatus} </span>
            break
          default:
            break
        }
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className='fw-bolder fs-13'>Type</span>,
      selector: (row: OrderRowType) => row.orderType,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      style: {
        color: '#727578',
      },
    },
    {
      name: <span className='fw-bolder fs-13'>Order Date</span>,
      selector: (row: OrderRowType) => row.orderDate,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className='fw-bolder fs-13'>Order Closed</span>,
      selector: (row: OrderRowType) => row.closedDate || '',
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className='fw-bolder fs-13'># of Items</span>,
      selector: (row: OrderRowType) => FormatIntNumber(state.currentRegion, Number(row.totalItems)),
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      //   compact: true,
    },
    {
      name: <span className='fw-bolder fs-13'>Total Charge</span>,
      selector: (row: OrderRowType) => FormatCurrency(state.currentRegion, Number(row.totalCharge)),
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      style: {
        color: '#4481FD',
      },
    },
    {
      name: <span className='fw-bolder fs-13'>Notes</span>,
      selector: (row: OrderRowType) => row.trackingNumber || '',
      sortable: true,
      wrap: true,
      grow: 2,
      center: true,
      //   compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={tableData} progressPending={pending} expandableRows expandableRowsComponent={ShipmentExpandedDetail} striped={true} />
    </>
  )
}

export default ReceivingTable
