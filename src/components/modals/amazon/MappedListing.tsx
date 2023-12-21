/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import useSWR, { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import Select_Product_Mapped from './Select_Product_Mapped'

type Props = {
  showMappedListingModal: {
    show: boolean
    listingSku: string
    listingId: number
    shelfCloudSku: string
    shelfCloudSkuId: number
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
}
const MappedListing = ({ showMappedListingModal, setshowMappedListingModal, loading, setLoading }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()

  const fetcher = async (endPoint: string) => await axios(endPoint).then((res) => res.data)
  const { data }: { data?: Product[] } = useSWR(
    state.user.businessId ? `/api/products/getProductsSku?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher
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
    })
    if (!response.data.error) {
      setshowMappedListingModal({
        show: false,
        listingSku: '',
        listingId: 0,
        shelfCloudSku: '',
        shelfCloudSkuId: 0,
      })
      toast.success(response.data.message)
      mutate(`/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
    setLoading(false)
  }

  const handleUnMappedProduct = async () => {
    if (showMappedListingModal.shelfCloudSkuId === 0 || showMappedListingModal.shelfCloudSku === '') {
      toast.error('Please select ShelfCloud Product to UnMap')
      return
    }
    setLoading(true)
    const response = await axios.post(`/api/amazon/unMapListingToSku?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      listingId: showMappedListingModal.listingId,
      listingSku: showMappedListingModal.listingSku,
      shelfCloudSku: showMappedListingModal.shelfCloudSku,
      shelfCloudSkuId: showMappedListingModal.shelfCloudSkuId,
    })
    if (!response.data.error) {
      setshowMappedListingModal({
        show: false,
        listingSku: '',
        listingId: 0,
        shelfCloudSku: '',
        shelfCloudSkuId: 0,
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
          listingId: 0,
          shelfCloudSku: '',
          shelfCloudSkuId: 0,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowMappedListingModal({
            show: false,
            listingSku: '',
            listingId: 0,
            shelfCloudSku: '',
            shelfCloudSkuId: 0,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Mapped Amazon Listing to ShelfCloud Sku
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-0 fw-semibold text-primary'>Amazon Listing:</h5>
          <p className='fs-4 fw-bold text-black'>{showMappedListingModal.listingSku}</p>
          <Col md={12}>
            <p className='fw-semibold fs-6'>Map to Product</p>
            <Select_Product_Mapped data={data || []} showMappedListingModal={showMappedListingModal} setshowMappedListingModal={setshowMappedListingModal} />
          </Col>
          <Row md={12} className='mt-3'>
            <div className='text-end mt-2 d-flex flex-row gap-4 justify-content-between'>
              <Button disabled={loading} type='button' color='danger' className='btn' onClick={handleUnMappedProduct}>
                <i className='las la-unlink fs-5 text-white m-0 p-0 me-1' />
                {loading ? <Spinner color='#fff' size={'sm'} /> : 'UnMap'}
              </Button>
              <div className='d-flex flex-row gap-3'>
                <Button
                  disabled={loading}
                  type='button'
                  color='light'
                  className='btn'
                  onClick={() => {
                    setshowMappedListingModal({
                      show: false,
                      listingSku: '',
                      listingId: 0,
                      shelfCloudSku: '',
                      shelfCloudSkuId: 0,
                    })
                  }}>
                  Cancel
                </Button>
                <Button disabled={loading} type='button' color='success' className='btn' onClick={handleSaveMappedProduct}>
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
