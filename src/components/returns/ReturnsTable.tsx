/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReturnOrder, ReturnType } from '@typesTs/returns/returns'
import { CameraIcon } from 'lucide-react'
import DataTable from '@components/Common/DataTableSC'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card } from '@shadcn/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'

import ReturnExpandedType from './ReturnExpandedType'

type Props = {
  data: ReturnType
  apiMutateLink?: string
  handleReturnStateChange?: (newState: string, orderId: number) => void
}

const ReturnsTable: React.FC<ExpanderComponentProps<ReturnType>> = ({ data, apiMutateLink, handleReturnStateChange }: Props) => {
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
      name: <span className='font-semibold text-[11.2px] text-muted-foreground'>Returns Received</span>,
      selector: (row: ReturnOrder) => {
        const hasImage = row.orderItems.some((item) => Boolean(item.images?.length))
        return (
          <div className='flex items-center justify-start gap-1'>
            <span className='text-[11.2px] font-semibold'>{row.orderNumber}</span>
            {hasImage ? <CameraIcon className='text-destructive size-4' /> : null}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.7,
      left: true,
      sortFunction: orderNumber,
    },
    {
      name: <span className='font-semibold text-[11.2px] text-muted-foreground'>Status</span>,
      selector: (row: ReturnOrder) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success'>{` ${row.orderStatus} `}</span>
          case 'Processed':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{` ${row.orderStatus} `}</span>
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-warning'>{' awaiting '}</span>
          case 'awaiting pickup':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{' awaiting pickup '}</span>
          case 'on_hold':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-danger'>{' on hold '}</span>
          case 'cancelled':
            return <span className='inline-block rounded uppercase text-center text-[9.75px] font-bold p-2 bg-[color-mix(in_srgb,var(--dark)_10%,transparent)] text-dark'> {row.orderStatus} </span>
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
      name: <span className='font-semibold text-[11.2px] text-muted-foreground'>Reason</span>,
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
      name: <span className='font-semibold text-[11.2px] text-muted-foreground'>Marketplace</span>,
      selector: (row: ReturnOrder) => {
        return (
          <>
            <img
              loading='lazy'
              src={row.channelLogo ? row.channelLogo : NoImageAdress}
              alt='product Image'
              id={`ChannelLogo-${row.id}`}
              style={{
                width: '20px',
                height: '20px',
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
      center: true,
      compact: true,
      sortFunction: orderMarketplace,
    },
    {
      name: <span className='font-semibold text-center text-[11.2px] text-muted-foreground'>Return Date</span>,
      selector: (row: ReturnOrder) => row.orderDate,
      sortable: true,
      wrap: true,
      left: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-semibold text-[11.2px] text-muted-foreground'>Tracking Number</span>,
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
                  <a
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}
                    className='text-[11.2px]'>
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
                  <p style={{ margin: '0px' }} className='text-[11.2px]'>
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
                  <a
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}
                    className='text-[11.2px]'>
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
                  <p style={{ margin: '0px' }} className='text-[11.2px]'>
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
      name: <span className='font-semibold text-center text-[11.2px] text-muted-foreground'># of Items</span>,
      selector: (row: ReturnOrder) => row.totalItems || '',
      sortable: true,
      wrap: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-semibold text-center text-[11.2px] text-muted-foreground'>Charge</span>,
      selector: (row: ReturnOrder) => FormatCurrency(state.currentRegion, row.totalCharge),
      sortable: true,
      wrap: true,
      compact: true,
      center: true,
      style: {
        fontSize: '0.7rem',
        color: '#4481FD',
      },
    },
    {
      name: <span className='font-semibold text-center text-[11.2px] text-muted-foreground'>Status</span>,
      cell: (row: ReturnOrder) => {
        var returnStateBtn
        switch (row.returnState) {
          case 'complete':
            returnStateBtn = <span className='text-[11.2px] capitalize whitespace-nowrap text-success p-2'>{` ${row.returnState} `}</span>
            break
          case 'pending':
            returnStateBtn = <span className='text-[11.2px] capitalize whitespace-nowrap text-warning p-2'>{` ${row.returnState} `}</span>
            break
          default:
            break
        }
        return (
          <div role='group' className='inline-flex'>
            <DropdownMenu>
              {returnStateBtn}
              <DropdownMenuTrigger asChild>
                <button type='button' className='p-0 m-0'></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='shadow-md p-0 rounded'>
                {row.returnState !== 'pending' && (
                  <DropdownMenuItem className='capitalize text-[11.2px]' onClick={() => handleReturnStateChange!('pending', row.id)}>
                    <i className='mdi mdi-backup-restore text-[13px] text-warning align-middle m-0 p-0' /> pending
                  </DropdownMenuItem>
                )}
                {row.returnState !== 'complete' && (
                  <DropdownMenuItem className='capitalize text-[11.2px]' onClick={() => handleReturnStateChange!('complete', row.id)}>
                    <i className='mdi mdi-check-circle-outline text-[13px] text-success align-middle m-0 p-0' /> complete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    <div className='p-2 bg-[var(--vz-light)]'>
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
