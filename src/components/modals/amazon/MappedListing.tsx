 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
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

  return (
    <Modal
      fade={false}
      size='md'
      id='confirmDelete'
      isOpen={showMappedListingModal.show}
      toggle={() => {
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
      }}>
      <ModalHeader
        toggle={() => {
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
        }}
        className='modal-title'
        id='myModalLabel'>
        Mapped Amazon Listing to ShelfCloud Sku
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='tw:text-[19.5px] tw:mb-0 tw:font-semibold tw:text-primary'>Amazon Listing:</h5>
          <p className='tw:text-[19.5px] tw:font-semibold tw:text-black'>{showMappedListingModal.listingSku}</p>
          <Col md={12}>
            <p className='tw:font-semibold tw:text-[13px] tw:m-0 tw:mb-1'>Map to Product or Kit:</p>
            <Select_Product_Mapped data={data || []} showMappedListingModal={showMappedListingModal} setshowMappedListingModal={setshowMappedListingModal} />
          </Col>
          <Row md={12} className='tw:mt-4'>
            <div className='tw:text-right tw:mt-2 tw:flex tw:flex-row tw:gap-6 tw:justify-between'>
              <Button disabled={loading || showMappedListingModal.currentSkuMapped === ''} type='button' color='danger' onClick={handleUnMappedProduct}>
                <i className='las la-unlink fs-5 text-white m-0 p-0 me-1' />
                {loading ? <Spinner color='#fff' size={'sm'} /> : 'UnMap'}
              </Button>
              <div className='tw:flex tw:flex-row tw:gap-4'>
                <Button
                  disabled={loading}
                  type='button'
                  color='light'
                  onClick={() => {
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
                  }}>
                  Cancel
                </Button>
                <Button disabled={loading || showMappedListingModal.currentSkuMapped !== ''} type='button' color='success' onClick={handleSaveMappedProduct}>
                  {loading ? <Spinner color='#fff' size={'sm'} /> : 'Save'}
                </Button>
              </div>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default MappedListing
