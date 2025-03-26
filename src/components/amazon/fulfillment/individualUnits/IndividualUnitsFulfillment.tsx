import { AmazonFulfillmentSku, AmzDimensions, Dimensions, FBAShipmentHisotry, FilterProps } from '@typesTs/amazon/fulfillments'
import React, { useEffect, useMemo, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'
import { Button, Col, Row } from 'reactstrap'
import { useRouter } from 'next/router'
import AmazonFulfillmentDimensions from '@components/modals/amazon/AmazonFulfillmentDimensions'
import FilterListings from '../FilterListings'
import IndividualUnitsTable from './IndividualUnitsTable'
import CreateIndvUnitsInboundPlanModal from '@components/modals/amazon/CreateIndvUnitsInboundPlanModal'
import InboundFBAHistoryModal from '@components/modals/amazon/InboundFBAHistoryModal'

type Props = {
  lisiting: AmazonFulfillmentSku[]
  pending: boolean
  sessionToken: string
}

const IndividualUnitsFulfillment = ({ lisiting, pending, sessionToken }: Props) => {
  const router = useRouter()
  const { filters, showHidden, showNotEnough, ShowNoShipDate }: FilterProps = router.query
  const [allData, setAllData] = useState<AmazonFulfillmentSku[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])
  const [showCreateInboundPlanModal, setShowCreateInboundPlanModal] = useState<boolean>(false)
  const [dimensionsModal, setdimensionsModal] = useState({
    show: false,
    inventoryId: 0,
    isKit: false,
    msku: '',
    asin: '',
    scSKU: '',
    boxQty: 0,
    shelfCloudDimensions: {} as AmzDimensions,
    amazonDimensions: {} as Dimensions,
  })
  const [inboundFBAHistoryModal, setinboundFBAHistoryModal] = useState({
    show: false,
    sku: '',
    msku: '',
    shipments: [] as FBAShipmentHisotry[],
  })

  useEffect(() => {
    if (!pending) {
      setAllData(JSON.parse(JSON.stringify(lisiting)))
    }
  }, [pending, lisiting])

  const filteredItems = useMemo(() => {
    if (searchValue === '') {
      return allData.filter(
        (item: AmazonFulfillmentSku) =>
          (showHidden === undefined || showHidden === '' ? Boolean(item.show) : showHidden === 'false' ? Boolean(item.show) : true) &&
          (showNotEnough === undefined || showNotEnough === '' ? (item.quantity <= 0 ? false : true) : showNotEnough === 'false' ? (item.quantity <= 0 ? false : true) : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true)
      )
    }

    if (searchValue !== '') {
      return allData.filter(
        (item: AmazonFulfillmentSku) =>
          (showHidden === undefined || showHidden === '' ? Boolean(item.show) : showHidden === 'false' ? Boolean(item.show) : true) &&
          (showNotEnough === undefined || showNotEnough === '' ? (item.quantity <= 0 ? false : true) : showNotEnough === 'false' ? (item.quantity <= 0 ? false : true) : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true) &&
          (item?.product_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.product_name?.toLowerCase().includes(word.toLowerCase())) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.sku?.toLowerCase().includes(word.toLowerCase())) ||
            item?.shelfcloud_sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.barcode?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.fnsku?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return []
  }, [allData, searchValue, showHidden, showNotEnough, ShowNoShipDate])

  const orderProducts = useMemo(() => {
    return allData.filter((item: AmazonFulfillmentSku) => Number(item?.orderQty) > 0)
  }, [allData])

  return (
    <>
      <Row className='justify-content-between gap-2'>
        <Col xs='12' lg='6' className='d-flex justify-content-start align-items-center gap-2'>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-7 text-nowrap' color='success' onClick={() => setShowCreateInboundPlanModal(true)}>
            Create Inbound Plan
          </Button>
          <FilterListings
            filters={filters !== undefined || filters === '' ? filters : 'false'}
            showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
            showNotEnough={showNotEnough !== undefined || showNotEnough === '' ? showNotEnough : 'false'}
            ShowNoShipDate={ShowNoShipDate !== undefined || ShowNoShipDate === '' ? ShowNoShipDate : 'false'}
          />
        </Col>
        <Col xs='12' lg='4' className='d-flex justify-content-end align-items-center'>
          <div className='flex-1'>
            <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
              <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                <DebounceInput
                  type='text'
                  minLength={3}
                  debounceTimeout={300}
                  className='form-control fs-6 bg-light pe-1'
                  placeholder='Search...'
                  id='search-options'
                  value={searchValue}
                  onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                <span
                  className='d-flex align-items-center justify-content-center bg-light'
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => setSearchValue('')}>
                  <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <div className='d-flex justify-content-start align-items-center gap-3 mt-3'>
        <p className='m-0 p-0 text-primary text-uppercase'>
          Total SKUs: <span className='fw-bold'>{orderProducts.length}</span>
        </p>
        <p className='m-0 p-0 text-primary text-uppercase'>
          Total Item Quantities: <span className='fw-bold'>{orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.totalSendToAmazon), 0)}</span>
        </p>
      </div>
      <IndividualUnitsTable
        allData={allData}
        filteredItems={filteredItems}
        setAllData={setAllData}
        pending={pending}
        setError={setError}
        setHasQtyError={setHasQtyError}
        setinboundFBAHistoryModal={setinboundFBAHistoryModal}
      />
      {showCreateInboundPlanModal && (
        <CreateIndvUnitsInboundPlanModal
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateInboundPlanModal}
          setAllData={setAllData}
          sessionToken={sessionToken}
        />
      )}
      {dimensionsModal.show && <AmazonFulfillmentDimensions dimensionsModal={dimensionsModal} setdimensionsModal={setdimensionsModal} />}
      {inboundFBAHistoryModal.show && <InboundFBAHistoryModal inboundFBAHistoryModal={inboundFBAHistoryModal} setinboundFBAHistoryModal={setinboundFBAHistoryModal} />}
    </>
  )
}

export default IndividualUnitsFulfillment
