import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'

type Props = {}

const Add_Payment_Modal = ({}: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setShowAddPaymentToPo }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setloading] = useState(false)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      paymentDate: '',
      amount: '',
    },
    validationSchema: Yup.object({
      paymentDate: Yup.string().required('Please select Date'),
      amount: Yup.string().required('Please enter amount paid'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)

      const response = await axios.post(`/api/purchaseOrders/addPaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: state.modalAddPaymentToPoDetails?.poId,
        ...values,
      })

      if (!response.data.error) {
        resetForm()
        toast.success(response.data.msg)
        setShowAddPaymentToPo(false)
        if (organizeBy == 'suppliers') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'orders') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'sku') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        }
      } else {
        toast.error(response.data.msg)
      }
      setloading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }
  return (
    <Modal
      fade={false}
      size='md'
      id='addPaymentToPoModal'
      isOpen={state.showAddPaymentToPo}
      toggle={() => {
        setShowAddPaymentToPo(!state.showAddPaymentToPo)
      }}>
      <ModalHeader
        toggle={() => {
          setShowAddPaymentToPo(!state.showAddPaymentToPo)
        }}
        className='modal-title'
        id='myModalLabel'></ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <h5 className='fs-4 mb-4 fw-semibold text-primary'>
              Add Payment: <span className='fs-4 fw-bold text-black'>{state.modalAddPaymentToPoDetails?.orderNumber}</span>
            </h5>
            <Row md={12}>
              <Col md={6}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='firstNameinput' className='form-label'>
                    *Payment Date
                  </Label>
                  <Input
                    type='date'
                    className='form-control'
                    id='paymentDate'
                    name='paymentDate'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.paymentDate || ''}
                    invalid={validation.touched.paymentDate && validation.errors.paymentDate ? true : false}
                  />
                  {validation.touched.paymentDate && validation.errors.paymentDate ? <FormFeedback type='invalid'>{validation.errors.paymentDate}</FormFeedback> : null}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='firstNameinput' className='form-label'>
                    *Payment Amount
                  </Label>
                  <Input
                    type='number'
                    onWheel={(e: any) => e.currentTarget.blur()}
                    className='form-control'
                    id='amount'
                    name='amount'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.amount && validation.errors.amount ? true : false}
                  />
                  {validation.touched.amount && validation.errors.amount ? <FormFeedback type='invalid'>{validation.errors.amount}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Row md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn'>
                  {loading ? <Spinner color='#fff' /> : 'Add Payment'}
                </Button>
              </div>
            </Row>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Add_Payment_Modal
