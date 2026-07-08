
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Label } from '@shadcn/ui/label'
import { NativeSelect } from '@shadcn/ui/native-select'
import { Spinner } from '@shadcn/ui/spinner'
import { z } from 'zod'

type Props = {
  showDeleteModal: {
    show: boolean
    orderId: number
    orderNumber: string
    goFlowOrderId: number
  }
  setshowDeleteModal: (prev: any) => void
  mutateShipments?: () => void
}

const cancelOrderSchema = z.object({
  notify: z.boolean(),
  reason: z.string().min(1, 'You must select a valid reason'),
})

type CancelOrderForm = z.infer<typeof cancelOrderSchema>

const CancelManualOrderConfirmationModal = ({ showDeleteModal, setshowDeleteModal, mutateShipments }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const validation = useForm<CancelOrderForm>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: {
      notify: true,
      reason: '',
    },
  })
  const {
    register,
    formState: { errors },
  } = validation

  const onSubmit = async (values: CancelOrderForm) => {
    setLoading(true)
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
      mutateShipments && mutateShipments()
      toast.success(response.data.msg)
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  const handleCancelOrder = validation.handleSubmit(onSubmit)

  return (
    <Dialog
      open={!!showDeleteModal.show}
      onOpenChange={(open) => {
        if (!open)
          setshowDeleteModal({
            show: false,
            orderId: 0,
            orderNumber: '',
            goFlowOrderId: 0,
          })
      }}>
      <DialogContent id='confirmDelete' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>
            Confirm Order Cancelation
          </DialogTitle>
        </DialogHeader>
        <div>
        <div className='flex flex-wrap -mx-3'>
          <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>
            Order Number: <span className='text-[19.5px] font-bold text-black'>{showDeleteModal.orderNumber}</span>
          </h5>
          <div className='flex flex-wrap -mx-3 mt-6'>
            <form onSubmit={handleCancelOrder}>
              <div className='px-3 md:w-full'>
                <div className='mb-4 flex gap-2'>
                  <Label className='font-normal' htmlFor='notify'>
                    Notify Marketplace
                  </Label>
                  <input
                    className='size-4 shrink-0 border border-input-border accent-primary rounded-sm'
                    type='checkbox'
                    id='notify'
                    aria-invalid={(errors.notify ? true : false) || undefined}
                    {...register('notify')}
                  />
                  {errors.notify ? <div className='text-sm text-destructive'>{errors.notify.message}</div> : null}
                </div>
                <div>
                  <div className='mb-4'>
                    <Label htmlFor='reason' className='mb-2'>
                      Reason
                    </Label>
                    <NativeSelect
                      className='text-[13px]'
                      id='reason'
                      size='sm'
                      aria-invalid={(errors.reason ? true : false) || undefined}
                      {...register('reason')}>
                      <option value=''>Select Reason</option>
                      <option value='customer_requested'>Customer Requested</option>
                      <option value='no_stock'>No Stock</option>
                      <option value='fraud'>Fraud</option>
                      <option value='payment_declined'>Payment Declined</option>
                      <option value='other'>Other</option>
                    </NativeSelect>
                    {errors.reason ? <div className='text-sm text-destructive'>{errors.reason.message}</div> : null}
                  </div>
                </div>
              </div>
              <div className='text-right mt-2'>
                <Button disabled={loading} type='submit' variant='destructive'>
                  {loading ? <Spinner className='text-white' /> : 'Cancel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CancelManualOrderConfirmationModal
