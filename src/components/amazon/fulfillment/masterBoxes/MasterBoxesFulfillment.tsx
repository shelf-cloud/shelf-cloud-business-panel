import { AmazonFulfillmentSku, AmzDimensions, Dimensions, FilterProps } from '@typesTs/amazon/fulfillments'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'
import { Button, Col, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap'
import MasterBoxesTable from './MasterBoxesTable'
import FilterListings from '../FilterListings'
import { useRouter } from 'next/router'
import AmazonFulfillmentDimensions from '@components/modals/amazon/AmazonFulfillmentDimensions'
import CreateMastBoxesInboundPlanModal from '@components/modals/amazon/CreateMastBoxesInboundPlanModal'
import CreateMastBoxesInboundPlanModalManual from '@components/modals/amazon/CreateMastBoxesInboundPlanModalManual'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'

type Props = {
  lisiting: AmazonFulfillmentSku[]
  pending: boolean
  sessionToken: string
  mutateLink: string
}

const MasterBoxesFulfillment = ({ lisiting, pending, sessionToken, mutateLink }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { filters, showHidden, showNotEnough, ShowNoShipDate, masterBoxVisibility }: FilterProps = router.query
  const [allData, setAllData] = useState<AmazonFulfillmentSku[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<AmazonFulfillmentSku[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [hasQtyError, setHasQtyError] = useState(false)
  const [error, setError] = useState([])
  const [showCreateInboundPlanModal, setShowCreateInboundPlanModal] = useState<boolean>(false)
  const [showCreateManualInboundPlanModal, setShowCreateManualInboundPlanModal] = useState<boolean>(false)
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
            ? item.maxOrderQty <= 0
              ? false
              : true
            : showNotEnough === 'false'
            ? item.maxOrderQty <= 0
              ? false
              : true
            : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true) &&
          (masterBoxVisibility === undefined || masterBoxVisibility === '' ? item.showForMasterBoxes : masterBoxVisibility === 'false' ? item.showForMasterBoxes : true)
      )
    }

    if (searchValue !== '') {
      return allData.filter(
        (item: AmazonFulfillmentSku) =>
          (showHidden === undefined || showHidden === '' ? Boolean(item.show) : showHidden === 'false' ? Boolean(item.show) : true) &&
          (showNotEnough === undefined || showNotEnough === ''
            ? item.maxOrderQty <= 0
              ? false
              : true
            : showNotEnough === 'false'
            ? item.maxOrderQty <= 0
              ? false
              : true
            : true) &&
          (ShowNoShipDate === undefined || ShowNoShipDate === '' ? Boolean(item.recommendedShipDate) : ShowNoShipDate === 'false' ? Boolean(item.recommendedShipDate) : true) &&
          (masterBoxVisibility === undefined || masterBoxVisibility === '' ? item.showForMasterBoxes : masterBoxVisibility === 'false' ? item.showForMasterBoxes : true) &&
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
  }, [allData, searchValue, showHidden, showNotEnough, ShowNoShipDate, masterBoxVisibility])

  const orderProducts = useMemo(() => {
    return allData.filter((item: AmazonFulfillmentSku) => Number(item?.orderQty) > 0)
  }, [allData])

  const changeSelectedMasterBoxVisibility = async (visibility: boolean) => {
    if (selectedRows.length <= 0) return

    const changeMasterBoxVisibility = toast.loading('Changing visibility...')

    const response = await axios.post(`/api/amazon/fullfilments/masterBoxes/changeMasterBoxVisibility?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      visibility,
      selectedRows: selectedRows.map((row) => {
        return { inventoryId: row.inventoryId, isKit: row.isKit }
      }),
    })
    if (!response.data.error) {
      setToggleClearRows(!toggledClearRows)
      setSelectedRows([])
      toast.update(changeMasterBoxVisibility, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutate(mutateLink)
    } else {
      toast.update(changeMasterBoxVisibility, {
        render: response.data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  return (
    <>
      <Row className='justify-content-between gap-2'>
        <Col xs='12' lg='6' className='d-flex justify-content-start align-items-center gap-3'>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-6 btn' color='success' onClick={() => setShowCreateInboundPlanModal(true)}>
            Create Inbound Plan
          </Button>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-6 btn' color='secondary' onClick={() => setShowCreateManualInboundPlanModal(true)}>
            Create Manual Inbound Plan
          </Button>
          <FilterListings
            filters={filters !== undefined || filters === '' ? filters : 'false'}
            showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
            showNotEnough={showNotEnough !== undefined || showNotEnough === '' ? showNotEnough : 'false'}
            ShowNoShipDate={ShowNoShipDate !== undefined || ShowNoShipDate === '' ? ShowNoShipDate : 'false'}
            masterBoxVisibility={masterBoxVisibility !== undefined || masterBoxVisibility === '' ? masterBoxVisibility : 'false'}
          />
          <UncontrolledButtonDropdown>
            <DropdownToggle className='btn btn-info fs-6 py-2' caret>
              Bulk Actions
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Master Box Visibility</DropdownItem>
              <DropdownItem className='text-nowrap fs-7' onClick={() => changeSelectedMasterBoxVisibility(false)}>
                <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2' />
                Hide Selected
              </DropdownItem>
              <DropdownItem className='text-nowrap fs-7' onClick={() => changeSelectedMasterBoxVisibility(true)}>
                <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                Show Selected
              </DropdownItem>
              <DropdownItem className='text-nowrap text-end fs-7 text-muted' onClick={clearAllSelectedRows}>
                Clear All
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
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
      <MasterBoxesTable
        allData={allData}
        filteredItems={filteredItems}
        setAllData={setAllData}
        pending={pending}
        setError={setError}
        setHasQtyError={setHasQtyError}
        setdimensionsModal={setdimensionsModal}
        setSelectedRows={setSelectedRows}
        toggledClearRows={toggledClearRows}
      />
      {showCreateInboundPlanModal && (
        <CreateMastBoxesInboundPlanModal
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateInboundPlanModal}
          setAllData={setAllData}
          sessionToken={sessionToken}
        />
      )}
      {showCreateManualInboundPlanModal && (
        <CreateMastBoxesInboundPlanModalManual
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateManualInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateManualInboundPlanModal}
          sessionToken={sessionToken}
        />
      )}
      {dimensionsModal.show && <AmazonFulfillmentDimensions dimensionsModal={dimensionsModal} setdimensionsModal={setdimensionsModal} />}
    </>
  )
}

export default MasterBoxesFulfillment
