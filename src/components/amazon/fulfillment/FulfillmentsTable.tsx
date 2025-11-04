import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES } from '@lib/AmzConstants'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ListInboundPlan } from '@typesTs/amazon/fulfillments/listInboundPlans'
import moment from 'moment'
import DataTable from 'react-data-table-component'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

type Props = {
  filteredItems: ListInboundPlan[]
  pending: boolean
  setcancelInboundPlanModal: (prev: any) => void
  setassignWorkflowIdModal: (prev: any) => void
  setassignFinishedWorkflowIdModal: (prev: any) => void
  handleRepairFBAWorkflow: (inboundPlanId: string) => void
}

const FulfillmentsTable = ({ filteredItems, pending, setcancelInboundPlanModal, setassignFinishedWorkflowIdModal, handleRepairFBAWorkflow }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const orderStatus = (rowA: ListInboundPlan, rowB: ListInboundPlan) => {
    const a = rowA.status.toLowerCase()
    const b = rowB.status.toLowerCase()

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

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Fulfillment Name</span>,
      selector: (row: ListInboundPlan) => row.name,
      sortable: true,
      center: false,
      compact: false,
      grow: 1.8,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Marketplace</span>,
      selector: (row: ListInboundPlan) => AMAZON_MARKETPLACES[row.destinationMarketplaces]?.domain ?? 'Error Marketplace',
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Date Created</span>,
      selector: (row: ListInboundPlan) => moment.utc(row.createdAt).local().format('LL hh:mm A'),
      sortable: true,
      center: true,
      compact: true,
      grow: 1.2,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: ListInboundPlan, rowB: ListInboundPlan) => sortDates(rowA.createdAt, rowB.createdAt),
    },
    {
      name: <span className='fw-bolder fs-13'>Status</span>,
      selector: (row: ListInboundPlan) => {
        switch (row.status.toLowerCase()) {
          case 'complete':
          case 'completed':
            return <span className='badge text-uppercase badge-soft-success p-2'>{` ${row.status} `}</span>
          case 'delivered':
          case 'creating':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${row.status} `}</span>
          case 'assign':
          case 'working':
          case 'awaiting':
          case 'active':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.status} `}</span>
          case 'ready to ship':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${row.status} `}</span>
          case 'error':
            return <span className='badge text-uppercase badge-soft-danger p-2'>{` ${row.status} `}</span>
          case 'cancelled':
          case 'closed':
          case 'deleted':
            return <span className='badge text-uppercase badge-soft-dark p-2'> {row.status} </span>
          default:
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${row.status} `}</span>
        }
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: orderStatus,
    },
    {
      name: <span className='fw-bold fs-6'>SKU</span>,
      selector: (row: ListInboundPlan) => FormatIntNumber(state.currentRegion, row.items.length),
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Units</span>,
      selector: (row: ListInboundPlan) =>
        FormatIntNumber(
          state.currentRegion,
          row.items.reduce((total, item) => total + item.quantity, 0)
        ),
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Action</span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: ListInboundPlan) => {
        switch (row.status.toLowerCase()) {
          case 'creating':
            return <></>
          case 'active':
          case 'assign':
          case 'working':
            return (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-1 py-0' style={{ color: '#919FAF' }}></i>
                </DropdownToggle>
                {row.inboundPlanId ? (
                  <DropdownMenu className='dropdown-menu-end' container={'body'}>
                    <DropdownItem
                      onClick={() =>
                        row.amzFinished
                          ? router.push(`/amazon-sellers/fulfillment/sellerPortal/${row.inboundPlanId}`)
                          : row.fulfillmentType === 'Master Boxes'
                            ? router.push(`/amazon-sellers/fulfillment/masterBoxes/${row.inboundPlanId}`)
                            : router.push(`/amazon-sellers/fulfillment/individualUnits/${row.inboundPlanId}`)
                      }>
                      <div>
                        <i className='ri-file-list-line align-middle me-2 fs-5 text-muted'></i>
                        <span className='fs-6 fw-normal text-dark'>Manage</span>
                      </div>
                    </DropdownItem>
                    {!row.confirmedDate && (
                      <DropdownItem className='text-danger' onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                        <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                      </DropdownItem>
                    )}
                    {/* {row.confirmedDate &&
                    row.confirmedShipments &&
                    Object.values(row.confirmedShipments).some((shipment) => shipment.shipment.trackingDetails.ltlTrackingDetail.billOfLadingNumber)
                      ? moment.duration(moment.utc().diff(moment.utc(row.confirmedDate))).asHours() < 1 && (
                          <DropdownItem
                            className='text-danger'
                            onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                            <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                            <span className='ms-2'>{`${FormatIntNumber(
                              state.currentRegion,
                              45 - moment.duration(moment.utc().diff(moment.utc(row.confirmedDate))).asMinutes()
                            )} min left`}</span>
                          </DropdownItem>
                        )
                      : moment.duration(moment.utc().diff(moment.utc(row.confirmedDate))).asHours() < 24 && (
                          <DropdownItem
                            className='text-danger'
                            onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                            <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                            <span className='ms-2'>{`${FormatIntNumber(
                              state.currentRegion,
                              1380 - moment.duration(moment.utc().diff(moment.utc(row.confirmedDate))).asMinutes()
                            )} min left`}</span>
                          </DropdownItem>
                        )} */}
                  </DropdownMenu>
                ) : (
                  <DropdownMenu className='dropdown-menu-end' container={'body'}>
                    <DropdownItem
                      onClick={() =>
                        setassignFinishedWorkflowIdModal({
                          show: true,
                          id: row.id,
                          inboundPlanName: row.name,
                          marketplace: row.destinationMarketplaces,
                          dateCreated: moment.utc(row.createdAt).local().format('LL hh:mm A'),
                          skus: row.items.length,
                          units: row.items.reduce((total, item) => total + item.quantity, 0),
                        })
                      }>
                      <div>
                        <i className='ri-file-list-line align-middle me-2 fs-5 text-info'></i>
                        <span className='fs-6 fw-normal text-dark'>Assign Finished Workflow</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem className='text-danger' onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: 'manual', inboundPlanName: row.name })}>
                      <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </UncontrolledDropdown>
            )
          case 'completed':
          case 'complete':
            return (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-1 py-0' style={{ color: '#919FAF' }}></i>
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem
                    onClick={() =>
                      row.amzFinished
                        ? router.push(`/amazon-sellers/fulfillment/sellerPortal/${row.inboundPlanId}`)
                        : row.fulfillmentType === 'Master Boxes'
                          ? router.push(`/amazon-sellers/fulfillment/masterBoxes/${row.inboundPlanId}`)
                          : router.push(`/amazon-sellers/fulfillment/individualUnits/${row.inboundPlanId}`)
                    }>
                    <div>
                      <i className='ri-file-list-line align-middle me-2 fs-5 text-muted'></i>
                      <span className='fs-6 fw-normal text-dark'>View Details</span>
                    </div>
                  </DropdownItem>
                  {/* {Object.values(row.confirmedShipments).some((shipment) => shipment.shipment.trackingDetails.ltlTrackingDetail.billOfLadingNumber)
                    ? moment.duration(moment.utc().diff(moment.utc(row.createdAt))).asHours() < 1 && (
                        <DropdownItem
                          className='text-danger'
                          onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                          <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                          <span className='ms-2'>{`${FormatIntNumber(
                            state.currentRegion,
                            45 - moment.duration(moment.utc().diff(moment.utc(row.createdAt))).asMinutes()
                          )} min left`}</span>
                        </DropdownItem>
                      )
                    : moment.duration(moment.utc().diff(moment.utc(row.createdAt))).asHours() < 24 && (
                        <DropdownItem
                          className='text-danger'
                          onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                          <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                          <span className='ms-2'>{`${FormatIntNumber(
                            state.currentRegion,
                            1380 - moment.duration(moment.utc().diff(moment.utc(row.createdAt))).asMinutes()
                          )} min left`}</span>
                        </DropdownItem>
                      )} */}
                </DropdownMenu>
              </UncontrolledDropdown>
            )
          case 'error':
            return (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-1 py-0' style={{ color: '#919FAF' }}></i>
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem onClick={() => handleRepairFBAWorkflow(row.inboundPlanId)}>
                    <div>
                      <i className='las la-undo-alt align-middle me-2 fs-5 text-info'></i>
                      <span className='fs-6 fw-normal'>Repair Inbound Plan</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem className='text-danger' onClick={() => setcancelInboundPlanModal({ show: true, inboundPlanId: row.inboundPlanId, inboundPlanName: row.name })}>
                    <i className={'las la-times-circle align-middle fs-5 me-2'}></i> Cancel
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )
          default:
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
        pagination={filteredItems.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Fulfillments per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default FulfillmentsTable
