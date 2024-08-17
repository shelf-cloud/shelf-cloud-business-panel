import { AmazonFulfillmentSku, FilterProps } from '@typesTs/amazon/fulfillments'
import React, { useEffect, useMemo, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'
import { Button } from 'reactstrap'
import MasterBoxesTable from './MasterBoxesTable'
import FilterListings from './FilterListings'
import { useRouter } from 'next/router'
import CreateInboundPlanModal from '@components/modals/amazon/CreateInboundPlanModal'

type Props = {
  lisiting: AmazonFulfillmentSku[]
  pending: boolean
}

const MasterBoxesFulfillment = ({ lisiting, pending }: Props) => {
  const router = useRouter()
  const { filters, showHidden, showNotEnough, ShowNoShipDate }: FilterProps = router.query
  const [allData, setAllData] = useState<AmazonFulfillmentSku[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])
  const [showCreateInboundPlanModal, setShowCreateInboundPlanModal] = useState<boolean>(false)

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
          (showNotEnough === undefined || showNotEnough === ''
            ? item.maxOrderQty === 0
              ? false
              : true
            : showNotEnough === 'false'
            ? item.maxOrderQty === 0
              ? false
              : true
            : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true)
      )
    }

    if (searchValue !== '') {
      return allData.filter(
        (item: AmazonFulfillmentSku) =>
          (showHidden === undefined || showHidden === '' ? Boolean(item.show) : showHidden === 'false' ? Boolean(item.show) : true) &&
          (showNotEnough === undefined || showNotEnough === ''
            ? item.maxOrderQty === 0
              ? false
              : true
            : showNotEnough === 'false'
            ? item.maxOrderQty === 0
              ? false
              : true
            : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true) &&
          (item?.product_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.product_name?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
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
      <div className='d-flex justify-content-between align-center mt-0 mb-1'>
        <div>
          <p className='m-0 p-0 fs-5 fw-semibold text-primary'>Total SKUs in Order: {orderProducts.length}</p>
          <p className='m-0 p-0 fs-6 fw-normal text-primary'>
            Total Quantity to Ship in Order: {orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.totalSendToAmazon), 0)}
          </p>
        </div>
        <div>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-6 btn' color='primary' onClick={() => setShowCreateInboundPlanModal(true)}>
            Create Inbound Plan
          </Button>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center mt-0 mb-1'>
        <FilterListings
          filters={filters !== undefined || filters === '' ? filters : 'false'}
          showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
          showNotEnough={showNotEnough !== undefined || showNotEnough === '' ? showNotEnough : 'false'}
          ShowNoShipDate={ShowNoShipDate !== undefined || ShowNoShipDate === '' ? ShowNoShipDate : 'false'}
        />
        <div className='col-sm-12 col-md-3'>
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
      </div>
      <MasterBoxesTable allData={allData} filteredItems={filteredItems} setAllData={setAllData} pending={pending} setError={setError} setHasQtyError={setHasQtyError} />
      {showCreateInboundPlanModal && (
        <CreateInboundPlanModal
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateInboundPlanModal}
        />
      )}
    </>
  )
}

export default MasterBoxesFulfillment
