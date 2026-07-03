/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { NoImageAdress } from '@lib/assetsConstants'
import { Split } from '@typesTs/purchaseOrders'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

export type DeleteItemFromOrderType = {
  show: boolean
  poId: number
  orderNumber: string
  inventoryId: number
  sku: string
  title: string
  image: string
  hasSplitting: boolean
  split: Split | undefined
}

type Props = {
  showDeleteModal: DeleteItemFromOrderType
  setshowDeleteModal: (prev: DeleteItemFromOrderType) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Confirm_Delete_Item_From_PO = ({ showDeleteModal, setshowDeleteModal, loading, setLoading }: Props) => {
  const { show, poId, orderNumber, inventoryId, sku, title, image, hasSplitting, split } = showDeleteModal
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()

  const { generate_new_forecast_products } = useRPNewForecast()

  const handleClose = () => {
    setshowDeleteModal({
      show: false,
      poId: 0,
      orderNumber: '',
      inventoryId: 0,
      sku: '',
      title: '',
      image: '',
      hasSplitting: false,
      split: undefined,
    })
  }

  const handleDeleteFromSkuList = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/deleteSkufromPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId,
      orderNumber: orderNumber,
      inventoryId: inventoryId,
      sku: sku,
      hasSplitting,
      split: hasSplitting ? split : undefined,
    })

    if (!response.data.error) {
      generate_new_forecast_products({
        skus: [sku],
        productIds: [inventoryId],
      })
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      handleClose()
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent id='confirmDelete' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='myModalLabel'>
            Confirm Delete Item From PO
          </DialogTitle>
        </DialogHeader>
        <div>
        <p className='m-0 text-[16.25px] font-semibold'>
          Purchase Order: <span className='text-primary'>{orderNumber}</span>
        </p>
        {hasSplitting && (
          <p className='text-[16.25px] font-semibold'>
            From Split: <span className='text-primary'>{split?.splitName}</span>
          </p>
        )}
        <div className='my-2 flex flex-row'>
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
              height: '45px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img loading='lazy' src={image ? image : NoImageAdress} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
          </div>
          <div>
            <p className='font-semibold mb-0'>{title}</p>
            <p className='font-normal mb-0'>{sku}</p>
          </div>
        </div>
        <div className='mt-4 flex justify-end items-center gap-2'>
          <Button type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={loading} type='button' variant='destructive' className='text-[11.2px]' onClick={handleDeleteFromSkuList}>
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

export default Confirm_Delete_Item_From_PO
