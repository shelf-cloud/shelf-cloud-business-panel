import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from '@/components/migration-ui'

import FBAShipmentPackingSlip from './FBAShipmentPackingSlip'

type Props = {
  filteredItems: FBAShipment[]
  pending: boolean
  getFBAShipmentProofOfShipped: (shipmentId: string) => void
  seteditShipmentName: (prev: any) => void
  setFBAShipmentCompleteStatus: (shipmentId: string, newStatus: number, isManualComplete: number, status: string) => void
  setFBAShipmentReviewingStatus: (shipmentId: string, isManualComplete: number, status: string) => void
}

const UpdateShipmentNameStatus = ['shipped', 'ready_to_ship', 'working', 'awaiting', 'active', 'in_transit']

const FBAShipmentsTable = ({ filteredItems, pending, getFBAShipmentProofOfShipped, seteditShipmentName, setFBAShipmentCompleteStatus, setFBAShipmentReviewingStatus }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const orderStatus = (rowA: FBAShipment, rowB: FBAShipment) => {
    const a = rowA.shipment.status.toLowerCase()
    const b = rowB.shipment.status.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const sortDates = (Adate: string, Bdate: string) => {
    const a = moment(Adate)
    const b = moment(Bdate)
    if (a.isBefore(b)) {
      return -1
    } else {
      return 1
    }
  }

  const sortUnits = (rowA: FBAShipment, rowB: FBAShipment) => {
    const a = rowA.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)
    const b = rowB.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const sortStrings = (rowA: string, rowB: string) => {
    if (rowA.localeCompare(rowB)) {
      return 1
    } else {
      return -1
    }
  }

  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Shipment Name</span>,
      selector: (row: FBAShipment) => {
        return (
          <div className='my-2'>
            <p className='m-0 p-0 font-semibold'>{row.shipment.shipmentConfirmationId}</p>
            <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)]'>
              {row.shipment.name}{' '}
              {UpdateShipmentNameStatus.includes(row.shipment.status.toLowerCase()) && row.totalPlacementFees > 0 && (
                <i
                  onClick={() => {
                    seteditShipmentName({
                      show: true,
                      shipmentId: row.shipmentId,
                      shipmentName: row.shipment.name,
                    })
                  }}
                  className='ri-pencil-fill text-[13px] m-0 p-0 text-primary'
                  style={{ cursor: 'pointer' }}
                />
              )}
            </p>
          </div>
        )
      },
      sortable: false,
      center: false,
      grow: 2,
      compact: false,
    },
    {
      name: <span className='font-bold text-[13px]'>Created</span>,
      selector: (row: FBAShipment) => {
        return (
          <>
            <p className='text-[11.2px] m-0 p-0'>{moment(row.createdAt).local().format('LL')}</p>
            <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)]'>{moment(row.createdAt).local().format('hh:mm A')}</p>
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: FBAShipment, rowB: FBAShipment) => sortDates(rowA.createdAt, rowB.createdAt),
    },
    {
      name: <span className='font-bold text-[13px]'>Last Updated</span>,
      selector: (row: FBAShipment) => {
        return (
          <>
            <p className='text-[11.2px] m-0 p-0'>{moment.utc(row.lastUpdated).local().format('LL')}</p>
            <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)]'>{moment.utc(row.lastUpdated).local().format('hh:mm A')}</p>
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: FBAShipment, rowB: FBAShipment) => sortDates(rowA.lastUpdated, rowB.lastUpdated),
    },
    {
      name: <span className='font-bold text-[13px]'>Ship To</span>,
      selector: (row: FBAShipment) => row.shipment.destination.warehouseId,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-bold text-[13px]'>Type</span>,
      selector: (row: FBAShipment) => {
        switch (row.fulfillmentType) {
          case 'Master Boxes':
            return <span className='text-[11.2px] text-primary font-semibold'>{CleanStatus(row.fulfillmentType)}</span>
            break
          case 'Individual Units':
            return <span className='text-[11.2px] text-info font-semibold'>{CleanStatus(row.fulfillmentType)}</span>
            break
          default:
            return <></>
            break
        }
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: FBAShipment, rowB: FBAShipment) => sortStrings(rowA.fulfillmentType, rowB.fulfillmentType),
    },
    {
      name: <span className='font-bold text-[13px]'>Shipping Mode</span>,
      selector: (row: FBAShipment) => row.shippingMode,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-bold text-[13px]'>SKU</span>,
      selector: (row: FBAShipment) => row.shipmentItems.items.length,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: (
        <div className='text-center'>
          <p className='m-0 font-bold text-[13px]'>Units Expected</p>
          <p className='m-0 text-[11.2px] text-[var(--bs-secondary-color)]'>Units Located</p>
        </div>
      ),
      selector: (row: FBAShipment) => {
        return (
          <>
            <p className='m-0 font-semibold text-center'>
              {FormatIntNumber(
                state.currentRegion,
                row.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)
              )}
            </p>
            <p className='m-0 text-primary text-center'>
              {row.receipts
                ? FormatIntNumber(
                    state.currentRegion,
                    Object.values(row.receipts).reduce((total, item) => total + item.quantity, 0)
                  )
                : 0}
            </p>
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortUnits,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Status</span>,
      selector: (row: FBAShipment) => {
        const status = row.status ? row.status.toLowerCase() : row.shipment.status.toLowerCase()
        switch (status) {
          case 'shipped':
          case 'ready_to_ship':
          case 'awaiting':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-secondary)_10%,transparent)] text-secondary p-2'>{` ${CleanStatus(status)} `}</span>
            break
          case 'delivered':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-success)_10%,transparent)] text-success p-2'>{` ${CleanStatus(status)} `}</span>
            break
          case 'working':
          case 'active':
          case 'unconfirmed':
          case 'reviewing':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-warning)_10%,transparent)] text-warning p-2'>{` ${CleanStatus(status)} `}</span>
            break
          case 'in_transit':
          case 'checked_in':
          case 'receiving':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-secondary)_10%,transparent)] text-secondary p-2'>{` ${CleanStatus(status)} `}</span>
            break
          case 'in_dispute':
          case 'error':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-danger)_10%,transparent)] text-danger p-2'>{` ${CleanStatus(status)} `}</span>
            break
          case 'cancelled':
          case 'manually_closed':
          case 'closed':
          case 'deleted':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-dark)_10%,transparent)] text-dark p-2'>{` ${CleanStatus(status)} `}</span>
            break
          default:
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-secondary)_10%,transparent)] text-secondary p-2'>{` ${CleanStatus(status)} `}</span>
            break
        }
      },
      sortable: true,
      wrap: true,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: orderStatus,
    },
    {
      name: <span className='font-bold text-[13px]'></span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: FBAShipment) => {
        if (row.shipment.status.toLowerCase() !== 'cancelled') {
          return (
            <UncontrolledDropdown className='dropdown inline-block' direction='start'>
              <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
                <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-1 py-0' style={{ color: '#919FAF' }} />
              </DropdownToggle>
              <DropdownMenu className='dropdown-menu-end' container={'body'}>
                <DropdownItem onClick={() => router.push(`/amazon-sellers/shipments/${row.shipmentId}`)}>
                  <div>
                    <i className='ri-file-list-line label-icon align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-black'>View Shipment</span>
                  </div>
                </DropdownItem>
                <DropdownItem header>Documents</DropdownItem>
                <FBAShipmentPackingSlip order={row} />
                {row.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber && (
                  <DropdownItem onClick={() => getFBAShipmentProofOfShipped(row.shipment.shipmentConfirmationId)}>
                    <div>
                      <i className='las la-truck label-icon align-middle text-[16.25px] me-2' />
                      <span className='text-[11.2px] font-normal text-black'>Proof Of Shipped</span>
                    </div>
                  </DropdownItem>
                )}
                <DropdownItem header>Actions</DropdownItem>
                {row.status !== 'REVIEWING' && (
                  <DropdownItem onClick={() => setFBAShipmentReviewingStatus(row.shipmentId, !row.isComplete ? 1 : 0, 'IN_DISPUTE')}>
                    <i className='las la-clipboard-check label-icon align-middle text-[16.25px] me-2' />
                    <span className='text-[13px] font-normal text-black'>Mark In Dispute</span>
                  </DropdownItem>
                )}
                <DropdownItem
                  onClick={() => setFBAShipmentCompleteStatus(row.shipmentId, !row.isComplete ? 1 : 0, !row.isComplete ? 1 : 0, !row.isComplete ? 'MANUALLY_CLOSED' : 'PENDING')}>
                  <i className='las la-clipboard-check label-icon align-middle text-[16.25px] me-2' />
                  <span className='text-[13px] font-normal text-black'>{!row.isComplete ? 'Mark Closed' : 'Mark Open'}</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          )
        } else {
          return <></>
        }
      },
    },
  ]
  ;('sh08ff820f-085f-4fe9-8072-add707145c26')
  return (
    <>
      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={pending}
        striped={true}
        pagination={filteredItems?.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Shipments per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default FBAShipmentsTable
