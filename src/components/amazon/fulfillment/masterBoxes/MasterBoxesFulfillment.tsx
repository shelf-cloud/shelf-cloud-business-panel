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
import { toast } from '@/lib/toast'
import { ChevronDownIcon } from 'lucide-react'
import { Button, buttonVariants } from '@shadcn/ui/button'
import { cn } from '@/lib/shadcn/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

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
  const [hasInputError, setHasInputError] = useState(false)
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
          ((showHidden === undefined || showHidden === '' ? Boolean(item.show) : showHidden === 'false' ? Boolean(item.show) : true) &&
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
              item?.fnsku?.toLowerCase().includes(searchValue.toLowerCase()))) ||
          (item.children
            ? item?.children?.some(
                (child) =>
                  searchValue.split(' ').every((word) => child?.title?.toLowerCase().includes(word.toLowerCase())) || child?.sku?.toLowerCase().includes(searchValue.toLowerCase())
              )
            : false)
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
      <div className='flex flex-wrap -mx-3 justify-between gap-0'>
        <div className='px-3 w-full lg:w-2/3 flex flex-wrap justify-start items-center gap-2'>
          <Button
            disabled={orderProducts.length === 0 || hasInputError || hasQtyError}
            className='text-[11.2px] text-nowrap'
            variant='success'
            onClick={() => setShowCreateInboundPlanModal(true)}>
            Create Inbound Plan
          </Button>
          <Button
            disabled={orderProducts.length === 0 || hasInputError || hasQtyError}
            className='text-[11.2px] text-nowrap'
            variant='secondary'
            onClick={() => setShowCreateManualInboundPlanModal(true)}>
            Create Manual Inbound Plan
          </Button>
          <FilterListings
            filters={filters !== undefined || filters === '' ? filters : 'false'}
            showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
            showNotEnough={showNotEnough !== undefined || showNotEnough === '' ? showNotEnough : 'false'}
            ShowNoShipDate={ShowNoShipDate !== undefined || ShowNoShipDate === '' ? ShowNoShipDate : 'false'}
            masterBoxVisibility={masterBoxVisibility !== undefined || masterBoxVisibility === '' ? masterBoxVisibility : 'false'}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type='button' className={cn(buttonVariants({ variant: 'info' }), 'text-[11.2px] py-2')}>
                Bulk Actions
                <ChevronDownIcon className='ml-1 size-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuLabel>Master Box Visibility</DropdownMenuLabel>
              <DropdownMenuItem className='text-nowrap text-[11.2px]' onClick={() => changeSelectedMasterBoxVisibility(false)}>
                <i className='mdi mdi-eye-off label-icon align-middle text-[16.25px] me-2' />
                Hide Selected
              </DropdownMenuItem>
              <DropdownMenuItem className='text-nowrap text-[11.2px]' onClick={() => changeSelectedMasterBoxVisibility(true)}>
                <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2' />
                Show Selected
              </DropdownMenuItem>
              <DropdownMenuItem className='text-nowrap text-right text-[11.2px] text-muted-foreground' onClick={clearAllSelectedRows}>
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='px-3 w-full lg:w-1/3 flex justify-end items-center'>
          <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' minLength={3} debounceTimeout={300} widths='col-12' />
        </div>
      </div>
      <div className='flex justify-start items-center gap-4 mt-4'>
        <p className='m-0 p-0'>
          Total SKUs: <span className='font-semibold text-primary'>{orderProducts.length}</span>
        </p>
        <p className='m-0 p-0'>
          Total Item Quantities:{' '}
          <span className='font-semibold text-primary'>{orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.totalSendToAmazon), 0)}</span>
        </p>
      </div>
      <MasterBoxesTable
        allData={allData}
        filteredItems={filteredItems}
        setAllData={handleSetAllData}
        pending={pending}
        setHasInputError={setHasInputError}
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
