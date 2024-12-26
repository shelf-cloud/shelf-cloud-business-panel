import FBAShipmentType from '@components/shipments/shipmentLog/FBAShipmentType'
import ReceivingType from '@components/shipments/shipmentLog/ReceivingType'
import ReturnType from '@components/shipments/shipmentLog/ReturnType'
import ServiceType from '@components/shipments/shipmentLog/ServiceType'
import ShipmentStatusBadge from '@components/shipments/shipmentLog/ShipmentStatusBadge'
import ShipmentType from '@components/shipments/shipmentLog/ShipmentType'
import StorageType from '@components/shipments/shipmentLog/StorageType'
import WholesaleType from '@components/shipments/shipmentLog/WholesaleType'
import AppContext from '@context/AppContext'
import { Shipment, ShipmentDetialsResponse } from '@typesTs/shipments/shipments'
import axios from 'axios'
import moment from 'moment'
import React, { useContext } from 'react'
import { Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
import useSWR from 'swr'

type Props = {
  mutateShipments?: () => void
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const SelectShipmentType = (orderType: string, data: Shipment, showActions: boolean, mutateShipment?: () => void, mutateShipments?: () => void) => {
  switch (orderType) {
    case 'Shipment':
      return <ShipmentType data={data} showActions={showActions} mutateShipments={mutateShipments} />
    case 'Wholesale':
      return <WholesaleType data={data} showActions={showActions} mutateShipment={mutateShipment} />
    case 'FBA Shipment':
      return <FBAShipmentType data={data} />
    case 'Receiving':
      return <ReceivingType data={data} />
    case 'Storage':
      return <StorageType />
    case 'Adjustment':
    case 'Service':
      return <ServiceType data={data} />
    case 'Return':
      return <ReturnType data={data} showActions={showActions} mutateShipments={mutateShipments} />
    // case 'Subscription':
    //   return <SubscriptionType data={data} />
    //   break
    default:
      return <ShipmentType data={data} showActions={false} />
  }
}

const ShipmentDetailsModal = ({ mutateShipments }: Props) => {
  const { state, setShipmentDetailsModal }: any = useContext(AppContext)
  const { show, orderNumber, orderId, orderType, status, orderDate, showActions }: any = state.shipmentDetailModal
  const handleCloseOffModal = () => {
    setShipmentDetailsModal(false, 0, '', '', '', '', false)
  }

  const {
    data,
    isValidating,
    mutate: mutateShipment,
  } = useSWR<ShipmentDetialsResponse>(
    orderId && state.user.businessId ? `/api/shipments/getShipmentDetails?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${orderId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
    }
  )

  return (
    <Modal fade={false} size='xl' id='shipmentDetailsModal' isOpen={show} toggle={handleCloseOffModal}>
      <ModalHeader toggle={handleCloseOffModal} className='modal-title align-items-start' id='myModalLabel'>
        {/* <h4 className='fw-semibold mb-3'>Shipment Details</h4> */}
        <div className='w-100 mt-2 d-flex flex-row justify-content-start align-items-start gap-3'>
          <p className='fw-bold text-primary fs-3 m-0'>{orderNumber}</p>
          <ShipmentStatusBadge status={status} />
        </div>
        <p className='fw-normal text-muted fs-6 m-0'>
          Type: <span className='text-dark fw-semibold'>{orderType}</span>
        </p>
        <p className='fw-normal mb-2 text-muted fs-6 m-0'>
          Order Date: <span className='text-dark fw-semibold'>{moment.utc(orderDate).local().format('LL')}</span>
        </p>
      </ModalHeader>
      <ModalBody className='pt-2' style={{ backgroundColor: '#F0F4F7' }}>
        {!isValidating && data?.shipment ? (
          SelectShipmentType(orderType, data.shipment, showActions, mutateShipment, mutateShipments)
        ) : (
          <div className='w-100 d-flex justify-content-center align-items-center' style={{ height: '60dvh' }}>
            <p className='fs-5 text-primary d-flex justify-content-center align-items-center gap-3'>
              <Spinner color='primary' size={'md'} />
              Loading Shipment....
            </p>
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}

export default ShipmentDetailsModal
