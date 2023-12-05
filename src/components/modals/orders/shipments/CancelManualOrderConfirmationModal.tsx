/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'

type Props = {
  showDeleteModal: {
    show: boolean
    orderId: number
    orderNumber: string
    goFlowOrderId: number
  }
  setshowDeleteModal: (prev: any) => void
  apiMutateLink?: string
}

const CancelManualOrderConfirmationModal = ({ showDeleteModal, setshowDeleteModal, apiMutateLink }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const { mutate } = useSWRConfig()

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      notify: true,
      reason: '',
    },
    validationSchema: Yup.object({
      notify: Yup.boolean().required(),
      reason: Yup.string().required('You must select a valid reason'),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      console.log({
        orderId: showDeleteModal.orderId,
        orderNumber: showDeleteModal.orderNumber,
        notify: values.notify,
        reason: values.reason,
      })
      const response = await axios.post(`/api/shipments/cancelManualOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        orderId: showDeleteModal.orderId,
        orderNumber: showDeleteModal.orderNumber,
        goFlowOrderId: showDeleteModal.goFlowOrderId,
        notify: values.notify,
        reason: values.reason,
      })
      if (!response.data.error) {
        setshowDeleteModal({
          show: false,
          orderId: 0,
          orderNumber: '',
          goFlowOrderId: 0,
        })
        mutate(apiMutateLink)
        toast.success(response.data.msg)
      } else {
        toast.error(response.data.msg)
      }
      setLoading(false)
    },
  })

  const HandleCancelOrder = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='md'
      id='confirmDelete'
      isOpen={showDeleteModal.show}
      toggle={() => {
        setshowDeleteModal({
          show: false,
          orderId: 0,
          orderNumber: '',
          goFlowOrderId: 0,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowDeleteModal({
            show: false,
            orderId: 0,
            orderNumber: '',
            goFlowOrderId: 0,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Order Cancelation
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-0 fw-semibold text-primary'>
            Order Number: <span className='fs-4 fw-bold text-black'>{showDeleteModal.orderNumber}</span>
          </h5>
          <Row md={12} className='mt-4'>
            <Form onSubmit={HandleCancelOrder}>
              <Col md={12}>
                <div className='mb-3 d-flex gap-2'>
                  <Label className='form-check-label' for='notify'>
                    Notify Marketplace
                  </Label>
                  <Input
                    className='form-check-input'
                    type='checkbox'
                    id='notify'
                    defaultChecked
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.notify && validation.errors.notify ? true : false}
                  />
                  {validation.touched.notify && validation.errors.notify ? <FormFeedback type='invalid'>{validation.errors.notify}</FormFeedback> : null}
                </div>
                <div>
                  <FormGroup className='mb-3'>
                    <Label htmlFor='reason' className='form-label'>
                      Reason
                    </Label>
                    <Input
                      type='select'
                      className='form-control fs-6'
                      placeholder='reason...'
                      id='reason'
                      name='reason'
                      bsSize='sm'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.reason ?? ''}
                      invalid={validation.touched.reason && validation.errors.reason ? true : false}>
                      <option value=''>Select Reason</option>
                      <option value='customer_requested'>Customer Requested</option>
                      <option value='no_stock'>No Stock</option>
                      <option value='fraud'>Fraud</option>
                      <option value='payment_declined'>Payment Declined</option>
                      <option value='other'>Other</option>
                    </Input>
                    {validation.touched.reason && validation.errors.reason ? <FormFeedback type='invalid'>{validation.errors.reason}</FormFeedback> : null}
                  </FormGroup>
                </div>
              </Col>
              <div className='text-end mt-2'>
                <Button disabled={loading} type='submit' color='danger' className='btn'>
                  {loading ? <Spinner color='#fff' /> : 'Cancel'}
                </Button>
              </div>
            </Form>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default CancelManualOrderConfirmationModal
