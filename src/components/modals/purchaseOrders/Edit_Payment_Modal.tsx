import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Textarea } from '@shadcn/ui/textarea'
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
    <Dialog
      open={!!editPaymentModal.show}
      onOpenChange={(open) => {
        if (!open) setEditPaymentModal({
          show: false,
          poId: 0,
          orderNumber: '',
          paymentDate: '',
          amount: 0,
          comment: '',
          paymentIndex: 0,
        })
      }}>
      <DialogContent id='addPaymentToPoModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
      <DialogHeader className='pr-6' id='myModalLabel'>
        Edit Payment
      </DialogHeader>
      <div>
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <h5 className='text-[16.25px] mb-4 font-semibold text-primary'>
              PO: <span className='font-semibold text-black'>{editPaymentModal.orderNumber}</span>
            </h5>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 md:w-6/12'>
              <div className='mb-4'>
                <Label htmlFor='firstNameinput' className='mb-2'>
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
                  aria-invalid={(validation.touched.paymentDate && validation.errors.paymentDate ? true : false) || undefined}
                />
                {validation.touched.paymentDate && validation.errors.paymentDate ? <div className='text-sm text-destructive'>{validation.errors.paymentDate}</div> : null}
              </div>
            </div>
            <div className='px-3 md:w-6/12'>
              <div className='mb-4'>
                <Label htmlFor='firstNameinput' className='mb-2'>
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
                  aria-invalid={(validation.touched.amount && validation.errors.amount ? true : false) || undefined}
                />
                <small className='text-[11.2px] text-muted-foreground'>{FormatCurrency(state.currentRegion, validation.values.amount)}</small>
                {validation.touched.amount && validation.errors.amount ? <div className='text-sm text-destructive'>{validation.errors.amount}</div> : null}
              </div>
            </div>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 md:w-full'>
              <div className='mb-4'>
                <Label htmlFor='comment' className='mb-2'>
                  Comments
                </Label>
                <Textarea
                  className='text-[13px]'
                  id='comment'
                  name='comment'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.comment || ''}
                  aria-invalid={(validation.touched.comment && validation.errors.comment ? true : false) || undefined}
                />
                {validation.touched.comment && validation.errors.comment ? <div className='text-sm text-destructive'>{validation.errors.comment}</div> : null}
              </div>
            </div>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='flex justify-between items-center'>
              <Button disabled={loading} type='button' variant='destructive' className='text-[11.2px]' onClick={handleDeletePayment}>
                {loading ? <Spinner className='size-6 text-white' /> : 'Delete'}
              </Button>
              <Button disabled={loading} type='submit' variant='success' className='text-[11.2px]'>
                {loading ? <Spinner className='size-6 text-white' /> : 'Edit Payment'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      </DialogContent>
    </Dialog>
  )
}

export default Edit_Payment_Modal
