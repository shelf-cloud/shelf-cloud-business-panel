 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'

type Props = {
  cancelInboundPlanModal: {
    show: boolean
    inboundPlanId: string
    inboundPlanName: string
  }
  setcancelInboundPlanModal: (prev: any) => void
}

const ConfirmCancelInboundPlan = ({ cancelInboundPlanModal, setcancelInboundPlanModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [isLoading, setisLoading] = useState(false)

  const handleCancelInboundPlan = async (inboundPlanId: string, inboundPlanName: string) => {
    setisLoading(true)
    const cancelInboundPlanToast = toast.loading('Canceling Inbound Plan...')
    try {
      const response = await axios.get(
        `/api/amazon/fullfilments/cancelInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}&inboundPlanName=${inboundPlanName}`
      )

      if (!response.data.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setcancelInboundPlanModal({
          show: false,
          inboundPlanId: '',
          inboundPlanName: '',
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`)
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error(error)
    }
    setisLoading(false)
  }

  return (
    <Modal
      fade={false}
      size='md'
      id='confirmCancelInboundPlan'
      isOpen={cancelInboundPlanModal.show}
      toggle={() => {
        setcancelInboundPlanModal({
          show: false,
          inboundPlanId: '',
          inboundPlanName: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          setcancelInboundPlanModal({
            show: false,
            inboundPlanId: '',
            inboundPlanName: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Cancel Inbound Plan
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>InboundPlan:</h5>
          <Col md={12} className='mt-2'>
            <p className='text-[16.25px]'>{cancelInboundPlanModal.inboundPlanName}</p>
          </Col>
          <Row md={12} className='mt-4'>
            <div className='text-right mt-2 flex flex-row gap-6 justify-end'>
              <Button
                disabled={isLoading}
                type='button'
                color='light'
                onClick={() => {
                  setcancelInboundPlanModal({
                    show: false,
                    inboundPlanId: '',
                    inboundPlanName: '',
                  })
                }}>
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type='button'
                color='danger'
                onClick={() => handleCancelInboundPlan(cancelInboundPlanModal.inboundPlanId, cancelInboundPlanModal.inboundPlanName)}>
                {isLoading ? <Spinner color='#fff' size={'sm'} /> : 'Cancel Inbound Plan'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmCancelInboundPlan
