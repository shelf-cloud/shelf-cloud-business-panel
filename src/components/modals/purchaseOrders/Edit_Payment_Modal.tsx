import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type EditPaymentModal = {
  show: boolean
  poId: number
  orderNumber: string
  paymentDate: string
  amount: number
  comment: string
  paymentIndex: number
}

type Props = {
  editPaymentModal: EditPaymentModal
  setEditPaymentModal: (editPaymentModal: EditPaymentModal) => void
}

const Edit_Payment_Modal = ({ editPaymentModal, setEditPaymentModal }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setloading] = useState(false)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      paymentDate: editPaymentModal.paymentDate,
      amount: editPaymentModal.amount,
      comment: editPaymentModal.comment,
    },
    validationSchema: Yup.object({
      paymentDate: Yup.string().required('Please select Date'),
      amount: Yup.string().required('Please enter amount paid'),
      comment: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)

      const response = await axios.post(`/api/purchaseOrders/editPaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: editPaymentModal.poId,
        paymentIndex: editPaymentModal.paymentIndex,
        ...values,
      })

      if (!response.data.error) {
        resetForm()
        toast.success(response.data.msg)
        setEditPaymentModal({
          show: false,
          poId: 0,
          orderNumber: '',
          paymentDate: '',
          amount: 0,
          comment: '',
          paymentIndex: 0,
        })
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

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleDeletePayment = async () => {
    setloading(true)

    const response = await axios.post(`/api/purchaseOrders/deletePaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: editPaymentModal.poId,
      paymentIndex: editPaymentModal.paymentIndex,
    })

    if (!response.data.error) {
      toast.success(response.data.msg)
      setEditPaymentModal({
        show: false,
        poId: 0,
        orderNumber: '',
        paymentDate: '',
        amount: 0,
        comment: '',
        paymentIndex: 0,
      })
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
  }

  return (
    <Modal
      fade={false}
      size='md'
      id='addPaymentToPoModal'
      isOpen={editPaymentModal.show}
      toggle={() => {
        setEditPaymentModal({
          show: false,
          poId: 0,
          orderNumber: '',
          paymentDate: '',
          amount: 0,
          comment: '',
          paymentIndex: 0,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setEditPaymentModal({
            show: false,
            poId: 0,
            orderNumber: '',
            paymentDate: '',
            amount: 0,
            comment: '',
            paymentIndex: 0,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Edit Payment
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleAddProduct}>
          <Row md={12}>
            <h5 className='text-[16.25px] mb-4 font-semibold text-primary'>
              PO: <span className='font-semibold text-black'>{editPaymentModal.orderNumber}</span>
            </h5>
          </Row>
          <Row md={12}>
            <Col md={6}>
              <FormGroup className='mb-4'>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Payment Date
                </Label>
                <Input
                  type='date'
                  className='text-[13px]'
                  id='paymentDate'
                  name='paymentDate'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.paymentDate}
                  invalid={validation.touched.paymentDate && validation.errors.paymentDate ? true : false}
                />
                {validation.touched.paymentDate && validation.errors.paymentDate ? <FormFeedback type='invalid'>{validation.errors.paymentDate}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-4'>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Payment Amount
                </Label>
                <Input
                  type='number'
                  onWheel={(e: any) => e.currentTarget.blur()}
                  className='text-[13px]'
                  id='amount'
                  name='amount'
                  step='.01'
                  value={validation.values.amount}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.amount && validation.errors.amount ? true : false}
                />
                <small className='text-[11.2px] text-[var(--bs-secondary-color)]'>{FormatCurrency(state.currentRegion, validation.values.amount)}</small>
                {validation.touched.amount && validation.errors.amount ? <FormFeedback type='invalid'>{validation.errors.amount}</FormFeedback> : null}
              </FormGroup>
            </Col>
          </Row>
          <Row md={12}>
            <Col md={12}>
              <FormGroup className='mb-4'>
                <Label htmlFor='comment' className='form-label'>
                  Comments
                </Label>
                <Input
                  type='textarea'
                  className='text-[13px]'
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
            <div className='flex justify-between items-center'>
              <Button disabled={loading} type='button' color='danger' className='btn text-[11.2px]' onClick={handleDeletePayment}>
                {loading ? <Spinner color='light' /> : 'Delete'}
              </Button>
              <Button disabled={loading} type='submit' color='success' className='btn text-[11.2px]'>
                {loading ? <Spinner color='light' /> : 'Edit Payment'}
              </Button>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Edit_Payment_Modal
