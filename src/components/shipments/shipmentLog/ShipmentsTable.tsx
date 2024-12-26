/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import DownloadPackingSlip from '../wholesale/DownloadPackingSlip'
import { Shipment } from '@typesTs/shipments/shipments'
import { NoImageAdress } from '@lib/assetsConstants'
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
}

const ShipmentsTable = ({ tableData, pending, sortBy, setSortBy, handleGetShipmentBOL }: Props) => {
  const { state, setModalCreateReturnInfo, setShipmentDetailsModal }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Order Number</span>,
      selector: (row: Shipment) => {
        return (
          <>
            <div className='fs-7' style={{ margin: '0px', fontWeight: '600' }}>
              {row.orderNumber}
            </div>
            {row.poNumber && row.poNumber !== row.orderNumber && (
              <span className='m-0 fs-7 text-muted' style={{ opacity: '80%' }}>
                PO: {row.poNumber}
              </span>
            )}
            {row.hasReturn && (
              <span className='text-danger' style={{ opacity: '80%' }}>
                Return: {row.returns[0]}
                {row.returns.length > 1 && <span className='fs-7 text-danger'>{` +${row.returns.length - 1}`}</span>}
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
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderStatus', asc: !sortBy.asc })}>
          Status {sortBy.key === 'orderStatus' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='badge text-uppercase badge-soft-success p-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Processed':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${row.orderStatus} `}</span>
            break
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{' awaiting '}</span>
            break
          case 'awaiting pickup':
            return <span className='badge text-uppercase badge-soft-secondary p-2'>{' awaiting pickup '}</span>
            break
          case 'on_hold':
            return <span className='badge text-uppercase badge-soft-danger p-2'>{' on hold '}</span>
            break
          case 'cancelled':
            return <span className='badge text-uppercase badge-soft-dark p-2'> {row.orderStatus} </span>
            break
          default:
            break
        }
      },
      compact: true,
      sortable: false,
      wrap: false,
      center: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderType', asc: !sortBy.asc })}>
          Type {sortBy.key === 'orderType' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => <span className='fs-7 text-muted'>{row.orderType}</span>,
      sortable: false,
      wrap: false,
      center: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Store {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
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
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderDate', asc: !sortBy.asc })}>
          Order Date{' '}
          {sortBy.key === 'orderDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Shipment) => <span className='fs-7'>{row.orderDate}</span>,
      sortable: false,
      wrap: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'closedDate', asc: !sortBy.asc })}>
          Order Closed{' '}
          {sortBy.key === 'closedDate' || sortBy.key === '' ? (
            sortBy.asc ? (
              <i className='ri-arrow-up-fill fs-7 text-primary' />
            ) : (
              <i className='ri-arrow-down-fill fs-7 text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: Shipment) => row.closedDate && <span className='fs-7'>{row.closedDate}</span>,
      sortable: false,
      wrap: true,
      grow: 1.2,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Tracking No.</span>,
      selector: (row: Shipment) => {
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
                  <a className='fs-7' href={`${row.trackingLink}${row.trackingNumber}`} target='blank' style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
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
                  <p className='fs-7' style={{ margin: '0px' }}>
                    {row.trackingNumber}
                  </p>
                </div>
              )
              break
            case (row.orderType == 'Wholesale' || row.orderType == 'FBA Shipment') && row.trackingNumber != '' && !!row.trackingLink && row.carrierService == 'Parcel Boxes':
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
                  <a className='fs-7' href={`${row.trackingLink}${row.trackingNumber}`} target='blank' style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
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
                  <p className='fs-7' style={{ margin: '0px' }}>
                    {row.trackingNumber}
                  </p>
                </div>
              )
              break
            case row.trackingNumber == '':
              tracking = <span className='fs-7'>{row.trackingNumber}</span>
              break
            default:
              tracking = <span className='fs-7'>{row.trackingNumber}</span>
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
      name: <span className='fw-bold fs-6'># of Items</span>,
      selector: (row: Shipment) => row.totalItems && <span className='fs-7'>{row.totalItems}</span>,
      sortable: false,
      wrap: true,
      // grow: 1.5,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Total Charge</span>,
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
        return <span className='fs-7 text-primary'>{totalCharge}</span>
      },
      sortable: false,
      wrap: true,
      center: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Action</span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: Shipment) => {
        switch (row.orderType) {
          case 'Shipment':
            return row.orderStatus === 'shipped' ? (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-ghost btn-sm m-0 p-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 fs-5 text-muted' />
                    <span className='fs-6 fw-normal text-dark'>View Details</span>
                  </DropdownItem>
                  {state.currentRegion == 'us' && row.orderStatus == 'shipped' && row.hasReturn == false && row.shipCountry == 'US' && (
                    <>
                      <DropdownItem header>Actions</DropdownItem>
                      <DropdownItem className='edit-item-btn' onClick={() => setModalCreateReturnInfo(row.businessId, row.id)}>
                        <i className='las la-reply label-icon align-middle fs-5 me-2' />
                        Create Return
                      </DropdownItem>
                    </>
                  )}
                  {row.carrierService.toLowerCase() === 'ltl' && (
                    <>
                      <DropdownItem header>Documents</DropdownItem>
                      <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'bill_of_lading')}>
                        <i className='ri-file-text-fill align-middle me-2 fs-5 text-muted' />
                        <span className='fs-6 fw-normal text-dark'>Download BOL</span>
                      </DropdownItem>
                      <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'carton_labels')}>
                        <i className='ri-file-text-fill align-middle me-2 fs-5 text-muted' />
                        <span className='fs-6 fw-normal text-dark'>Carton Label</span>
                      </DropdownItem>
                      <DownloadPackingSlip order={row} />
                    </>
                  )}
                </DropdownMenu>
              </UncontrolledDropdown>
            ) : (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-ghost btn-sm m-0 p-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 fs-5 text-muted' />
                    <span className='fs-6 fw-normal text-dark'>View Details</span>
                  </DropdownItem>
                  <DropdownItem header>Documents</DropdownItem>
                  {row.carrierService.toLowerCase() === 'ltl' && (
                    <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'bill_of_lading')}>
                      <i className='ri-file-text-fill align-middle me-2 fs-5 text-muted' />
                      <span className='fs-6 fw-normal text-dark'>Download BOL</span>
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => handleGetShipmentBOL(row.orderNumber, row.orderId, 'carton_labels')}>
                    <i className='ri-file-text-fill align-middle me-2 fs-5 text-muted' />
                    <span className='fs-6 fw-normal text-dark'>Carton Label</span>
                  </DropdownItem>
                  <DownloadPackingSlip order={row} />
                </DropdownMenu>
              </UncontrolledDropdown>
            )
            break
          case 'Wholesale':
            return (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-ghost btn-sm m-0 p-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 fs-5 text-muted' />
                    <span className='fs-6 fw-normal text-dark'>View Details</span>
                  </DropdownItem>
                  <DropdownItem header>Documents</DropdownItem>
                  {row.proofOfShipped != '' && row.proofOfShipped != null && (
                    <DropdownItem className='edit-item-btn'>
                      <a className='text-black' href={row.proofOfShipped} target='blank'>
                        <i className='las la-truck label-icon align-middle fs-3 me-2' />
                        Proof Of Shipped
                      </a>
                    </DropdownItem>
                  )}
                  {row.labelsName != '' && (
                    <DropdownItem className='edit-item-btn'>
                      <a
                        className='text-black'
                        href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${row.labelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                        target='blank'>
                        <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                        FBA Labels
                      </a>
                    </DropdownItem>
                  )}
                  {row.palletLabelsName != '' && (
                    <DropdownItem className='edit-item-btn'>
                      <a
                        className='text-black'
                        href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${row.palletLabelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                        target='blank'>
                        <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                        Pallet Labels
                      </a>
                    </DropdownItem>
                  )}
                  {row.orderStatus === 'shipped' && <DownloadPackingSlip order={row} />}
                </DropdownMenu>
              </UncontrolledDropdown>
            )
            break
          default:
            return (
              <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
                <DropdownToggle className='btn btn-ghost btn-sm m-0 p-0' tag='button'>
                  <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
                </DropdownToggle>
                <DropdownMenu className='dropdown-menu-end' container={'body'}>
                  <DropdownItem onClick={() => setShipmentDetailsModal(true, row.id, row.orderNumber, row.orderType, row.orderStatus, row.orderDate, true)}>
                    <i className='ri-article-line align-middle me-2 fs-5 text-muted' />
                    <span className='fs-6 fw-normal text-dark'>View Details</span>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )
            break
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
