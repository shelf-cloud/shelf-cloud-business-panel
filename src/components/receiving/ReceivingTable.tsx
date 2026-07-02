 
import { useContext } from 'react'

import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { AddShippingCostModalType, AddTagToOrderType, DeleteReceivingModalType, EditReceivingType, MarkReceivedModalType } from '@pages/receivings'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import DataTable from '@components/Common/DataTableSC'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from '@/components/migration-ui'

import ShipmentExpandedDetail from '../ShipmentExpandedDetail'
import GenerateReceivingLabels from './GenerateReceivingLabels'
import ReceivingPackingSlip from './packing_slip/ReceivingPackingSlip'

type Props = {
  tableData: OrderRowType[]
  pending: boolean
  mutateReceivings: () => void
  setshowDeleteModal: (prev: DeleteReceivingModalType) => void
  setaddShippingCostModal: (prev: AddShippingCostModalType) => void
  setaddTagToOrder: (prev: AddTagToOrderType) => void
  setmarkReceivedModal: (prev: MarkReceivedModalType) => void
  seteditReceiving: (prev: EditReceivingType) => void
}

const ReceivingTable = ({ tableData, pending, mutateReceivings, setshowDeleteModal, setaddShippingCostModal, setaddTagToOrder, setmarkReceivedModal, seteditReceiving }: Props) => {
  const { state } = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Receiving</span>,
      selector: (row: OrderRowType) => (
        <div>
          <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>{row.orderNumber}</p>
          {row.tag ? (
            <small className='tw:m-0 tw:text-[11.2px] tw:font-light tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:items-center tw:gap-1' id={`receivingTag-${row.id}`}>
              <i className='las la-tag label-icon align-middle fs-6' />
              <span className='tw:text-primary tw:text-[11.2px]'>{row.tag}</span>
            </small>
          ) : null}
        </div>
      ),
      sortable: true,
      wrap: true,
      grow: 2,
      left: true,
      compact: true,
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.orderNumber, rowB.orderNumber),
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Created In</span>,
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
      name: <span className='tw:font-extrabold tw:text-center tw:text-[13px]'>Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='tw:inline-block tw:rounded tw:text-[9.75px] tw:font-bold tw:uppercase tw:p-2 tw:bg-[color-mix(in_srgb,var(--success)_10%,transparent)] tw:text-success'> {row.orderStatus} </span>
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='tw:inline-block tw:rounded tw:text-[9.75px] tw:font-bold tw:uppercase tw:p-2 tw:bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] tw:text-[var(--bs-secondary-color)]'>{' awaiting '}</span>
          case 'on_hold':
            return <span className='tw:inline-block tw:rounded tw:text-[9.75px] tw:font-bold tw:uppercase tw:p-2 tw:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] tw:text-warning'>{' on hold '}</span>
          case 'cancelled':
            return <span className='tw:inline-block tw:rounded tw:text-[9.75px] tw:font-bold tw:uppercase tw:p-2 tw:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] tw:text-destructive'> {row.orderStatus} </span>
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
      name: <span className='tw:font-extrabold tw:text-[13px]'>Destination</span>,
      selector: (row: OrderRowType) => {
        return (
          <div>
            <p className='tw:m-0'>{row.warehouseName}</p>
            {row.receivingShippingCost && (
              <>
                <small className='tw:m-0 tw:font-light tw:text-[var(--bs-secondary-color)]' id={`receivingShippingCost-${row.id}`}>
                  Shipping: <span className='tw:text-primary'>{FormatCurrency(state.currentRegion, row.receivingShippingCost)}</span>
                </small>
                <SCTooltip target={`receivingShippingCost-${row.id}`} placement='right' key={`receivingShippingCost-${row.id}`}>
                  <p className='tw:text-[11.2px] tw:text-primary tw:m-0 tw:p-0'>{`Shipping cost from Seller's warehouse to ${row.warehouseName}.`}</p>
                </SCTooltip>
              </>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      left: true,
      grow: 1.7,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
      sortFunction: (rowA: OrderRowType, rowB: OrderRowType) => sortStringsLocaleCompare(rowA.warehouseName, rowB.warehouseName),
    },
    {
      name: <span className='tw:font-extrabold tw:text-center tw:text-[13px]'>Date Created</span>,
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
      name: <span className='tw:font-extrabold tw:text-center tw:text-[13px]'>Date Closed</span>,
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
      name: <span className='tw:font-extrabold tw:text-[13px]'># of Items</span>,
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
      name: <span className='tw:font-extrabold tw:text-[13px] tw:text-end'>Total Charge</span>,
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
      name: <span className='tw:font-bold tw:text-[13px]'></span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: OrderRowType) => {
        return (
          <UncontrolledDropdown className='tw:inline-block' direction='start'>
            <DropdownToggle
              className='tw:inline-flex tw:items-center tw:justify-center tw:rounded tw:bg-[color:var(--vz-light)] tw:m-0 tw:p-0'
              style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }}
              tag='button'>
              <i className='mdi mdi-dots-vertical align-middle fs-4 tw:m-0 tw:px-1 tw:py-0' style={{ color: '#919FAF' }} />
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end tw:text-[11.2px]' container={'body'}>
              <DropdownItem onClick={() => setaddShippingCostModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, shippingCost: row.receivingShippingCost ?? '' })}>
                <div>
                  <i className='las la-ship label-icon align-middle tw:me-2 fs-5' />
                  <span className='tw:font-normal tw:text-black'>Shipping Cost</span>
                </div>
              </DropdownItem>
              <DropdownItem onClick={() => setaddTagToOrder({ show: true, orderId: row.id, orderNumber: row.orderNumber, tag: row.tag ?? '' })}>
                <div>
                  <i className='las la-tag label-icon align-middle tw:me-2 fs-5' />
                  <span className='tw:font-normal tw:text-black'>Add Tag</span>
                </div>
              </DropdownItem>
              {row.boxes ? <ReceivingPackingSlip receiving={row} /> : null}
              {!row.isReceivingFromPo && row.orderStatus !== 'received' && (
                <DropdownItem>
                  <a href={row.proofOfShipped || '#'} target='blank' rel='noopener noreferrer' className='tw:!text-black'>
                    <i className='las la-truck label-icon align-middle fs-5 tw:me-2' />
                    <span className='tw:font-normal tw:text-black'>Proof Of Received</span>
                  </a>
                </DropdownItem>
              )}
              {row.boxes && (
                <>
                  <DropdownItem header>Labels</DropdownItem>
                  <GenerateReceivingLabels
                    finalBoxesConfiguration={row.boxes}
                    orderBarcode={row.isShipjoyCreated && row.id3PL ? row.id3PL : row.orderNumber}
                    fileName={row.orderNumber}
                    warehouseId={row.warehouseId}
                    isManualReceiving={!row.isReceivingFromPo}>
                    <DropdownItem>
                      <i className='las la-toilet-paper label-icon align-middle tw:me-2 fs-5 tw:text-[var(--bs-secondary-color)]' />
                      <span className='tw:font-normal tw:text-black'>Receiving Labels</span>
                    </DropdownItem>
                  </GenerateReceivingLabels>
                </>
              )}
              <DropdownItem header>Actions</DropdownItem>
              {row.boxes && (
                <DropdownItem onClick={() => seteditReceiving({ show: true, order: row })}>
                  <i className='las la-edit tw:text-primary label-icon align-middle tw:me-2 fs-5' />
                  <span className='tw:font-normal tw:text-black'>Edit Receiving</span>
                </DropdownItem>
              )}
              {!row.isSCDestination && row.orderStatus !== 'received' && (
                <DropdownItem onClick={() => setmarkReceivedModal({ show: true, orderId: row.id, orderNumber: row.orderNumber })}>
                  <i className='las la-check-circle tw:text-success label-icon align-middle tw:me-2 fs-5' />
                  <span className='tw:font-normal tw:text-black'>Mark as Received</span>
                </DropdownItem>
              )}
              {(row.orderStatus == 'awaiting' || row.orderStatus == 'awaiting_shipment') &&
                row.orderItems.reduce((totalReceived, item: ShipmentOrderItem) => totalReceived + item.qtyReceived!, 0) <= 0 && (
                  <>
                    <DropdownItem header className='tw:text-destructive'>
                      Danger Zone
                    </DropdownItem>
                    <DropdownItem
                      onClick={() =>
                        setshowDeleteModal({
                          show: true,
                          orderId: row.id,
                          orderNumber: row.orderNumber,
                        })
                      }>
                      <i className='las la-trash-alt tw:text-destructive label-icon align-middle fs-5 tw:me-2' />
                      <span className='tw:font-normal tw:text-destructive'>Delete Receiving</span>
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
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        expandableRows
        expandableRowsComponent={ShipmentExpandedDetail}
        expandableRowsComponentProps={{ mutateReceivings: mutateReceivings }}
        striped={true}
      />
    </>
  )
}

export default ReceivingTable
