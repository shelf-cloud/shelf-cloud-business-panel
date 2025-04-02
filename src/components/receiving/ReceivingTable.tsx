/* eslint-disable react-hooks/exhaustive-deps */
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import ShipmentExpandedDetail from '../ShipmentExpandedDetail'
import AppContext from '@context/AppContext'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import { sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { AddShippingCostModalType, DeleteReceivingModalType } from '@pages/receivings'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
  mutateReceivings: () => void
  setshowDeleteModal: (prev: DeleteReceivingModalType) => void
  setaddShippingCostModal: (prev: AddShippingCostModalType) => void
}

const ReceivingTable = ({ tableData, pending, mutateReceivings, setshowDeleteModal, setaddShippingCostModal }: Props) => {
  const { state }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Receiving</span>,
      selector: (row: OrderRowType) => <p className='m-0 p-0 fw-bold fs-7'>{row.orderNumber}</p>,
      sortable: true,
      wrap: true,
      grow: 2,
      left: true,
      compact: true,
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.orderNumber, rowB.orderNumber),
    },
    {
      name: <span className='fw-bolder fs-6'>Created In</span>,
      selector: (row: OrderRowType) => (row.isReceivingFromPo ? 'Purchase Orders' : 'Manual Receiving'),
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.warehouseName, rowB.warehouseName),
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='badge text-uppercase badge-soft-success p-2'> {row.orderStatus} </span>
            break
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{' awaiting '}</span>
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
      wrap: false,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.orderStatus, rowB.orderStatus),
    },
    {
      name: <span className='fw-bolder fs-6'>Destination</span>,
      selector: (row: OrderRowType) => row.warehouseName,
      sortable: true,
      wrap: true,
      left: true,
      grow: 1.5,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.warehouseName, rowB.warehouseName),
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Date Created</span>,
      selector: (row: OrderRowType) => row.orderDate,
      sortable: true,
      wrap: false,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Date Closed</span>,
      selector: (row: OrderRowType) => row.closedDate || '',
      sortable: true,
      wrap: false,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'># of Items</span>,
      selector: (row: OrderRowType) => FormatIntNumber(state.currentRegion, Number(row.totalItems)),
      sortable: true,
      wrap: false,
      compact: true,
      right: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortNumbers(rowA.totalItems, rowB.totalItems),
    },
    {
      name: <span className='fw-bolder fs-6 text-end'>Total Charge</span>,
      selector: (row: OrderRowType) => FormatCurrency(state.currentRegion, Number(row.totalCharge)),
      sortable: true,
      wrap: false,
      right: true,
      compact: true,
      style: {
        color: '#4481FD',
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortNumbers(rowA.totalCharge, rowB.totalCharge),
    },
    {
      name: <span className='fw-bold fs-6'></span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: OrderRowType) => {
        return (
          <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
            <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-1 py-0' style={{ color: '#919FAF' }} />
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end fs-7' container={'body'}>
              <DropdownItem onClick={() => setaddShippingCostModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, shippingCost: row.receivingShippingCost ?? '' })}>
                <div>
                  <i className='las la-ship label-icon align-middle me-2 fs-5' />
                  <span className='fw-normal text-dark'>Add Shipping Cost</span>
                </div>
              </DropdownItem>
              {(row.orderStatus == 'awaiting' || row.orderStatus == 'awaiting_shipment') && row.orderItems.reduce((totalReceived, item: ShipmentOrderItem) => totalReceived + item.qtyReceived!, 0) <= 0 && (
                <>
                  <DropdownItem header>Actions</DropdownItem>
                  <DropdownItem
                    onClick={() =>
                      setshowDeleteModal({
                        show: true,
                        orderId: row.id,
                        orderNumber: row.orderNumber,
                      })
                    }>
                    <i className='las la-trash-alt text-danger label-icon align-middle fs-5 me-2' />
                    <span className='fw-normal text-danger'>Delete Receiving</span>
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>
        )
      },
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={tableData} progressPending={pending} expandableRows expandableRowsComponent={ShipmentExpandedDetail} expandableRowsComponentProps={{ mutateReceivings: mutateReceivings }} striped={true} />
    </>
  )
}

export default ReceivingTable
