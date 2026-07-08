import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

type Props = {}

const paymentSchema = z.object({
  paymentDate: z.string().min(1, { message: 'Please select Date' }),
  amount: z.coerce.number({ error: 'Please enter amount paid' }).min(0.1, { message: 'Please enter amount paid' }),
  comment: z.string().optional(),
})

type PaymentFormInput = z.input<typeof paymentSchema>
type PaymentFormValues = z.output<typeof paymentSchema>

const Add_Payment_Modal = ({}: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setShowAddPaymentToPo }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setloading] = useState(false)

  const validation = useForm<PaymentFormInput, any, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: '',
      amount: 0,
      comment: '',
    },
  })

  const onSubmit = async (values: PaymentFormValues) => {
    setloading(true)

    const response = await axios.post(`/api/purchaseOrders/addPaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: state.modalAddPaymentToPoDetails?.poId,
      ...values,
    })

    if (!response.data.error) {
      validation.reset()
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
  }

  const amountValue = Number(validation.watch('amount') ?? 0)

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
          <form onSubmit={validation.handleSubmit(onSubmit)}>
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
                    aria-invalid={Boolean(validation.formState.touchedFields.paymentDate && validation.formState.errors.paymentDate) || undefined}
                    {...validation.register('paymentDate')}
                  />
                  {validation.formState.touchedFields.paymentDate && validation.formState.errors.paymentDate ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.paymentDate.message}</div>
                  ) : null}
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
                    step='.01'
                    aria-invalid={Boolean(validation.formState.touchedFields.amount && validation.formState.errors.amount) || undefined}
                    {...validation.register('amount')}
                  />
                  <small className='text-[11.2px] text-muted-foreground'>{FormatCurrency(state.currentRegion, amountValue)}</small>
                  {validation.formState.touchedFields.amount && validation.formState.errors.amount ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.amount.message}</div>
                  ) : null}
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
                    aria-invalid={Boolean(validation.formState.touchedFields.comment && validation.formState.errors.comment) || undefined}
                    {...validation.register('comment')}
                  />
                  {validation.formState.touchedFields.comment && validation.formState.errors.comment ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.comment.message}</div>
                  ) : null}
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
