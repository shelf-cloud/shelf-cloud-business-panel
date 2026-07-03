import { useContext } from 'react'

import StorageType from '@components/shipments/shipmentLog/StorageType'
import AppContext from '@context/AppContext'
import { StorageDetialsResponse, StorageProduct } from '@typesTs/storage/storage'
import axios from 'axios'
import moment from 'moment'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR from 'swr'

type Props = {}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const SelectShipmentType = (orderType: string, data: { [inventoryId: string]: StorageProduct }, totalCharge: number) => {
  switch (orderType) {
    case 'Storage':
      return <StorageType data={data} totalCharge={totalCharge} />
    default:
      ;<StorageType data={data} totalCharge={totalCharge} />
  }
}

const StorageFeesDetailsModal = ({}: Props) => {
  const { state, setStorageFeesDetailsModal }: any = useContext(AppContext)
  const { show, orderNumber, totalCharge, orderType, startDate, endDate }: any = state.storageFeesDetailModal
  const handleCloseOffModal = () => {
    setStorageFeesDetailsModal(false, '', 0, '', '', '')
  }

  const { data, isValidating } = useSWR<StorageDetialsResponse>(
    startDate && endDate && state.user.businessId
      ? `/api/storage/getInvoicedStorageDetails?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
    }
  )

  return (
    <Dialog
      open={!!show}
      onOpenChange={(open) => {
        if (!open) handleCloseOffModal()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='shipmentDetailsModal'>
        <DialogHeader className='pr-6 modal-title items-start' id='myModalLabel'>
          <DialogTitle asChild>
            <div>
              {/* <h4 className='fw-semibold mb-3'>Shipment Details</h4> */}
              <div className='w-full mt-2 flex flex-row justify-start items-start gap-4'>
                <p className='font-bold text-primary text-[22.75px] m-0'>Order: {orderNumber}</p>
              </div>
              <p className='font-normal text-[var(--bs-secondary-color)] text-[13px] m-0'>
                Type: <span className='text-black font-semibold'>{orderType}</span>
              </p>
              <p className='font-normal mb-2 text-[var(--bs-secondary-color)] text-[13px] m-0'>
                Storage Between: <span className='text-black font-semibold'>{`${moment(startDate).format('LL')} - ${moment(endDate).format('LL')}`}</span>
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className='pt-2' style={{ backgroundColor: '#F0F4F7' }}>
          {!isValidating && data?.products ? (
            SelectShipmentType(orderType, data.products, totalCharge)
          ) : (
            <div className='w-full flex justify-center items-center' style={{ height: '60dvh' }}>
              <p className='text-[16.25px] text-primary flex justify-center items-center gap-4'>
                <Spinner className='size-6 text-primary' />
                Loading Storage Fees....
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StorageFeesDetailsModal
