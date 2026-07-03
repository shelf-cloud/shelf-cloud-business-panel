 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

type Props = {
  cancelInboundPlanModal: {
    show: boolean
    inboundPlanId: string
    inboundPlanName: string
  }
  setcancelInboundPlanModal: (prev: any) => void
}

const ConfirmCancelInboundPlan = ({ cancelInboundPlanModal, setcancelInboundPlanModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [isLoading, setisLoading] = useState(false)

  const handleCancelInboundPlan = async (inboundPlanId: string, inboundPlanName: string) => {
    setisLoading(true)
    const cancelInboundPlanToast = toast.loading('Canceling Inbound Plan...')
    try {
      const response = await axios.get(
        `/api/amazon/fullfilments/cancelInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}&inboundPlanName=${inboundPlanName}`
      )

      if (!response.data.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setcancelInboundPlanModal({
          show: false,
          inboundPlanId: '',
          inboundPlanName: '',
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerInboundPlans/${state.currentRegion}/${state.user.businessId}`)
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error(error)
    }
    setisLoading(false)
  }

  return (
    <Dialog
      open={!!cancelInboundPlanModal.show}
      onOpenChange={(open) => {
        if (!open)
          setcancelInboundPlanModal({
            show: false,
            inboundPlanId: '',
            inboundPlanName: '',
          })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>Confirm Cancel Inbound Plan</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>InboundPlan:</h5>
          <div className='px-3 w-full mt-2'>
            <p className='text-[16.25px]'>{cancelInboundPlanModal.inboundPlanName}</p>
          </div>
          <div className='flex flex-wrap -mx-3 mt-4'>
            <div className='text-right mt-2 flex flex-row gap-6 justify-end'>
              <Button
                disabled={isLoading}
                type='button'
                variant='light'
                onClick={() => {
                  setcancelInboundPlanModal({
                    show: false,
                    inboundPlanId: '',
                    inboundPlanName: '',
                  })
                }}>
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type='button'
                variant='destructive'
                onClick={() => handleCancelInboundPlan(cancelInboundPlanModal.inboundPlanId, cancelInboundPlanModal.inboundPlanName)}>
                {isLoading ? <Spinner className='text-white' /> : 'Cancel Inbound Plan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmCancelInboundPlan
