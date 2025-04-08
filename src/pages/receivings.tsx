/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Card, CardBody, Container } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import moment from 'moment'
import ReceivingTable from '@components/receiving/ReceivingTable'
import FilterByDates from '@components/FilterByDates'
import { useReceivings } from '@hooks/receivings/useReceivings'
import SearchInput from '@components/ui/SearchInput'
import Confirm_Delete_Receiving from '@components/modals/receivings/Confirm_Delete_Receiving'
import InputNumberModal from '@components/modals/shared/inputNumberModal'
import axios from 'axios'
import { toast } from 'react-toastify'
import AppContext from '@context/AppContext'
import ConfirmActionModal from '@components/modals/shared/ConfirmActionModal'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      businessName: string
    }
  }
}

export type DeleteReceivingModalType = {
  show: boolean
  orderId: number
  orderNumber: string
}

export type MarkReceivedModalType = DeleteReceivingModalType

export type AddShippingCostModalType = {
  show: boolean
  orderId: number
  orderNumber: string
  shippingCost: number | string
}

export type AddShippingCostToReceivingType = {
  currentRegion: string
  businessId: string
  orderId: number
  value: number | string
}

const handleAddShippingCostToReceiving = async ({ currentRegion, businessId, orderId, value }: AddShippingCostToReceivingType): Promise<{ error: boolean }> => {
  const { data } = await axios.post(`/api/receivings/addShippingCostToReceiving?region=${currentRegion}&businessId=${businessId}`, {
    orderId,
    shippingCost: value,
  })

  if (!data.error) {
    toast.success(data.message)
    return { error: false }
  } else {
    toast.error(data.message)
    return { error: true }
  }
}

const handleMarkAsReceived = async ({ currentRegion, businessId, orderId }: Omit<AddShippingCostToReceivingType, 'value'>): Promise<{ error: boolean }> => {
  const { data } = await axios.post(`/api/receivings/markAsReceived?region=${currentRegion}&businessId=${businessId}`, {
    orderId,
  })

  if (!data.error) {
    toast.success(data.message)
    return { error: false }
  } else {
    toast.error(data.message)
    return { error: true }
  }
}

const Receiving = ({ session }: Props) => {
  const { state } = useContext(AppContext)
  const [shipmentsStartDate, setShipmentsStartDate] = useState(moment().subtract(3, 'months').format('YYYY-MM-DD'))
  const [shipmentsEndDate, setShipmentsEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [searchValue, setSearchValue] = useState<string>('')

  const { receivings, isLoading, mutateReceivings } = useReceivings({ searchValue, startDate: shipmentsStartDate, endDate: shipmentsEndDate })

  const [showDeleteModal, setshowDeleteModal] = useState<DeleteReceivingModalType>({
    show: false,
    orderId: 0,
    orderNumber: '',
  })

  const [addShippingCostModal, setaddShippingCostModal] = useState<AddShippingCostModalType>({
    show: false,
    orderId: 0,
    orderNumber: '',
    shippingCost: 0,
  })

  const [markReceivedModal, setmarkReceivedModal] = useState<MarkReceivedModalType>({
    show: false,
    orderId: 0,
    orderNumber: '',
  })

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const title = `Receivings | ${session?.user?.businessName}`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Receivings' pageTitle='Inbound' />
          <Container fluid>
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-1 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <FilterByDates
                  shipmentsStartDate={shipmentsStartDate}
                  setShipmentsStartDate={setShipmentsStartDate}
                  setShipmentsEndDate={setShipmentsEndDate}
                  shipmentsEndDate={shipmentsEndDate}
                  handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                />
              </div>
              <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' />
            </div>
            <Card>
              <CardBody className='fs-7'>
                <ReceivingTable tableData={receivings} pending={isLoading} mutateReceivings={mutateReceivings} setshowDeleteModal={setshowDeleteModal} setaddShippingCostModal={setaddShippingCostModal} setmarkReceivedModal={setmarkReceivedModal} />
              </CardBody>
            </Card>
          </Container>
        </div>
        {showDeleteModal.show && <Confirm_Delete_Receiving showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} mutateReceivings={mutateReceivings} />}
        {markReceivedModal.show && (
          <ConfirmActionModal
            isOpen={markReceivedModal.show}
            headerText='Mark as Received'
            primaryText='Receiving:'
            primaryTextSub={markReceivedModal.orderNumber}
            descriptionText={`Are you sure you want to mark this receiving as received?`}
            confirmText='Mark as Received'
            loadingText='Marking...'
            handleSubmit={async () =>
              await handleMarkAsReceived({
                currentRegion: state.currentRegion,
                businessId: state.user.businessId,
                orderId: markReceivedModal.orderId,
              }).then((res) => {
                mutateReceivings()
                return res
              })
            }
            handleClose={() => setmarkReceivedModal({ show: false, orderId: 0, orderNumber: '' })}
          />
        )}
        {addShippingCostModal.show && (
          <InputNumberModal
            isOpen={addShippingCostModal.show}
            headerText='Add Shipping Cost to Receiving'
            primaryText='Receiving:'
            primaryTextSub={addShippingCostModal.orderNumber}
            descriptionText={`Enter the shipping cost from the seller's warehouse to the receiving destination. This value will be used to calculate the Inbound Shipping Cost for the receiving SKUs. Leave this field blank if you do not want to include this shipment in the Inbound Shipping Cost calculation.`}
            confirmText='Save'
            loadingText='Saving...'
            placeholder='Shipping Cost'
            initialValue={addShippingCostModal.shippingCost}
            isPrice
            handleSubmit={async (value) =>
              await handleAddShippingCostToReceiving({
                currentRegion: state.currentRegion,
                businessId: state.user.businessId,
                orderId: addShippingCostModal.orderId,
                value,
              }).then((res) => {
                mutateReceivings()
                return res
              })
            }
            handleClose={() =>
              setaddShippingCostModal({
                show: false,
                orderId: 0,
                orderNumber: '',
                shippingCost: 0,
              })
            }
            handleSubmitClearValue={async (value) =>
              await handleAddShippingCostToReceiving({
                currentRegion: state.currentRegion,
                businessId: state.user.businessId,
                orderId: addShippingCostModal.orderId,
                value,
              }).then((res) => {
                mutateReceivings()
                return res
              })
            }
          />
        )}
      </React.Fragment>
    </div>
  )
}

export default Receiving
