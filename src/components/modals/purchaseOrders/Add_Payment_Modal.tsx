import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

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
      amount: 0,
      comment: '',
    },
    validationSchema: Yup.object({
      paymentDate: Yup.string().required('Please select Date'),
      amount: Yup.number().min(0.1, 'Please enter amount paid').required('Please enter amount paid'),
      comment: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)

      const response = await axios.post(`/api/purchaseOrders/addPaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: state.modalAddPaymentToPoDetails?.poId,
        ...values,
      })

      if (!response.data.error) {
        resetForm()
        if (organizeBy == 'suppliers') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'orders') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'sku') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        }
        toast.success(response.data.msg)
        setShowAddPaymentToPo(false)
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
        id='myModalLabel'>
        Add Payment
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row md={12}>
            <h5 className='fs-5 mb-4 fw-semibold'>
              PO: <span className='fw-semibold text-primary'>{state.modalAddPaymentToPoDetails?.orderNumber}</span>
            </h5>
          </Row>
          <Row md={12}>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Payment Date
                </Label>
                <Input
                  type='date'
                  className='form-control fs-6'
                  bsSize='sm'
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
                  className='form-control fs-6'
                  bsSize='sm'
                  id='amount'
                  name='amount'
                  step='.01'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.amount && validation.errors.amount ? true : false}
                />
                <small className='fs-7 text-muted'>{FormatCurrency(state.currentRegion, validation.values.amount)}</small>
                {validation.touched.amount && validation.errors.amount ? <FormFeedback type='invalid'>{validation.errors.amount}</FormFeedback> : null}
              </FormGroup>
            </Col>
          </Row>
          <Row md={12}>
            <Col md={12}>
              <FormGroup className='mb-3'>
                <Label htmlFor='comment' className='form-label'>
                  Comments
                </Label>
                <Input
                  type='textarea'
                  className='form-control fs-6'
                  bsSize='sm'
                  id='comment'
                  name='comment'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.comment || ''}
                  invalid={validation.touched.comment && validation.errors.comment ? true : false}
                />
                {validation.touched.comment && validation.errors.comment ? <FormFeedback type='invalid'>{validation.errors.comment}</FormFeedback> : null}
              </FormGroup>
            </Col>
          </Row>
          <Row md={12}>
            <div className='text-end'>
              <Button disabled={loading} type='submit' color='success' className='btn fs-7'>
                {loading ? (
                  <span>
                    <Spinner color='light' size={'sm'} /> Adding...
                  </span>
                ) : (
                  'Add Payment'
                )}
              </Button>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Add_Payment_Modal
