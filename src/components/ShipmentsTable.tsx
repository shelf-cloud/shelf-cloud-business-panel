/* eslint-disable react-hooks/exhaustive-deps */
import { OrderRowType } from '@typings'
import React from 'react'
import DataTable from 'react-data-table-component'
import {
  Input,
} from 'reactstrap'
import ShipmentExpandedDetail from './ShipmentExpandedDetail'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
}

const ShipmentsTable = ({ tableData, pending }: Props) => {

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
      name: <span className="fw-bolder fs-13">Order Number</span>,
      selector: (row: OrderRowType) => {
        return (
          <div style={{ margin: '0px', fontWeight: '800' }}>
              {row.orderNumber}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.3,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return (
              <span className="badge text-uppercase badge-soft-success">
                {' '}
                {row.orderStatus}{' '}
              </span>
            )
            break
          case 'awaiting_shipment':
          case 'awating':
            return (
              <span className="badge text-uppercase badge-soft-secondary">
                {' awating '}
              </span>
            )
            break
          case 'on_hold':
            return (
              <span className="badge text-uppercase badge-soft-warning">
                {' on hold '}
              </span>
            )
            break
          case 'cancelled':
            return (
              <span className="badge text-uppercase badge-soft-danger">
                {' '}
                {row.orderStatus}{' '}
              </span>
            )
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
      name: <span className="fw-bolder fs-13">Type</span>,
      selector: (row: OrderRowType) => row.orderType,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Order Date</span>,
      selector: (row: OrderRowType) => row.orderDate,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Order Closed</span>,
      selector: (row: OrderRowType) => row.closedDate || '',
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Tracking Number</span>,
      selector: (row: OrderRowType) => row.trackingNumber || '',
      sortable: true,
      wrap: true,
      grow: 2,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13"># of Items</span>,
      selector: (row: OrderRowType) => row.totalItems || '',
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      //   compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Total Charge</span>,
      selector: (row: OrderRowType) => `$ ${row.totalCharge.toFixed(2) || 0.0}`,
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      //   compact: true,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        expandableRows
        expandableRowsComponent={ShipmentExpandedDetail}
        striped={true}
      />
    </>
  )
}

export default ShipmentsTable
