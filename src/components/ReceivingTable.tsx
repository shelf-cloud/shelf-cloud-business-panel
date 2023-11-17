/* eslint-disable react-hooks/exhaustive-deps */
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import React, { useContext, useState } from 'react'
import DataTable from 'react-data-table-component'
import ShipmentExpandedDetail from './ShipmentExpandedDetail'
import AppContext from '@context/AppContext'
import { UncontrolledTooltip } from 'reactstrap'
import Confirm_Delete_Receiving from './modals/receivings/Confirm_Delete_Receiving'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
  apiMutateLink: string
}

const ReceivingTable = ({ tableData, pending, apiMutateLink }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    orderId: 0,
    orderNumber: '',
  })

  const columns: any = [
    {
      name: <span className='fw-bolder fs-13'>Order Number</span>,
      selector: (row: OrderRowType) => {
        return <div className='m-0 p-0 fw-bold'>{row.orderNumber}</div>
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
      name: <span className='fw-bolder fs-13'>Origin</span>,
      selector: (row: OrderRowType) => {
        return (
          <div className='text-center m-0 p-0 text-nowrap'>
            {row.isReceivingFromPo ? <span className='text-primary'>Purchase Orders</span> : <span className='text-info'>Manual Receiving</span>}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
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
      name: <span className='fw-bolder fs-13 text-center'>Total Charge</span>,
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
      name: <span className='fw-bolder fs-13'></span>,
      selector: (row: OrderRowType) => {
        if (
          (row.orderStatus == 'awating' || row.orderStatus == 'awaiting_shipment') &&
          row.orderItems.reduce((totalReceived, item: ShipmentOrderItem) => totalReceived + item.qtyReceived!, 0) <= 0
        ) {
          return (
            <>
              <i
                className='fs-3 text-danger las la-trash-alt'
                style={{ cursor: 'pointer' }}
                id={`deleteReceiving${row.orderId}`}
                onClick={() =>
                  setshowDeleteModal((prev) => {
                    return {
                      ...prev,
                      show: true,
                      orderId: row.id,
                      orderNumber: row.orderNumber,
                    }
                  })
                }
              />
              <UncontrolledTooltip
                placement='top'
                target={`deleteReceiving${row.orderId}`}
                popperClassName='bg-white shadow px-1 pt-1 rounded-2'
                innerClassName='text-black bg-white p-0'>
                <p className='fs-6 text-danger m-0 p-0 mb-0'>Delete Receiving</p>
              </UncontrolledTooltip>
            </>
          )
        }
      },
      sortable: false,
      wrap: false,
      center: true,
      compact: true,
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
      {showDeleteModal.show && (
        <Confirm_Delete_Receiving
          showDeleteModal={showDeleteModal}
          setshowDeleteModal={setshowDeleteModal}
          loading={loading}
          setLoading={setLoading}
          apiMutateLink={apiMutateLink}
        />
      )}
    </>
  )
}

export default ReceivingTable
