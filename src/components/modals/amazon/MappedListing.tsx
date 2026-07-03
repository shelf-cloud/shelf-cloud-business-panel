 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR, { useSWRConfig } from 'swr'

import Select_Product_Mapped from './Select_Product_Mapped'

type Props = {
  showMappedListingModal: {
    show: boolean
    listingSku: string
    listingFnsku: string
    listingId: number
    shelfCloudSku: string
    shelfCloudSkuId: number
    shelfCloudSkuIsKit: boolean
    currentSkuMapped: string
    currentSkuIdMapped: number
    currentSkuIsKitMapped: boolean
  }
  setshowMappedListingModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

type Product = {
  inventoryId: string
  businessId: number
  image: string
  title: string
  sku: string
  isKit: boolean
}
const MappedListing = ({ showMappedListingModal, setshowMappedListingModal, loading, setLoading }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()

  const fetcher = async (endPoint: string) => await axios(endPoint).then((res) => res.data)
  const { data }: { data?: Product[] } = useSWR(
    state.user.businessId ? `/api/products/getProductsSku?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const handleSaveMappedProduct = async () => {
    if (showMappedListingModal.shelfCloudSkuId === 0 || showMappedListingModal.shelfCloudSku === '') {
      toast.error('Please select ShelfCloud Product to Map')
      return
    }
    setLoading(true)
    const response = await axios.post(`/api/amazon/mapListingToSku?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      listingId: showMappedListingModal.listingId,
      listingSku: showMappedListingModal.listingSku,
      shelfCloudSku: showMappedListingModal.shelfCloudSku,
      shelfCloudSkuId: showMappedListingModal.shelfCloudSkuId,
      shelfCloudSkuIsKit: showMappedListingModal.shelfCloudSkuIsKit,
      fnSku: showMappedListingModal.listingFnsku,
    })
    if (!response.data.error) {
      setshowMappedListingModal({
        show: false,
        listingSku: '',
        listingFnsku: '',
        listingId: 0,
        shelfCloudSku: '',
        shelfCloudSkuId: 0,
        shelfCloudSkuIsKit: false,
        currentSkuMapped: '',
        currentSkuIdMapped: 0,
        currentSkuIsKitMapped: false,
      })
      toast.success(response.data.message)
      mutate(`/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
    setLoading(false)
  }

  const handleUnMappedProduct = async () => {
    if (showMappedListingModal.currentSkuIdMapped === 0 || showMappedListingModal.currentSkuMapped === '') {
      toast.error('Please select ShelfCloud Product to UnMap')
      return
    }
    setLoading(true)
    const response = await axios.post(`/api/amazon/unMapListingToSku?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      listingId: showMappedListingModal.listingId,
      listingSku: showMappedListingModal.listingSku,
      shelfCloudSku: showMappedListingModal.currentSkuMapped,
      shelfCloudSkuId: showMappedListingModal.currentSkuIdMapped,
      shelfCloudSkuIsKit: showMappedListingModal.currentSkuIsKitMapped,
      fnSku: showMappedListingModal.listingFnsku,
    })
    if (!response.data.error) {
      setshowMappedListingModal((prev: any) => {
        return {
          ...prev,
          shelfCloudSku: '',
          shelfCloudSkuId: 0,
          shelfCloudSkuIsKit: false,
          currentSkuMapped: '',
          currentSkuIdMapped: 0,
          currentSkuIsKitMapped: false,
        }
      })
      toast.success(response.data.message)
      mutate(`/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
    setLoading(false)
  }

  const closeModal = () => {
    setshowMappedListingModal({
      show: false,
      listingSku: '',
      listingFnsku: '',
      listingId: 0,
      shelfCloudSku: '',
      shelfCloudSkuId: 0,
      shelfCloudSkuIsKit: false,
      currentSkuMapped: '',
      currentSkuIdMapped: 0,
      currentSkuIsKitMapped: false,
    })
  }

  return (
    <Dialog
      open={!!showMappedListingModal.show}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>Mapped Amazon Listing to ShelfCloud Sku</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>Amazon Listing:</h5>
          <p className='text-[19.5px] font-semibold text-black'>{showMappedListingModal.listingSku}</p>
          <div className='px-3 w-full'>
            <p className='font-semibold text-[13px] m-0 mb-1'>Map to Product or Kit:</p>
            <Select_Product_Mapped data={data || []} showMappedListingModal={showMappedListingModal} setshowMappedListingModal={setshowMappedListingModal} />
          </div>
          <div className='flex flex-wrap -mx-3 mt-4'>
            <div className='text-right mt-2 flex flex-row gap-6 justify-between'>
              <Button disabled={loading || showMappedListingModal.currentSkuMapped === ''} type='button' variant='destructive' onClick={handleUnMappedProduct}>
                <i className='las la-unlink text-[16.25px] text-white m-0 p-0 me-1' />
                {loading ? <Spinner className='text-white' /> : 'UnMap'}
              </Button>
              <div className='flex flex-row gap-4'>
                <Button
                  disabled={loading}
                  type='button'
                  variant='light'
                  onClick={closeModal}>
                  Cancel
                </Button>
                <Button disabled={loading || showMappedListingModal.currentSkuMapped !== ''} type='button' variant='success' onClick={handleSaveMappedProduct}>
                  {loading ? <Spinner className='text-white' /> : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MappedListing
