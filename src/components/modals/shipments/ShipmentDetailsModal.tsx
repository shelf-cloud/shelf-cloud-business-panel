import { useContext } from 'react'

import FBAShipmentType from '@components/shipments/shipmentLog/FBAShipmentType'
import ReceivingType from '@components/shipments/shipmentLog/ReceivingType'
import ReturnType from '@components/shipments/shipmentLog/ReturnType'
import ServiceType from '@components/shipments/shipmentLog/ServiceType'
import ShipmentStatusBadge from '@components/shipments/shipmentLog/ShipmentStatusBadge'
import ShipmentType from '@components/shipments/shipmentLog/ShipmentType'
import WholesaleType from '@components/shipments/shipmentLog/WholesaleType'
import AppContext from '@context/AppContext'
import { Shipment, ShipmentDetialsResponse } from '@typesTs/shipments/shipments'
import axios from 'axios'
import moment from 'moment'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
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
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleCloseOffModal() }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='shipmentDetailsModal'>
        <DialogHeader className='pr-6 modal-title items-start' id='myModalLabel'>
          <DialogTitle asChild>
            <div>
              {/* <h4 className='fw-semibold mb-3'>Shipment Details</h4> */}
              <div className='w-full mt-2 flex flex-row justify-start items-start gap-4'>
                <p className='font-bold text-primary text-[22.75px] m-0'>{orderNumber}</p>
                <ShipmentStatusBadge status={status} />
              </div>
              <p className='font-normal text-[var(--bs-secondary-color)] text-[13px] m-0'>
                Type: <span className='text-black font-semibold'>{orderType}</span>
              </p>
              <p className='font-normal mb-2 text-[var(--bs-secondary-color)] text-[13px] m-0'>
                Order Date: <span className='text-black font-semibold'>{moment.utc(orderDate).format('LL')}</span>
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className='pt-2' style={{ backgroundColor: '#F0F4F7' }}>
          {!isValidating && data?.shipment ? (
            SelectShipmentType(orderType, data.shipment, showActions, mutateShipment, mutateShipments)
          ) : (
            <div className='w-full flex justify-center items-center' style={{ height: '60dvh' }}>
              <p className='text-[16.25px] text-primary flex justify-center items-center gap-4'>
                <Spinner className='size-6 text-primary' />
                Loading Shipment....
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShipmentDetailsModal
