import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
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

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }
  return (
    <Dialog
      open={!!state.showAddPaymentToPo}
      onOpenChange={(open) => {
        if (!open) setShowAddPaymentToPo(!state.showAddPaymentToPo)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='addPaymentToPoModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleAddProduct}>
            <div className='flex flex-wrap -mx-3'>
              <h5 className='text-[16.25px] mb-4 font-semibold'>
                PO: <span className='font-semibold text-primary'>{state.modalAddPaymentToPoDetails?.orderNumber}</span>
              </h5>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='firstNameinput' className='mb-2'>
                    *Payment Date
                  </Label>
                  <Input
                    type='date'
                    className='h-8 text-xs'
                    id='paymentDate'
                    name='paymentDate'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.paymentDate || ''}
                    aria-invalid={Boolean(validation.touched.paymentDate && validation.errors.paymentDate) || undefined}
                  />
                  {validation.touched.paymentDate && validation.errors.paymentDate ? <div className='text-sm text-destructive'>{validation.errors.paymentDate}</div> : null}
                </div>
              </div>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='firstNameinput' className='mb-2'>
                    *Payment Amount
                  </Label>
                  <Input
                    type='number'
                    onWheel={(e: any) => e.currentTarget.blur()}
                    className='h-8 text-xs'
                    id='amount'
                    name='amount'
                    step='.01'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    aria-invalid={Boolean(validation.touched.amount && validation.errors.amount) || undefined}
                  />
                  <small className='text-[11.2px] text-muted-foreground'>{FormatCurrency(state.currentRegion, validation.values.amount)}</small>
                  {validation.touched.amount && validation.errors.amount ? <div className='text-sm text-destructive'>{validation.errors.amount}</div> : null}
                </div>
              </div>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full'>
                <div className='mb-4'>
                  <Label htmlFor='comment' className='mb-2'>
                    Comments
                  </Label>
                  <Textarea
                    className='text-xs'
                    id='comment'
                    name='comment'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.comment || ''}
                    aria-invalid={Boolean(validation.touched.comment && validation.errors.comment) || undefined}
                  />
                  {validation.touched.comment && validation.errors.comment ? <div className='text-sm text-destructive'>{validation.errors.comment}</div> : null}
                </div>
              </div>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='text-right'>
                <Button disabled={loading} type='submit' variant='success' className='text-[11.2px]'>
                  {loading ? (
                    <span>
                      <Spinner className='text-white' /> Adding...
                    </span>
                  ) : (
                    'Add Payment'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Add_Payment_Modal
