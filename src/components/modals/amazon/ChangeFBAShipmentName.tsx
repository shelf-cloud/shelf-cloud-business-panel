/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { useSWRConfig } from 'swr'

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
    const updateShipmentName = toast.loading('Updating Shipment Name...')
    try {
      const response = await axios.post(`/api/amazon/shipments/changeFBAShipmentName?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shipmentName: shipmentName,
        shipmentId: editShipmentName.shipmentId,
      })

      if (!response.data.error) {
        toast.update(updateShipmentName, {
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
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipments/${state.currentRegion}/${state.user.businessId}`)
      } else {
        toast.update(updateShipmentName, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(updateShipmentName, {
        render: 'Error updating Shipment Name',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
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
            <Button disabled={isLoading} type='button' color='success' className='btn' onClick={hanldeEditFBAShipmentName}>
              {isLoading ? <Spinner color='light' size={'sm'} /> : 'Confirm'}
            </Button>
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default ChangeFBAShipmentName
