/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'

import AppContext from '@context/AppContext'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipmentHisotry } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import moment from 'moment'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
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
    <Modal
      fade={false}
      size='md'
      id='InboundFBAHistoryModal'
      isOpen={inboundFBAHistoryModal.show}
      toggle={() => {
        setinboundFBAHistoryModal(() => ({
          show: false,
          sku: '',
          msku: '',
          shipments: [],
        }))
      }}>
      <ModalHeader
        toggle={() => {
          setinboundFBAHistoryModal(() => ({
            show: false,
            sku: '',
            msku: '',
            shipments: [],
          }))
        }}
        className='modal-title'
        id='myModalLabel'>
        FBA Shipment History
        <p className='fs-5 mb-0 fw-semibold text-muted'>
          SKU: <span className='text-black'>{inboundFBAHistoryModal.sku}</span>
        </p>
        <p className='fs-6 m-0 fw-semibold text-muted'>
          FBA SKU: <span className='text-black'>{inboundFBAHistoryModal.msku}</span>
        </p>
      </ModalHeader>
      <ModalBody style={{ maxHeight: '70svh', scrollbarWidth: 'thin', overflowY: 'scroll' }}>
        <Row>
          <Col md={12} className='mt-2'>
            <table className='table table-striped table-bordered table-sm text-nowrap overflow-auto'>
              <thead className='table-light'>
                <tr>
                  <th>FBA</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className='text-center'>Shipment</th>
                  <th className='text-center'>Received</th>
                </tr>
              </thead>
              <tbody className='fs-7'>
                {newShipments.map((shipment, index: number) => (
                  <tr key={index}>
                    <td className='text-start'>
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
                        <p className='text-center fs-7 m-0'>
                          <Spinner size='sm' color='primary' /> Loading more shipments...
                        </p>
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            <div className='d-flex justify-content-end align-items-center'>
              {!showMore && (
                <Button color='info' outline size='sm' className='btn-ghost-info' onClick={() => setshowMore(true)}>
                  Show More
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default InboundFBAHistoryModal
