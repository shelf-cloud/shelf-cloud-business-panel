import { useRouter } from 'next/router'
import { useContext, useMemo, useState } from 'react'

import AmazonFulfillmentDimensions from '@components/modals/amazon/AmazonFulfillmentDimensions'
import CreateMastBoxesInboundPlanModal from '@components/modals/amazon/CreateMastBoxesInboundPlanModal'
import CreateMastBoxesInboundPlanModalManual from '@components/modals/amazon/CreateMastBoxesInboundPlanModalManual'
import InboundFBAHistoryModal from '@components/modals/amazon/InboundFBAHistoryModal'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { AmazonFulfillmentSku, AmzDimensions, Dimensions, FBAShipmentHisotry, FilterProps } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'

import FilterListings from '../FilterListings'
import MasterBoxesTable from './MasterBoxesTable'

type Props = {
  lisiting: AmazonFulfillmentSku[]
  pending: boolean
  mutateFBASkus: () => void
}

const MasterBoxesFulfillment = ({ lisiting, pending, mutateFBASkus }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { filters, showHidden, showNotEnough, ShowNoShipDate, masterBoxVisibility }: FilterProps = router.query
  const [editedState, setEditedState] = useState<{ source: AmazonFulfillmentSku[]; data: AmazonFulfillmentSku[] } | null>(null)
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
      mutateFBASkus()
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
      <Row className='justify-content-between gap-0'>
        <Col xs='12' lg='8' className='d-flex flex-wrap justify-content-start align-items-center gap-2'>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-7 text-nowrap' color='success' onClick={() => setShowCreateInboundPlanModal(true)}>
            Create Inbound Plan
          </Button>
          <Button disabled={error.length > 0 || hasQtyError} className='fs-7 text-nowrap' color='secondary' onClick={() => setShowCreateManualInboundPlanModal(true)}>
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
            <DropdownToggle className='btn btn-info fs-7 py-2' caret>
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
          <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' minLength={3} debounceTimeout={300} widths='col-12' />
        </Col>
      </Row>
      <div className='d-flex justify-content-start align-items-center gap-3 mt-3'>
        <p className='m-0 p-0'>
          Total SKUs: <span className='fw-semibold text-primary'>{orderProducts.length}</span>
        </p>
        <p className='m-0 p-0'>
          Total Item Quantities:{' '}
          <span className='fw-semibold text-primary'>{orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.totalSendToAmazon), 0)}</span>
        </p>
      </div>
      <MasterBoxesTable
        allData={allData}
        filteredItems={filteredItems}
        setAllData={handleSetAllData}
        pending={pending}
        setError={setError}
        setHasQtyError={setHasQtyError}
        setdimensionsModal={setdimensionsModal}
        setSelectedRows={setSelectedRows}
        toggledClearRows={toggledClearRows}
        setinboundFBAHistoryModal={setinboundFBAHistoryModal}
      />
      {showCreateInboundPlanModal && (
        <CreateMastBoxesInboundPlanModal
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateInboundPlanModal}
          setAllData={handleSetAllData}
        />
      )}
      {showCreateManualInboundPlanModal && (
        <CreateMastBoxesInboundPlanModalManual
          orderProducts={orderProducts}
          showCreateInboundPlanModal={showCreateManualInboundPlanModal}
          setShowCreateInboundPlanModal={setShowCreateManualInboundPlanModal}
        />
      )}
      {dimensionsModal.show && <AmazonFulfillmentDimensions dimensionsModal={dimensionsModal} setdimensionsModal={setdimensionsModal} />}
      {inboundFBAHistoryModal.show && <InboundFBAHistoryModal inboundFBAHistoryModal={inboundFBAHistoryModal} setinboundFBAHistoryModal={setinboundFBAHistoryModal} />}
    </>
  )
}

export default MasterBoxesFulfillment
