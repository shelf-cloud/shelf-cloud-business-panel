 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Label } from '@shadcn/ui/label'
import { NativeSelect } from '@shadcn/ui/native-select'
import { Spinner } from '@shadcn/ui/spinner'
import * as Yup from 'yup'

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

const CancelManualOrderConfirmationModal = ({ showDeleteModal, setshowDeleteModal, mutateShipments }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)

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
    },
  })

  const handleCancelOrder = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

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
                    defaultChecked
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    aria-invalid={(validation.touched.notify && validation.errors.notify ? true : false) || undefined}
                  />
                  {validation.touched.notify && validation.errors.notify ? <div className='text-sm text-destructive'>{validation.errors.notify}</div> : null}
                </div>
                <div>
                  <div className='mb-4'>
                    <Label htmlFor='reason' className='mb-2'>
                      Reason
                    </Label>
                    <NativeSelect
                      className='text-[13px]'
                      id='reason'
                      name='reason'
                      size='sm'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.reason ?? ''}
                      aria-invalid={(validation.touched.reason && validation.errors.reason ? true : false) || undefined}>
                      <option value=''>Select Reason</option>
                      <option value='customer_requested'>Customer Requested</option>
                      <option value='no_stock'>No Stock</option>
                      <option value='fraud'>Fraud</option>
                      <option value='payment_declined'>Payment Declined</option>
                      <option value='other'>Other</option>
                    </NativeSelect>
                    {validation.touched.reason && validation.errors.reason ? <div className='text-sm text-destructive'>{validation.errors.reason}</div> : null}
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
