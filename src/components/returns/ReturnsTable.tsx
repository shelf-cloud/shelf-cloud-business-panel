/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from 'react'
import DataTable, { ExpanderComponentProps } from 'react-data-table-component'
import { ButtonGroup, Card, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown, UncontrolledTooltip } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { ReturnOrder, ReturnsType } from '@typesTs/returns/returns'
import ReturnExpandedType from './ReturnExpandedType'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  data: ReturnsType
  apiMutateLink?: string
  handleReturnStateChange?: (newState: string, orderId: number) => void
}

const ReturnsTable: React.FC<ExpanderComponentProps<ReturnsType>> = ({ data, apiMutateLink, handleReturnStateChange }: Props) => {
  const { state }: any = useContext(AppContext)
  const orderNumber = (rowA: ReturnOrder, rowB: ReturnOrder) => {
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
  const orderStatus = (rowA: ReturnOrder, rowB: ReturnOrder) => {
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
  const orderMarketplace = (rowA: ReturnOrder, rowB: ReturnOrder) => {
    const a = rowA.channelName.toLowerCase()
    const b = rowB.channelName.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const orderReturnState = (rowA: ReturnOrder, rowB: ReturnOrder) => {
    const a = rowA.returnState!.toLowerCase()
    const b = rowB.returnState!.toLowerCase()

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
      name: <span className='fw-semibold fs-7 text-muted'>Returns Received</span>,
      selector: (row: ReturnOrder) => {
        return (
          <>
            <div style={{ margin: '0px', fontWeight: '600' }}>{row.orderNumber}</div>
            {/* {row.returnRMA && row.returnRMA !== '' && <span className='text-muted fs-7'>RMA: {row.returnRMA}</span>} */}
          </>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.7,
      left: true,
      sortFunction: orderNumber,
    },
    {
      name: <span className='fw-semibold fs-7 text-muted'>Status</span>,
      selector: (row: ReturnOrder) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='badge text-uppercase text-center badge-soft-success p-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Processed':
            return <span className='badge text-uppercase text-center badge-soft-secondary p-2'>{` ${row.orderStatus} `}</span>
            break
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='badge text-uppercase text-center badge-soft-warning p-2'>{' awaiting '}</span>
            break
          case 'awaiting pickup':
            return <span className='badge text-uppercase text-center badge-soft-secondary p-2'>{' awaiting pickup '}</span>
            break
          case 'on_hold':
            return <span className='badge text-uppercase text-center badge-soft-danger p-2'>{' on hold '}</span>
            break
          case 'cancelled':
            return <span className='badge text-uppercase text-center badge-soft-dark p-2'> {row.orderStatus} </span>
            break
          default:
            break
        }
      },
      sortable: true,
      wrap: true,
      // grow: 2,
      left: true,
      sortFunction: orderStatus,
    },
    {
      name: <span className='fw-semibold fs-7 text-muted'>Reason</span>,
      selector: (row: ReturnOrder) => row.returnReason,
      sortable: true,
      wrap: true,
      center: false,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-semibold fs-7 text-muted'>Marketplace</span>,
      selector: (row: ReturnOrder) => {
        return (
          <>
            <img
              loading='lazy'
              src={row.channelLogo ? row.channelLogo : NoImageAdress}
              alt='product Image'
              id={`ChannelLogo-${row.id}`}
              style={{
                width: '25px',
                height: '25px',
                objectFit: 'contain',
              }}
            />
            <UncontrolledTooltip placement='right' target={`ChannelLogo-${row.id}`}>
              {row.storeName}
            </UncontrolledTooltip>
          </>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.2,
      center: true,
      compact: true,
      sortFunction: orderMarketplace,
    },
    {
      name: <span className='fw-semibold text-center fs-7 text-muted'>Return Date</span>,
      selector: (row: ReturnOrder) => row.orderDate,
      sortable: true,
      wrap: true,
      // grow: 1.2,
      left: true,
      compact: true,
    },
    // {
    //   name: <span className='fw-semibold text-center fs-7 text-muted'>Return Closed</span>,
    //   selector: (row: ReturnOrder) => row.closedDate || '',
    //   sortable: true,
    //   wrap: true,
    //   grow: 1.2,
    //   center: true,
    //   compact: true,
    // },
    {
      name: <span className='fw-semibold fs-7 text-muted'>Tracking Number</span>,
      selector: (row: ReturnOrder) => {
        let tracking
        {
          switch (true) {
            case row.orderStatus == 'cancelled':
              tracking = <></>
              break
            case (row.orderType == 'Shipment' || row.orderType == 'Return') && row.trackingNumber != '' && !!row.trackingLink:
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={row.carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a href={`${row.trackingLink}${row.trackingNumber}`} target='blank' style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }} className='fs-7'>
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case (row.orderType == 'Shipment' || row.orderType == 'Return') && row.trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={row.carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }} className='fs-7'>
                    {row.trackingNumber}
                  </p>
                </div>
              )
              break
            case row.orderType == 'Wholesale' && row.trackingNumber != '' && !!row.trackingLink && row.carrierService == 'Parcel Boxes':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={row.carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <a href={`${row.trackingLink}${row.trackingNumber}`} target='blank' style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }} className='fs-7'>
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case row.orderType == 'Wholesale' && row.trackingNumber != '':
              tracking = (
                <div className='trackingNumber_container'>
                  <img
                    loading='lazy'
                    src={row.carrierIcon}
                    alt='carrier logo'
                    style={{
                      width: '16px',
                      height: '16px',
                      objectFit: 'contain',
                    }}
                  />
                  <p style={{ margin: '0px' }} className='fs-7'>
                    {row.trackingNumber}
                  </p>
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
      grow: 2,
      center: false,
      compact: true,
    },
    {
      name: <span className='fw-semibold text-center fs-7 text-muted'># of Items</span>,
      selector: (row: ReturnOrder) => row.totalItems || '',
      sortable: true,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-semibold text-center fs-7 text-muted'>Charge</span>,
      selector: (row: ReturnOrder) => FormatCurrency(state.currentRegion, row.totalCharge),
      sortable: true,
      wrap: true,
      compact: true,
      center: true,
      style: {
        color: '#4481FD',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7 text-muted'>Status</span>,
      cell: (row: ReturnOrder) => {
        var returnStateBtn
        switch (row.returnState) {
          case 'complete':
            returnStateBtn = <span className='text-capitalize text-nowrap text-success p-2'>{` ${row.returnState} `}</span>
            break
          case 'pending':
            returnStateBtn = <span className='text-capitalize text-nowrap text-warning p-2'>{` ${row.returnState} `}</span>
            break
          default:
            break
        }
        return (
          <ButtonGroup>
            <UncontrolledButtonDropdown>
              {returnStateBtn}
              <DropdownToggle tag='button' className='btn btn-sm p-0 m-0' split></DropdownToggle>
              <DropdownMenu end={true} className='shadow-md p-0 rounded'>
                {row.returnState !== 'pending' && (
                  <DropdownItem className='text-capitalize' onClick={() => handleReturnStateChange!('pending', row.id)}>
                    <i className='mdi mdi-backup-restore fs-5 text-warning align-middle m-0 p-0' /> pending
                  </DropdownItem>
                )}
                {row.returnState !== 'complete' && (
                  <DropdownItem className='text-capitalize' onClick={() => handleReturnStateChange!('complete', row.id)}>
                    <i className='mdi mdi-check-circle-outline fs-5 text-success align-middle m-0 p-0' /> complete
                  </DropdownItem>
                )}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </ButtonGroup>
        )
      },
      sortable: true,
      wrap: false,
      // grow: 2,
      center: true,
      sortFunction: orderReturnState,
    },
  ]

  return (
    <div className='p-2 bg-light'>
      <Card className='py-2'>
        <DataTable
          className='overflow-visible'
          columns={columns}
          data={Object.values(data.returns)}
          dense
          expandableRows
          expandableRowsComponent={ReturnExpandedType}
          expandableRowsComponentProps={{ apiMutateLink: apiMutateLink }}
        />
      </Card>
    </div>
  )
}

export default ReturnsTable
