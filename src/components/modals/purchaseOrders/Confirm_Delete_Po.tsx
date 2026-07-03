import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

type Props = {
  showDeleteModal: {
    show: boolean
    poId: number
    orderNumber: string
  }
  setshowDeleteModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Confirm_Delete_Po = ({ showDeleteModal, setshowDeleteModal, loading, setLoading }: Props) => {
  const { show, poId, orderNumber } = showDeleteModal
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const { generate_new_forecast_products } = useRPNewForecast()

  const handleClose = () => {
    setshowDeleteModal({
      show: false,
      poId: 0,
      orderNumber: '',
    })
  }

  const handleDeletePO = async () => {
    setLoading(true)
    const { data } = await axios.post(`/api/purchaseOrders/deletePo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: poId,
      orderNumber: orderNumber,
    })
    if (!data.error) {
      generate_new_forecast_products({
        skus: data.skus ?? [],
        productIds: data.productIds ?? [],
      })
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(data.msg)
      setshowDeleteModal({
        show: false,
        poId: 0,
        orderNumber: '',
      })
    } else {
      toast.error(data.msg)
    }
    setLoading(false)
  }

  return (
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='confirmDelete'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>
            Confirm Delete Purchase Order
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className='m-0 text-[16.25px] font-semibold'>
            Purchase Order: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='mt-4 flex justify-end items-center gap-2'>
            <Button type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type='button' variant='destructive' className='text-[11.2px]' onClick={handleDeletePO}>
              {loading ? (
                <span>
                  <Spinner className='text-white' /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Confirm_Delete_Po
