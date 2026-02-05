import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import AmazonFulfillmentDimensions from '@components/modals/amazon/AmazonFulfillmentDimensions'
import CreateIndvUnitsInboundPlanModal from '@components/modals/amazon/CreateIndvUnitsInboundPlanModal'
import InboundFBAHistoryModal from '@components/modals/amazon/InboundFBAHistoryModal'
import SearchInput from '@components/ui/SearchInput'
import { AmazonFulfillmentSku, AmzDimensions, Dimensions, FBAShipmentHisotry, FilterProps } from '@typesTs/amazon/fulfillments'
import { Button, Col, Row } from 'reactstrap'

import FilterListings from '../FilterListings'
import IndividualUnitsTable from './IndividualUnitsTable'

type Props = {
  lisiting: AmazonFulfillmentSku[]
  pending: boolean
}

const IndividualUnitsFulfillment = ({ lisiting, pending }: Props) => {
  const router = useRouter()
  const { filters, showHidden, showNotEnough, ShowNoShipDate }: FilterProps = router.query
  const [editedState, setEditedState] = useState<{ source: AmazonFulfillmentSku[]; data: AmazonFulfillmentSku[] } | null>(null)
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

  const baseData = useMemo(() => {
    if (pending) return [] as AmazonFulfillmentSku[]
    return JSON.parse(JSON.stringify(lisiting)) as AmazonFulfillmentSku[]
  }, [pending, lisiting])

  const allData = useMemo(() => {
    if (editedState && editedState.source === lisiting) return editedState.data
    return baseData
  }, [editedState, lisiting, baseData])

  const handleSetAllData = (updater: AmazonFulfillmentSku[] | ((prev: AmazonFulfillmentSku[]) => AmazonFulfillmentSku[])) => {
    setEditedState((prev) => {
      const previousData = prev && prev.source === lisiting ? prev.data : baseData
      const nextData = typeof updater === 'function' ? updater(previousData) : updater
      return { source: lisiting, data: nextData }
    })
  }

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
      <Row className='justify-content-between gap-0'>
        <Col xs='12' lg='8' className='d-flex flex-wrap justify-content-start align-items-center gap-2'>
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
          <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' minLength={3} debounceTimeout={300} widths='col-12' />
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
        setAllData={handleSetAllData}
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
          setAllData={handleSetAllData}
        />
      )}
      {dimensionsModal.show && <AmazonFulfillmentDimensions dimensionsModal={dimensionsModal} setdimensionsModal={setdimensionsModal} />}
      {inboundFBAHistoryModal.show && <InboundFBAHistoryModal inboundFBAHistoryModal={inboundFBAHistoryModal} setinboundFBAHistoryModal={setinboundFBAHistoryModal} />}
    </>
  )
}

export default IndividualUnitsFulfillment
