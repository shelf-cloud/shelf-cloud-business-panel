import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments'
import moment from 'moment'
import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

type Props = {
  filteredItems: FBAShipment[]
  pending: boolean
}

const FBAShipmentsTable = ({ filteredItems, pending }: Props) => {
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

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Shipment Name</span>,
      selector: (row: FBAShipment) => {
        return (
          <div className='my-2'>
            <p className='m-0 p-0 fw-semibold'>{row.shipment.shipmentConfirmationId}</p>
            <p className='m-0 p-0 text-muted'>{row.shipment.name}</p>
          </div>
        )
      },
      sortable: false,
      center: false,
      grow: 2,
      compact: false,
    },
    {
      name: <span className='fw-bold fs-6'>Created</span>,
      selector: (row: FBAShipment) => {
        return (
          <>
            <p className='m-0 p-0'>{moment(row.createdAt).local().format('LL')}</p>
            <p className='m-0 p-0 text-muted'>{moment(row.createdAt).local().format('hh:mm A')}</p>
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: FBAShipment, rowB: FBAShipment) => sortDates(rowA.createdAt, rowB.createdAt),
    },
    {
      name: <span className='fw-bold fs-6'>Last Updated</span>,
      selector: (row: FBAShipment) => {
        return (
          <>
            <p className='m-0 p-0'>{moment.utc(row.lastUpdated).local().format('LL')}</p>
            <p className='m-0 p-0 text-muted'>{moment.utc(row.lastUpdated).local().format('hh:mm A')}</p>
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: FBAShipment, rowB: FBAShipment) => sortDates(rowA.lastUpdated, rowB.lastUpdated),
    },
    {
      name: <span className='fw-bold fs-6'>Ship To</span>,
      selector: (row: FBAShipment) => row.shipment.destination.warehouseId,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>SKU</span>,
      selector: (row: FBAShipment) => row.shipmentItems.items.length,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Units</span>,
      selector: (row: FBAShipment) =>
        FormatIntNumber(
          state.currentRegion,
          row.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)
        ),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortUnits,
    },
    {
      name: <span className='fw-bolder fs-13'>Status</span>,
      selector: (row: FBAShipment) => {
        switch (row.shipment.status.toLowerCase()) {
          case 'shipped':
          case 'ready_to_ship':
          case 'working':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${CleanStatus(row.shipment.status)} `}</span>
            break
          case 'delivered':
            return <span className='badge text-uppercase badge-soft-success p-2'>{` ${CleanStatus(row.shipment.status)} `}</span>
            break
          case 'awating':
          case 'active':
          case 'unconfirmed':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${CleanStatus(row.shipment.status)} `}</span>
            break
          case 'in_transit':
          case 'cheched_in':
          case 'receiving':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${CleanStatus(row.shipment.status)} `}</span>
            break
          case 'error':
            return <span className='badge text-uppercase badge-soft-danger p-2'>{` ${CleanStatus(row.shipment.status)} `}</span>
            break
          case 'cancelled':
          case 'closed':
          case 'deleted':
            return <span className='badge text-uppercase badge-soft-dark p-2'> {row.shipment.status} </span>
            break
          default:
            break
        }
      },
      sortable: true,
      wrap: true,
      center: true,
      sortFunction: orderStatus,
    },
    {
      name: <span className='fw-bold fs-6'>Action</span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: FBAShipment) => {
        if (row.shipment.status.toLowerCase() !== 'cancelled') {
          return (
            <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
              <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
                <i className='mdi mdi-dots-vertical align-middle fs-3 m-0 px-2 py-0' style={{ color: '#919FAF' }}></i>
              </DropdownToggle>

              <DropdownMenu className='dropdown-menu-end'>
                <DropdownItem onClick={() => router.push(`/amazon-sellers/shipments/${row.shipmentId}`)}>
                  <div>
                    <i className='ri-file-list-line align-middle me-2 fs-5 text-muted'></i>
                    <span className='fs-6 fw-normal text-dark'>View Shipment</span>
                  </div>
                </DropdownItem>
                {/* <DropdownItem className='text-danger' onClick={() => handleCancelInboundPlan(row.inboundPlanId)}>
                  <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                </DropdownItem> */}
              </DropdownMenu>
            </UncontrolledDropdown>
          )
        } else {
          return <></>
        }
      },
    },
  ]

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
