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
import { Dialog, DialogContent, DialogHeader } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Textarea } from '@shadcn/ui/textarea'
import { useSWRConfig } from 'swr'

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

const editPaymentSchema = z.object({
  paymentDate: z.string().min(1, { message: 'Please select Date' }),
  amount: z.coerce.number({ error: 'Please enter amount paid' }),
  comment: z.string().optional(),
})

type EditPaymentInput = z.input<typeof editPaymentSchema>
type EditPaymentValues = z.output<typeof editPaymentSchema>

const Edit_Payment_Modal = ({ editPaymentModal, setEditPaymentModal }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setloading] = useState(false)

  const validation = useForm<EditPaymentInput, any, EditPaymentValues>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      paymentDate: editPaymentModal.paymentDate,
      amount: editPaymentModal.amount,
      comment: editPaymentModal.comment,
    },
  })

  const onSubmit = async (values: EditPaymentValues) => {
    setloading(true)

    const response = await axios.post(`/api/purchaseOrders/editPaymentToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: editPaymentModal.poId,
      paymentIndex: editPaymentModal.paymentIndex,
      ...values,
    })

    if (!response.data.error) {
      validation.reset()
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

  const amountValue = Number(validation.watch('amount') ?? 0)
  const { errors, touchedFields } = validation.formState

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
        <form onSubmit={validation.handleSubmit(onSubmit)}>
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
                  aria-invalid={(touchedFields.paymentDate && errors.paymentDate ? true : false) || undefined}
                  {...validation.register('paymentDate')}
                />
                {touchedFields.paymentDate && errors.paymentDate ? <div className='text-sm text-destructive'>{errors.paymentDate.message}</div> : null}
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
                  step='.01'
                  aria-invalid={(touchedFields.amount && errors.amount ? true : false) || undefined}
                  {...validation.register('amount')}
                />
                <small className='text-[11.2px] text-muted-foreground'>{FormatCurrency(state.currentRegion, amountValue)}</small>
                {touchedFields.amount && errors.amount ? <div className='text-sm text-destructive'>{errors.amount.message}</div> : null}
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
                  aria-invalid={(touchedFields.comment && errors.comment ? true : false) || undefined}
                  {...validation.register('comment')}
                />
                {touchedFields.comment && errors.comment ? <div className='text-sm text-destructive'>{errors.comment.message}</div> : null}
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
