/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { ReturnOrder, ReturnsType } from '@typesTs/returns/returns'
import ReturnsTable from './ReturnsTable'
import { UncontrolledTooltip } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'

type Props = {
  filterDataTable: ReturnsType[]
  pending: boolean
  apiMutateLink: string
  handleReturnStateChange: (newState: string, orderId: number) => void
}

const ReturnRMATable = ({ filterDataTable, pending, apiMutateLink, handleReturnStateChange }: Props) => {
  const { state }: any = useContext(AppContext)

  const orderNumber = (rowA: ReturnsType, rowB: ReturnsType) => {
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
  const orderStatus = (rowA: ReturnsType, rowB: ReturnsType) => {
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
  const orderMarketplace = (rowA: ReturnsType, rowB: ReturnsType) => {
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
  const orderReturnState = (rowA: ReturnsType, rowB: ReturnsType) => {
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
  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Orders Returned</span>,
      selector: (row: ReturnsType) => {
        return (
          <>
            <p className='fw-semibold fs-6 m-0 p-0'>{row.shipmentOrderNumber}</p>
            <p className='text-muted fs-7 m-0 p-0'>
              {Object.values(row.returns)[0].orderNumber}
              {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length - 1}`}</span>}
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
      name: <span className='fw-bolder text-center fs-6'>Status</span>,
      selector: (row: ReturnsType) => {
        switch (Object.values(row.returns)[0].orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='badge text-uppercase text-center badge-soft-success p-2'>{` ${Object.values(row.returns)[0].orderStatus} `}</span>
            break
          case 'Processed':
            return <span className='badge text-uppercase text-center badge-soft-secondary p-2'>{` ${Object.values(row.returns)[0].orderStatus} `}</span>
            break
          case 'awaiting_shipment':
          case 'awating':
            return <span className='badge text-uppercase text-center badge-soft-warning p-2'>{' awating '}</span>
            break
          case 'awating pickup':
            return <span className='badge text-uppercase text-center badge-soft-secondary p-2'>{' awating pickup '}</span>
            break
          case 'on_hold':
            return <span className='badge text-uppercase text-center badge-soft-danger p-2'>{' on hold '}</span>
            break
          case 'cancelled':
            return <span className='badge text-uppercase text-center badge-soft-dark p-2'> {Object.values(row.returns)[0].orderStatus} </span>
            break
          default:
            break
        }
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      left: true,
      compact: true,
      sortFunction: orderStatus,
    },
    {
      name: <span className='fw-bolder fs-6'>Reason</span>,
      selector: (row: ReturnsType) => Object.values(row.returns)[0].returnReason,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Marketplace</span>,
      selector: (row: ReturnsType) => {
        return (
          <>
            <img
              src={
                Object.values(row.returns)[0].channelLogo
                  ? Object.values(row.returns)[0].channelLogo
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              alt='product Image'
              id={`ChannelLogo-${Object.values(row.returns)[0].id}`}
              style={{
                width: '25px',
                height: '25px',
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
      wrap: true,
      center: true,
      compact: true,
      sortFunction: orderMarketplace,
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Order Date</span>,
      selector: (row: ReturnsType) => Object.values(row.returns)[0].orderDate,
      sortable: true,
      wrap: true,
      //   grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Order Closed</span>,
      selector: (row: ReturnsType) => Object.values(row.returns)[0].closedDate || '',
      sortable: true,
      wrap: true,
      //   grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Tracking Number</span>,
      selector: (row: ReturnsType) => {
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
                    target='blank'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </a>
                </div>
              )
              break
            case (Object.values(row.returns)[0].orderType == 'Shipment' || Object.values(row.returns)[0].orderType == 'Return') &&
              Object.values(row.returns)[0].trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
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
                    target='blank'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
                  </a>
                </div>
              )
              break
            case Object.values(row.returns)[0].orderType == 'Wholesale' && Object.values(row.returns)[0].trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    src={Object.values(row.returns)[0].carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }}>
                    {Object.values(row.returns)[0].trackingNumber}
                    {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
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
      name: <span className='fw-bolder text-center fs-6'>Items Received</span>,
      selector: (row: ReturnsType) => (
        <>
          <span
            className={
              'fw-semibold fs-5' + (Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => total + returnOrder.totalItems, 0) !== row.totalOrderItems ? ' text-danger' : '')
            }>
            {Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => total + returnOrder.totalItems, 0)}
          </span>
          {` / `}
          <span>{row.totalOrderItems}</span>
        </>
      ),
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Total Charge</span>,
      selector: (row: ReturnsType) =>
        FormatCurrency(
          state.currentRegion,
          Object.values(row.returns).reduce((total: number, returnOrder: ReturnOrder) => total + returnOrder.totalCharge, 0)
        ),
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      style: {
        color: '#4481FD',
      },
    },
    {
      name: <span className='fw-bolder text-center fs-6'>Return State</span>,
      cell: (row: ReturnsType) => {
        var returnStateBtn
        switch (Object.values(row.returns)[0].returnState) {
          case 'complete':
            returnStateBtn = (
              <span className='text-capitalize text-nowrap text-success p-2'>
                {` ${Object.values(row.returns)[0].returnState} `}
                {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
              </span>
            )
            break
          case 'pending':
            returnStateBtn = (
              <span className='text-capitalize text-nowrap text-warning p-2'>
                {` ${Object.values(row.returns)[0].returnState} `}
                {Object.values(row.returns).length > 1 && <span className='fs-7 text-danger'>{` +${Object.values(row.returns).length}`}</span>}
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
        expandableRows
        expandableRowsComponent={ReturnsTable}
        expandableRowsComponentProps={{ apiMutateLink: apiMutateLink, handleReturnStateChange: handleReturnStateChange }}
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
