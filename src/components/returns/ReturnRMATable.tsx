/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { OrderItem, ReturnOrder, ReturnType } from '@typesTs/returns/returns'
import { CameraIcon } from 'lucide-react'
import DataTable from '@components/Common/DataTableSC'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'

import ReturnsTable from './ReturnsTable'

type Props = {
  filterDataTable: ReturnType[]
  pending: boolean
  apiMutateLink: string
  handleReturnStateChange: (newState: string, orderId: number) => void
  setSelectedRows: (selectedRows: ReturnType[]) => void
  toggledClearRows: boolean
}

const ReturnRMATable = ({ filterDataTable, pending, apiMutateLink, handleReturnStateChange, setSelectedRows, toggledClearRows }: Props) => {
  const { state }: any = useContext(AppContext)

  const orderNumber = (rowA: ReturnType, rowB: ReturnType) => {
    const a = rowA.shipmentOrderNumber.toLowerCase()
    const b = rowB.shipmentOrderNumber.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderStatus = (rowA: ReturnType, rowB: ReturnType) => {
    const a = Object.values(rowA.returns)[0].orderStatus.toLowerCase()
    const b = Object.values(rowB.returns)[0].orderStatus.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderMarketplace = (rowA: ReturnType, rowB: ReturnType) => {
    const a = Object.values(rowA.returns)[0].channelName.toLowerCase()
    const b = Object.values(rowB.returns)[0].channelName.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderReturnState = (rowA: ReturnType, rowB: ReturnType) => {
    const a = Object.values(rowA.returns)[0].returnState.toLowerCase()
    const b = Object.values(rowB.returns)[0].returnState.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const handleSelectedRows = ({ selectedRows }: { selectedRows: ReturnType[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='font-extrabold text-[13px]'>Orders Returned</span>,
      selector: (row: ReturnType) => {
        const hasImage =
          Object.values(row.returns).some((ret) => ret.proofImageUrl) ||
          Object.values(row.returns).some((ret) => ret.orderItems.some((item) => item.images && item.images.length > 0))
        return (
          <>
            <div className='flex items-center justify-start gap-1'>
              <p className='font-semibold text-[11.2px] m-0 p-0'>{row.shipmentOrderNumber}</p>
              {hasImage ? <CameraIcon className='text-destructive size-4' /> : null}
            </div>
            <p className='text-[var(--bs-secondary-color)] text-[11.2px] m-0 p-0'>
              {Object.values(row.returns)[0].orderNumber}
              {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length - 1}`}</span>}
            </p>
          </>
        )
      },
      sortable: false,
      wrap: false,
      grow: 1.7,
      left: true,
      compact: true,
      sortFunction: orderNumber,
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Status</span>,
      selector: (row: ReturnType) => {
        const status = Object.values(row.returns)[0].orderStatus
        switch (status) {
          case 'shipped':
          case 'received':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success'>{` ${status} `}</span>
          case 'Processed':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{` ${status} `}</span>
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-warning'>{' awaiting '}</span>
          case 'awaiting pickup':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{' awaiting pickup '}</span>
          case 'on_hold':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger'>{' on hold '}</span>
          case 'cancelled':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--dark)_10%,transparent)] text-dark'> {status} </span>
          default:
            break
        }
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      center: true,
      compact: true,
      sortFunction: orderStatus,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Reason</span>,
      selector: (row: ReturnType) => Object.values(row.returns)[0].returnReason,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Marketplace</span>,
      selector: (row: ReturnType) => {
        return (
          <>
            <img
              loading='lazy'
              src={Object.values(row.returns)[0].channelLogo ? Object.values(row.returns)[0].channelLogo : NoImageAdress}
              alt='product Image'
              id={`ChannelLogo-${Object.values(row.returns)[0].id}`}
              style={{
                width: '20px',
                height: '20px',
                objectFit: 'contain',
              }}
            />
            <UncontrolledTooltip placement='right' target={`ChannelLogo-${Object.values(row.returns)[0].id}`}>
              {Object.values(row.returns)[0].storeName}
            </UncontrolledTooltip>
          </>
        )
      },
      sortable: true,
      wrap: false,
      center: true,
      compact: true,
      sortFunction: orderMarketplace,
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Return Date</span>,
      selector: (row: ReturnType) => Object.values(row.returns)[0].orderDate,
      sortable: true,
      wrap: true,
      //   grow: 1.2,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-[13px]'>Tracking Number</span>,
      selector: (row: ReturnType) => {
        let tracking
        {
          switch (true) {
            case Object.values(row.returns)[0].orderStatus == 'cancelled':
              tracking = <></>
              break
            case (Object.values(row.returns)[0].orderType == 'Shipment' || Object.values(row.returns)[0].orderType == 'Return') &&
              Object.values(row.returns)[0].trackingNumber != '' &&
              !!Object.values(row.returns)[0].trackingLink:
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a
                    href={`${Object.values(row.returns)[0].trackingLink}${Object.values(row.returns)[0].trackingNumber}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[11.2px]'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </a>
                </div>
              )
              break
            case (Object.values(row.returns)[0].orderType == 'Shipment' || Object.values(row.returns)[0].orderType == 'Return') &&
              Object.values(row.returns)[0].trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }} className='text-[11.2px]'>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </p>
                </div>
              )
              break
            case Object.values(row.returns)[0].orderType == 'Wholesale' &&
              Object.values(row.returns)[0].trackingNumber != '' &&
              !!Object.values(row.returns)[0].trackingLink &&
              Object.values(row.returns)[0].carrierService == 'Parcel Boxes':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a
                    href={`${Object.values(row.returns)[0].trackingLink}${Object.values(row.returns)[0].trackingNumber}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[11.2px]'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </a>
                </div>
              )
              break
            case Object.values(row.returns)[0].orderType == 'Wholesale' && Object.values(row.returns)[0].trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }} className='text-[11.2px]'>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </p>
                </div>
              )
              break
            case Object.values(row.returns)[0].trackingNumber == '':
              tracking = Object.values(row.returns)[0].trackingNumber
              break
            default:
              tracking = Object.values(row.returns)[0].trackingNumber
          }
        }
        return tracking
      },
      sortable: false,
      wrap: true,
      grow: 2,
      center: false,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Items Received</span>,
      selector: (row: ReturnType) => {
        const totalOrderItems = Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => total + returnOrder.totalItems, 0)
        const totalReceivedItems = Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => {
          const received = returnOrder.orderItems.reduce((total: number, item: OrderItem) => total + (item.qtyReceived ?? 0), 0)
          return total + received
        }, 0)

        return row.totalOrderItems === 0 ? (
          <>
            <span className='text-[11.2px]'>{totalOrderItems}</span>
          </>
        ) : (
          <>
            <span className={'font-bold text-[13px]' + (totalReceivedItems !== row.totalOrderItems ? ' text-danger' : '')}>{totalReceivedItems}</span>
            {` / `}
            <span className='text-[11.2px]'>{row.totalOrderItems}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Total Charge</span>,
      selector: (row: ReturnType) =>
        FormatCurrency(
          state.currentRegion,
          Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => total + returnOrder.totalCharge, 0)
        ),
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      style: {
        fontSize: '0.7rem',
        color: '#4481FD',
      },
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Status</span>,
      cell: (row: ReturnType) => {
        var returnStateBtn
        switch (Object.values(row.returns)[0].returnState) {
          case 'complete':
            returnStateBtn = (
              <span className='text-[11.2px] capitalize whitespace-nowrap text-success p-2'>
                {` ${Object.values(row.returns)[0].returnState} `}
                {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
              </span>
            )
            break
          case 'pending':
            returnStateBtn = (
              <span className='text-[11.2px] capitalize whitespace-nowrap text-warning p-2'>
                {` ${Object.values(row.returns)[0].returnState} `}
                {Object.values(row.returns).length > 1 && <span className='text-[11.2px] text-danger'>{` +${Object.values(row.returns).length}`}</span>}
              </span>
            )
            break
          default:
            break
        }
        return returnStateBtn
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      center: true,
      compact: true,
      sortFunction: orderReturnState,
    },
  ]
  return (
    <>
      <DataTable
        // noTableHead={true}
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        defaultSortFieldId={5}
        defaultSortAsc={false}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        expandableRows
        expandableRowsComponent={ReturnsTable}
        expandableRowsComponentProps={{
          apiMutateLink: apiMutateLink,
          handleReturnStateChange: handleReturnStateChange,
        }}
        pagination={filterDataTable.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Orders per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default ReturnRMATable
