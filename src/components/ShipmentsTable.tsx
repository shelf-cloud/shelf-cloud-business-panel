/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { OrderRowType } from '@typings'
import React from 'react'
import DataTable from 'react-data-table-component'
import ShipmentExpandedDetail from './ShipmentExpandedDetail'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
  apiMutateLink: string
}

const ShipmentsTable = ({ tableData, pending, apiMutateLink }: Props) => {
  const orderNumber = (rowA: OrderRowType, rowB: OrderRowType) => {
    const a = rowA.orderNumber.toLowerCase()
    const b = rowB.orderNumber.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderStatus = (rowA: OrderRowType, rowB: OrderRowType) => {
    const a = rowA.orderStatus.toLowerCase()
    const b = rowB.orderStatus.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderType = (rowA: OrderRowType, rowB: OrderRowType) => {
    const a = rowA.orderType.toLowerCase()
    const b = rowB.orderType.toLowerCase()

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
      name: <span className="fw-bolder fs-13">Order Number</span>,
      selector: (row: OrderRowType) => {
        return (
          <>
            <div style={{ margin: '0px', fontWeight: '600' }}>
              {row.orderNumber}
            </div>
            {row.hasReturn && (
              <span className="text-danger" style={{ opacity: '80%' }}>
                Return: <br />{row.orderNumber}-RT
              </span>
            )}
          </>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.7,
      left: true,
      sortFunction: orderNumber,
      style: {
        padding: '8px 0px',
      },
    },
    {
      name: <span className="fw-bolder fs-13">Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return (
              <span className="badge text-uppercase badge-soft-success p-2">
                {' '}
                {row.orderStatus}{' '}
              </span>
            )
            break
          case 'Processed':
            return (
              <span className="badge text-uppercase badge-soft-secondary p-2">
                {' awating '}
              </span>
            )
            break
          case 'awaiting_shipment':
          case 'awating':
            return (
              <span className="badge text-uppercase badge-soft-secondary p-2">
                {' awating '}
              </span>
            )
            break
          case 'on_hold':
            return (
              <span className="badge text-uppercase badge-soft-warning p-2">
                {' on hold '}
              </span>
            )
            break
          case 'cancelled':
            return (
              <span className="badge text-uppercase badge-soft-danger p-2">
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
      sortFunction: orderStatus,
    },
    {
      name: <span className="fw-bolder fs-13">Type</span>,
      selector: (row: OrderRowType) => row.orderType,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      sortFunction: orderType,
      style: {
        color: '#727578',
      },
      // conditionalCellStyles: [
      //   {
      //     when: (row: OrderRowType) => row.orderType == 'Return',
      //     style: {
      //       color: '#f06548',
      //     },
      //   },
      //   {
      //     when: (row: OrderRowType) => row.orderType != 'Return',
      //     style: {
      //       color: '#727578',
      //     },
      //   },
      // ],
    },
    {
      name: <span className="fw-bolder fs-13">Order Date</span>,
      selector: (row: OrderRowType) => row.orderDate,
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Order Closed</span>,
      selector: (row: OrderRowType) => row.closedDate || '',
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Tracking Number</span>,
      selector: (row: OrderRowType) => {
        let tracking
        {
          switch (true) {
            case (row.orderType == 'Shipment' || row.orderType == 'Return') &&
              row.trackingNumber != '' &&
              !!row.trackingLink:
              tracking = (
                <div className="trackingNumber_container">
                  <img
                    src={row.carrierIcon}
                    alt="carrier logo"
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target="blank"
                    style={{ textDecoration: 'none', color: 'black' }}
                  >
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case row.orderType == 'Wholesale' &&
              row.trackingNumber != '' &&
              !!row.trackingLink &&
              row.carrierService == 'Parcel Boxes':
              tracking = (
                <div className="trackingNumber_container">
                  <img
                    src={row.carrierIcon}
                    alt="carrier logo"
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target="blank"
                    style={{ textDecoration: 'none', color: 'black' }}
                  >
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case row.trackingNumber == '':
              tracking = row.trackingNumber
              break
            default:
              tracking = row.trackingNumber
          }
        }
        return tracking
      },
      sortable: true,
      wrap: true,
      grow: 1.7,
      center: false,
      compact: true,
    },
    {
      name: <span className="fw-bolder fs-13"># of Items</span>,
      selector: (row: OrderRowType) => row.totalItems || '',
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bolder fs-13">Total Charge</span>,
      selector: (row: OrderRowType) => `$ ${row.totalCharge.toFixed(2) || 0.0}`,
      sortable: true,
      wrap: true,
      // grow: 1.5,
      right: true,
      style: {
        color: '#4481FD',
      },
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
        expandableRowsComponentProps={{ apiMutateLink: apiMutateLink }}
        striped={true}
      />
    </>
  )
}

export default ShipmentsTable
