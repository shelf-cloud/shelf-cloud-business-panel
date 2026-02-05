import React, { useContext } from 'react'

import StorageType from '@components/shipments/shipmentLog/StorageType'
import AppContext from '@context/AppContext'
import { StorageDetialsResponse, StorageProduct } from '@typesTs/storage/storage'
import axios from 'axios'
import moment from 'moment'
import { Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
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
    <Modal fade={false} size='xl' id='shipmentDetailsModal' isOpen={show} toggle={handleCloseOffModal}>
      <ModalHeader toggle={handleCloseOffModal} className='modal-title align-items-start' id='myModalLabel'>
        {/* <h4 className='fw-semibold mb-3'>Shipment Details</h4> */}
        <div className='w-100 mt-2 d-flex flex-row justify-content-start align-items-start gap-3'>
          <p className='fw-bold text-primary fs-3 m-0'>Order: {orderNumber}</p>
        </div>
        <p className='fw-normal text-muted fs-6 m-0'>
          Type: <span className='text-dark fw-semibold'>{orderType}</span>
        </p>
        <p className='fw-normal mb-2 text-muted fs-6 m-0'>
          Storage Between: <span className='text-dark fw-semibold'>{`${moment(startDate).format('LL')} - ${moment(endDate).format('LL')}`}</span>
        </p>
      </ModalHeader>
      <ModalBody className='pt-2' style={{ backgroundColor: '#F0F4F7' }}>
        {!isValidating && data?.products ? (
          SelectShipmentType(orderType, data.products, totalCharge)
        ) : (
          <div className='w-100 d-flex justify-content-center align-items-center' style={{ height: '60dvh' }}>
            <p className='fs-5 text-primary d-flex justify-content-center align-items-center gap-3'>
              <Spinner color='primary' size={'md'} />
              Loading Storage Fees....
            </p>
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}

export default StorageFeesDetailsModal
