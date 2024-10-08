/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  editShipmentName: {
    show: boolean
    shipmentId: string
    shipmentName: string
  }
  seteditShipmentName: (prev: any) => void
}

const ChangeFBAShipmentName = ({ editShipmentName, seteditShipmentName }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [shipmentName, setshipmentName] = useState(editShipmentName.shipmentName)
  const [isLoading, setisLoading] = useState(false)

  const hanldeEditFBAShipmentName = async () => {
    setisLoading(true)
    const cancelInboundPlanToast = toast.loading('Canceling Inbound Plan...')
    try {
      const response = await axios.get(``)

      if (!response.data.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        seteditShipmentName({
          show: false,
          shipmentId: '',
          shipmentName: '',
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
      centered
      id='ChangeFBAShipmentName'
      isOpen={editShipmentName.show}
      toggle={() => {
        seteditShipmentName({
          show: false,
          shipmentId: '',
          shipmentName: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          seteditShipmentName({
            show: false,
            shipmentId: '',
            shipmentName: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Rename Shipment
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-0 fw-semibold text-primary'>Shipment:</h5>
          <Col md={12} className='mt-2'>
            <DebounceInput
              type='text'
              minLength={3}
              debounceTimeout={300}
              className='form-control input_background_white'
              placeholder='Search...'
              id='search-options'
              value={shipmentName}
              onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
              onChange={(e) => setshipmentName(e.target.value)}
            />
          </Col>
          <div className='mt-4 d-flex flex-row gap-3 justify-content-end'>
            <Button
              disabled={isLoading}
              type='button'
              color='light'
              className='btn'
              onClick={() => {
                seteditShipmentName({
                  show: false,
                  shipmentId: '',
                  shipmentName: '',
                })
              }}>
              Cancel
            </Button>
            <Button disabled={true || isLoading} type='button' color='success' className='btn' hanldeEditFBAShipmentName={hanldeEditFBAShipmentName}>
              {isLoading ? <Spinner color='#fff' size={'sm'} /> : 'Confirm'}
            </Button>
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default ChangeFBAShipmentName
