 
import Link from 'next/link'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'

import AppContext from '@context/AppContext'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipmentHisotry } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import moment from 'moment'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import useSWRInfinite from 'swr/infinite'

type ModalInfo = {
  show: boolean
  sku: string
  msku: string
  shipments: FBAShipmentHisotry[]
}
type Props = {
  inboundFBAHistoryModal: ModalInfo
  setinboundFBAHistoryModal: (cb: (prev: ModalInfo) => any) => void
}

const ITEMS_PER_PAGE = 20
const fetcher = async (url: string) => {
  const data = await axios.get<FBAShipmentHisotry[]>(url).then((res) => res.data)
  return data
}

const InboundFBAHistoryModal = ({ inboundFBAHistoryModal, setinboundFBAHistoryModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [showMore, setshowMore] = useState(false)

  const getKey = (pageIndex: number, previousPageData: FBAShipmentHisotry[]) => {
    if (!state.currentRegion || !state.user.businessId) return null // No region or business
    if (!showMore) return null
    if (previousPageData && !previousPageData.length) return null // No more data to fetch

    let url = `/api/amazon/shipments/getSkuFBAShipments?region=${state.currentRegion}&businessId=${state.user.businessId}&msku=${inboundFBAHistoryModal.msku}&offset=${pageIndex * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`
    return url
  }

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false, // Prevent re-fetching of the first page when setting a new size
    revalidateOnFocus: false, // Prevent re-fetching on window focus
  })

  // Flatten shipment data
  const newShipments: FBAShipmentHisotry[] = useMemo(
    () => (data ? inboundFBAHistoryModal.shipments.concat(...data) : inboundFBAHistoryModal.shipments),
    [data, inboundFBAHistoryModal.shipments]
  )

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null)
  const lastInvoiceElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isValidating) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && data && data[data.length - 1].length === ITEMS_PER_PAGE) {
          setSize(size + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [isValidating, setSize, data, size]
  )

  return (
    <Dialog
      open={!!inboundFBAHistoryModal.show}
      onOpenChange={(open) => {
        if (!open)
          setinboundFBAHistoryModal(() => ({
            show: false,
            sku: '',
            msku: '',
            shipments: [],
          }))
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='InboundFBAHistoryModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle className='modal-title'>
            FBA Shipment History
            <p className='text-[16.25px] mb-0 font-semibold text-[var(--bs-secondary-color)]'>
              SKU: <span className='text-black'>{inboundFBAHistoryModal.sku}</span>
            </p>
            <p className='text-[13px] m-0 font-semibold text-[var(--bs-secondary-color)]'>
              FBA SKU: <span className='text-black'>{inboundFBAHistoryModal.msku}</span>
            </p>
          </DialogTitle>
        </DialogHeader>
        <div style={{ maxHeight: '70svh', scrollbarWidth: 'thin', overflowY: 'scroll' }}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 md:w-full mt-2'>
            <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 border border-[color:var(--border)] [&_td]:border-t [&_td]:border-[color:var(--border)] [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] text-nowrap'>
                <thead className='bg-[color:var(--vz-light)]'>
                  <tr>
                    <th>FBA</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className='text-center'>Shipment</th>
                    <th className='text-center'>Received</th>
                  </tr>
                </thead>
                <tbody className='text-[11.2px]'>
                  {newShipments.map((shipment, index: number) => (
                    <tr key={index}>
                      <td className='text-left'>
                        <Link href={`/amazon-sellers/shipments/${shipment.id}`} target='blank' rel='noopener noreferrer'>
                          {shipment.shipmentId}
                        </Link>
                      </td>
                      <td>{moment.utc(shipment.createdAt).local().format('MM/DD/YYYY')}</td>
                      <td>{CleanStatus(shipment.status)}</td>
                      <td className='text-center'>{shipment.shipmentQty}</td>
                      <td className='text-center'>{shipment.receivedQty}</td>
                    </tr>
                  ))}
                </tbody>
                {showMore && (
                  <tfoot>
                    <tr ref={lastInvoiceElementRef}>
                      <td colSpan={5}>
                        {isValidating && (
                          <p className='text-center text-[11.2px] m-0'>
                            <Spinner className='text-primary' /> Loading more shipments...
                          </p>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className='flex justify-end items-center'>
              {!showMore && (
                <Button variant='info' outline size='sm' className='btn-ghost-info' onClick={() => setshowMore(true)}>
                  Show More
                </Button>
              )}
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InboundFBAHistoryModal
