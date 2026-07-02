/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { AddNoteToShipmentModalType } from '@pages/Shipments'
import { Shipment } from '@typesTs/shipments/shipments'
import DataTable from 'react-data-table-component'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from '@/components/migration-ui'

import DownloadPackingSlip from '../wholesale/DownloadPackingSlip'
import NoShipmentsFound from './NoShipmentsFound'

type SortByType = {
  key: string
  asc: boolean
}

type Props = {
  tableData: Shipment[]
  pending: boolean
  sortBy: SortByType
  setSortBy: (prev: SortByType) => void
  handleGetShipmentBOL: (orderNumber: string, orderId: string, documentType: string) => Promise<void>
  setaddNoteToShipmentModal: (prev: AddNoteToShipmentModalType) => void
}

const ShipmentsTable = ({ tableData, pending, sortBy, setSortBy, handleGetShipmentBOL, setaddNoteToShipmentModal }: Props) => {
  const { state, setModalCreateReturnInfo, setShipmentDetailsModal }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Order Number</span>,
      selector: (row: Shipment) => {
        return (
          <>
            <div className='flex flex-row justify-start gap-1'>
              <div
                className='text-[11.2px] m-0 font-semibold'
                style={{ cursor: 'pointer' }}
                onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                <span className='m-0'>{row.orderNumber}</span>
              </div>
              {row.note != '' && <i className='ri-information-fill text-[16.25px] text-warning' id={`tooltip-shipment-note${row.orderId}`} />}
              {row.note != '' && (
                <SCTooltip target={`tooltip-shipment-note${row.orderId}`} placement='right' key={`tooltip-shipment-note${row.orderId}`}>
                  <p className='text-[11.2px] text-primary m-0 p-0'>{row.note}</p>
                </SCTooltip>
              )}
            </div>
            {row.poNumber && row.poNumber !== row.orderNumber && (
              <span className='m-0 text-[11.2px] text-[color:var(--bs-secondary-color)]' style={{ opacity: '80%' }}>
                PO: {row.poNumber}
              </span>
            )}
            {row.hasReturn && (
              <span className='text-destructive' style={{ opacity: '80%' }}>
                Return: {row.returns[0]}
                {row.returns.length > 1 && <span className='text-[11.2px] text-destructive'>{` +${row.returns.length - 1}`}</span>}
              </span>
            )}
            {row.isIndividualUnits && (
              <span className='text-secondary' style={{ opacity: '80%' }}>
                Individual Units
              </span>
            )}
          </>
        )
      },
      sortable: false,
      wrap: true,
      grow: 1.7,
      left: true,
    },
    {
      name: (
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderStatus', asc: !sortBy.asc })}>
          Status {sortBy.key === 'orderStatus' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success'>{` ${row.orderStatus} `}</span>
          case 'Processed':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{` ${row.orderStatus} `}</span>
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-warning'>{' awaiting '}</span>
          case 'awaiting pickup':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-secondary'>{' awaiting pickup '}</span>
          case 'on_hold':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-destructive'>{' on hold '}</span>
          case 'cancelled':
            return <span className='inline-block text-[9.75px] font-semibold rounded-[4px] uppercase p-2 bg-[color-mix(in_srgb,var(--dark)_10%,transparent)] text-dark'> {row.orderStatus} </span>
          default:
            break
        }
      },
      compact: true,
      sortable: false,
      wrap: false,
      center: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: (
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderType', asc: !sortBy.asc })}>
          Type {sortBy.key === 'orderType' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => <span className='text-[11.2px] text-[color:var(--bs-secondary-color)]'>{row.orderType}</span>,
      sortable: false,
      wrap: false,
      center: true,
    },
    {
      name: (
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Store {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => {
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
      sortable: false,
      wrap: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderDate', asc: !sortBy.asc })}>
          Order Date{' '}
          {sortBy.key === 'orderDate' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => <span className='text-[11.2px]'>{row.orderDate}</span>,
      sortable: false,
      wrap: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'closedDate', asc: !sortBy.asc })}>
          Order Closed{' '}
          {sortBy.key === 'closedDate' || sortBy.key === '' ? (
            sortBy.asc ? (
              <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
            ) : (
              <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: Shipment) => row.closedDate && <span className='text-[11.2px]'>{row.closedDate}</span>,
      sortable: false,
      wrap: true,
      grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Tracking No.</span>,
      selector: (row: Shipment) => {
        let tracking
        {
          switch (true) {
            case row.orderStatus == 'cancelled':
              tracking = <></>
              break
            case (row.orderType == 'Shipment' || row.orderType == 'Return') && row.trackingNumber != '' && !!row.trackingLink:
              tracking = (
                <div className='flex flex-row flex-nowrap items-center gap-1'>
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
                    className='text-[11.2px]'
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target='blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case (row.orderType == 'Shipment' || row.orderType == 'Return') && row.trackingNumber != '':
              tracking = (
                <div className='flex flex-row flex-nowrap items-center gap-1'>
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
                  <p className='text-[11.2px]' style={{ margin: '0px' }}>
                    {row.trackingNumber}
                  </p>
                </div>
              )
              break
            case (row.orderType == 'Wholesale' || row.orderType == 'FBA Shipment') && row.trackingNumber != '' && !!row.trackingLink && row.carrierService == 'Parcel Boxes':
              tracking = (
                <div className='flex flex-row flex-nowrap items-center gap-1'>
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
                    className='text-[11.2px]'
                    href={`${row.trackingLink}${row.trackingNumber}`}
                    target='blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
                    {row.trackingNumber}
                  </a>
                </div>
              )
              break
            case row.orderType == 'Wholesale' && row.trackingNumber != '':
              tracking = (
                <div className='flex flex-row flex-nowrap items-center gap-1'>
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
                  <p className='text-[11.2px]' style={{ margin: '0px' }}>
                    {row.trackingNumber}
                  </p>
                </div>
              )
              break
            case row.trackingNumber == '':
              tracking = <span className='text-[11.2px]'>{row.trackingNumber}</span>
              break
            default:
              tracking = <span className='text-[11.2px]'>{row.trackingNumber}</span>
          }
        }
        return tracking
      },
      sortable: false,
      wrap: true,
      grow: 1.7,
      left: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[13px]'># of Items</span>,
      selector: (row: Shipment) => row.totalItems && <span className='text-[11.2px]'>{row.totalItems}</span>,
      sortable: false,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Total Charge</span>,
      selector: (row: Shipment) => {
        let totalCharge
        {
          switch (true) {
            case row.isIndividualUnits && row.individualUnitsPlan?.state == 'Pending':
              totalCharge = 'Wating Box Plan'
              break
            default:
              totalCharge = FormatCurrency(state.currentRegion, row.totalCharge)
          }
        }
        return <span className='text-[11.2px] text-primary'>{totalCharge}</span>
      },
      sortable: false,
      wrap: true,
      center: true,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Action</span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: Shipment) => {
        switch (row.orderType) {
          case 'Shipment':
            return row.orderStatus === 'shipped' ? (
              <UncontrolledDropdown className='inline-block' direction='start'>
                <DropdownToggle className='m-0 p-0 bg-transparent border-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu end container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-dark'>View Details</span>
                  </DropdownItem>
                  {state.currentRegion == 'us' && row.orderStatus == 'shipped' && row.hasReturn == false && row.shipCountry == 'US' && (
                    <>
                      <DropdownItem header>Actions</DropdownItem>
                      <DropdownItem onClick={() => setaddNoteToShipmentModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, note: row.note ?? '' })}>
                        <div>
                          <i className='las la-clipboard label-icon align-middle me-2 text-[16.25px]' />
                          <span className='font-normal text-dark'>Shipment Note</span>
                        </div>
                      </DropdownItem>
                      <DropdownItem className='edit-item-btn' onClick={() => setModalCreateReturnInfo(row.businessId, row.id)}>
                        <i className='las la-reply label-icon align-middle text-[16.25px] me-2' />
                        Create Return
                      </DropdownItem>
                    </>
                  )}
                  {row.carrierService.toLowerCase() === 'ltl' && (
                    <>
                      <DropdownItem header>Documents</DropdownItem>
                      <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'bill_of_lading')}>
                        <i className='ri-file-text-fill align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                        <span className='text-[13px] font-normal text-dark'>Download BOL</span>
                      </DropdownItem>
                      <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'carton_labels')}>
                        <i className='ri-file-text-fill align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                        <span className='text-[13px] font-normal text-dark'>Carton Label</span>
                      </DropdownItem>
                      <DownloadPackingSlip order={row} />
                    </>
                  )}
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <UncontrolledDropdown className='inline-block' direction='start'>
                <DropdownToggle className='m-0 p-0 bg-transparent border-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu end container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-dark'>View Details</span>
                  </DropdownItem>
                  <DropdownItem header>Actions</DropdownItem>
                  <DropdownItem onClick={() => setaddNoteToShipmentModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, note: row.note ?? '' })}>
                    <div>
                      <i className='las la-clipboard label-icon align-middle me-2 text-[16.25px]' />
                      <span className='font-normal text-dark'>Shipment Note</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem header>Documents</DropdownItem>
                  {row.carrierService.toLowerCase() === 'ltl' && (
                    <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'bill_of_lading')}>
                      <i className='ri-file-text-fill align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                      <span className='text-[13px] font-normal text-dark'>Download BOL</span>
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'carton_labels')}>
                    <i className='ri-file-text-fill align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-dark'>Carton Label</span>
                  </DropdownItem>
                  <DownloadPackingSlip order={row} />
                </DropdownMenu>
              </UncontrolledDropdown>
            )
          case 'Wholesale':
            return (
              <UncontrolledDropdown className='inline-block' direction='start'>
                <DropdownToggle className='m-0 p-0 bg-transparent border-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu end container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-dark'>View Details</span>
                  </DropdownItem>
                  <DropdownItem header>Actions</DropdownItem>
                  <DropdownItem onClick={() => setaddNoteToShipmentModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, note: row.note ?? '' })}>
                    <div>
                      <i className='las la-clipboard label-icon align-middle me-2 text-[16.25px]' />
                      <span className='font-normal text-dark'>Shipment Note</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem header>Documents</DropdownItem>
                  {row.proofOfShipped != '' && row.proofOfShipped != null && (
                    <DropdownItem className='edit-item-btn'>
                      <a className='text-black' href={row.proofOfShipped} target='blank' rel='noopener noreferrer'>
                        <i className='las la-truck label-icon align-middle text-[22.75px] me-2' />
                        Proof Of Shipped
                      </a>
                    </DropdownItem>
                  )}
                  {row.labelsName != '' && (
                    <DropdownItem className='edit-item-btn'>
                      <a className='text-black' href={row.labelsName} target='blank' rel='noopener noreferrer'>
                        <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                        Shipping Labels
                      </a>
                    </DropdownItem>
                  )}
                  {row.palletLabelsName != '' && (
                    <DropdownItem className='edit-item-btn'>
                      <a className='text-black' href={row.palletLabelsName} target='blank' rel='noopener noreferrer'>
                        <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                        Pallet Labels
                      </a>
                    </DropdownItem>
                  )}
                  {row.orderStatus === 'shipped' && <DownloadPackingSlip order={row} />}
                </DropdownMenu>
              </UncontrolledDropdown>
            )
          default:
            return (
              <UncontrolledDropdown className='inline-block' direction='start'>
                <DropdownToggle className='m-0 p-0 bg-transparent border-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu end container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 text-[16.25px] text-[color:var(--bs-secondary-color)]' />
                    <span className='text-[13px] font-normal text-dark'>View Details</span>
                  </DropdownItem>
                  <DropdownItem header>Actions</DropdownItem>
                  <DropdownItem onClick={() => setaddNoteToShipmentModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, note: row.note ?? '' })}>
                    <div>
                      <i className='las la-clipboard label-icon align-middle me-2 text-[16.25px]' />
                      <span className='font-normal text-dark'>Shipment Note</span>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )
        }
      },
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={tableData} progressPending={pending} striped={true} noDataComponent={<NoShipmentsFound />} />
    </>
  )
}

export default ShipmentsTable
