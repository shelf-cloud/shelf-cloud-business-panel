 
import { useContext } from 'react'

import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { AddShippingCostModalType, AddTagToOrderType, DeleteReceivingModalType, EditReceivingType, MarkReceivedModalType } from '@pages/receivings'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import DataTable from '@components/Common/DataTableSC'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

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
      name: <span className='font-extrabold text-[13px]'>Receiving</span>,
      selector: (row: OrderRowType) => (
        <div>
          <p className='m-0 p-0 font-semibold text-[11.2px]'>{row.orderNumber}</p>
          {row.tag ? (
            <small className='m-0 text-[11.2px] font-light text-[var(--bs-secondary-color)] flex flex-row items-center gap-1' id={`receivingTag-${row.id}`}>
              <i className='las la-tag label-icon align-middle text-[13px]' />
              <span className='text-primary text-[11.2px]'>{row.tag}</span>
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
      name: <span className='font-extrabold text-[13px]'>Created In</span>,
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
      name: <span className='font-extrabold text-center text-[13px]'>Status</span>,
      selector: (row: OrderRowType) => {
        switch (row.orderStatus) {
          case 'shipped':
          case 'received':
            return <span className='inline-block rounded text-[9.75px] font-bold uppercase p-2 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-success'> {row.orderStatus} </span>
          case 'awaiting_shipment':
          case 'awaiting':
            return <span className='inline-block rounded text-[9.75px] font-bold uppercase p-2 bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] text-[var(--bs-secondary-color)]'>{' awaiting '}</span>
          case 'on_hold':
            return <span className='inline-block rounded text-[9.75px] font-bold uppercase p-2 bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-warning'>{' on hold '}</span>
          case 'cancelled':
            return <span className='inline-block rounded text-[9.75px] font-bold uppercase p-2 bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-destructive'> {row.orderStatus} </span>
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
      name: <span className='font-extrabold text-[13px]'>Destination</span>,
      selector: (row: OrderRowType) => {
        return (
          <div>
            <p className='m-0'>{row.warehouseName}</p>
            {row.receivingShippingCost && (
              <>
                <small className='m-0 font-light text-[var(--bs-secondary-color)]' id={`receivingShippingCost-${row.id}`}>
                  Shipping: <span className='text-primary'>{FormatCurrency(state.currentRegion, row.receivingShippingCost)}</span>
                </small>
                <SCTooltip target={`receivingShippingCost-${row.id}`} placement='right' key={`receivingShippingCost-${row.id}`}>
                  <p className='text-[11.2px] text-primary m-0 p-0'>{`Shipping cost from Seller's warehouse to ${row.warehouseName}.`}</p>
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
      name: <span className='font-extrabold text-center text-[13px]'>Date Created</span>,
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
      name: <span className='font-extrabold text-center text-[13px]'>Date Closed</span>,
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
      name: <span className='font-extrabold text-[13px]'># of Items</span>,
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
      name: <span className='font-extrabold text-[13px] text-end'>Total Charge</span>,
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
      name: <span className='font-bold text-[13px]'></span>,
      sortable: false,
      compact: true,
      center: true,
      cell: (row: OrderRowType) => {
        return (
          <DropdownMenu>
            <div className='inline-block'>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='inline-flex items-center justify-center rounded bg-[color:var(--vz-light)] m-0 p-0'
                  style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }}>
                  <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-1 py-0' style={{ color: '#919FAF' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='text-[11.2px]'>
                <DropdownMenuItem onClick={() => setaddShippingCostModal({ show: true, orderId: row.id, orderNumber: row.orderNumber, shippingCost: row.receivingShippingCost ?? '' })}>
                  <div>
                    <i className='las la-ship label-icon align-middle me-2 text-[16.25px]' />
                    <span className='font-normal text-black'>Shipping Cost</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setaddTagToOrder({ show: true, orderId: row.id, orderNumber: row.orderNumber, tag: row.tag ?? '' })}>
                  <div>
                    <i className='las la-tag label-icon align-middle me-2 text-[16.25px]' />
                    <span className='font-normal text-black'>Add Tag</span>
                  </div>
                </DropdownMenuItem>
                {row.boxes ? <ReceivingPackingSlip receiving={row} /> : null}
                {!row.isReceivingFromPo && row.orderStatus !== 'received' && (
                  <DropdownMenuItem>
                    <a href={row.proofOfShipped || '#'} target='blank' rel='noopener noreferrer' className='!text-black'>
                      <i className='las la-truck label-icon align-middle text-[16.25px] me-2' />
                      <span className='font-normal text-black'>Proof Of Received</span>
                    </a>
                  </DropdownMenuItem>
                )}
                {row.boxes && (
                  <>
                    <DropdownMenuLabel>Labels</DropdownMenuLabel>
                    <GenerateReceivingLabels
                      finalBoxesConfiguration={row.boxes}
                      orderBarcode={row.isShipjoyCreated && row.id3PL ? row.id3PL : row.orderNumber}
                      fileName={row.orderNumber}
                      warehouseId={row.warehouseId}
                      isManualReceiving={!row.isReceivingFromPo}>
                      <DropdownMenuItem>
                        <i className='las la-toilet-paper label-icon align-middle me-2 text-[16.25px] text-[var(--bs-secondary-color)]' />
                        <span className='font-normal text-black'>Receiving Labels</span>
                      </DropdownMenuItem>
                    </GenerateReceivingLabels>
                  </>
                )}
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {row.boxes && (
                  <DropdownMenuItem onClick={() => seteditReceiving({ show: true, order: row })}>
                    <i className='las la-edit text-primary label-icon align-middle me-2 text-[16.25px]' />
                    <span className='font-normal text-black'>Edit Receiving</span>
                  </DropdownMenuItem>
                )}
                {!row.isSCDestination && row.orderStatus !== 'received' && (
                  <DropdownMenuItem onClick={() => setmarkReceivedModal({ show: true, orderId: row.id, orderNumber: row.orderNumber })}>
                    <i className='las la-check-circle text-success label-icon align-middle me-2 text-[16.25px]' />
                    <span className='font-normal text-black'>Mark as Received</span>
                  </DropdownMenuItem>
                )}
                {(row.orderStatus == 'awaiting' || row.orderStatus == 'awaiting_shipment') &&
                  row.orderItems.reduce((totalReceived, item: ShipmentOrderItem) => totalReceived + item.qtyReceived!, 0) <= 0 && (
                    <>
                      <DropdownMenuLabel className='text-destructive'>Danger Zone</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          setshowDeleteModal({
                            show: true,
                            orderId: row.id,
                            orderNumber: row.orderNumber,
                          })
                        }>
                        <i className='las la-trash-alt text-destructive label-icon align-middle text-[16.25px] me-2' />
                        <span className='font-normal text-destructive'>Delete Receiving</span>
                      </DropdownMenuItem>
                    </>
                  )}
              </DropdownMenuContent>
            </div>
          </DropdownMenu>
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
