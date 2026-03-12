import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import FilterByDates from '@components/FilterByDates'
import ReorderingPointsCreatePOModal from '@components/modals/reorderingPoints/ReorderingPointsCreatePOModal'
import ReorderingPointsPromptModal from '@components/modals/reorderingPoints/ReorderingPointsPromtpModal'
import ReorderingPointsSalesModal from '@components/modals/reorderingPoints/ReorderingPointsSalesModal'
import InputModal from '@components/modals/shared/inputModal'
import RPEditProductConfigOffCanvas from '@components/reorderingPoints/RPEditProductConfigOffCanvas'
import ReorderingPointsSettings from '@components/reorderingPoints/ReorderingPointsSettings'
import ReorderingPointsSummary from '@components/reorderingPoints/ReorderingPointsSummary'
import ReorderingPointsTable from '@components/reorderingPoints/ReorderingPointsTable'
import FilterReorderingPoints from '@components/ui/FilterReorderingPoints'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { useMarketplaces } from '@hooks/marketplaces/useMarketplaces'
import { useRPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { useRPProductsInfo } from '@hooks/reorderingPoints/useRPProductsInfo'
import { useRPSplits } from '@hooks/reorderingPoints/useRPSplits'
import { useInputModal } from '@hooks/ui/useInputModal'
import { Button as ShadcnButton } from '@shadcn/ui/button'
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenu as ShadcnDropdownMenu } from '@shadcn/ui/dropdown-menu'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { ChevronDownIcon } from 'lucide-react'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Card, CardBody, Collapse, Container, Row } from 'reactstrap'

import RPAIForecastDrawer from '@/features/reordering-points/RPAIForecastDrawer'
import RPBulkProductTrendTagDialog from '@/features/reordering-points/RPBulkProductTrendTagDialog'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)
  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      businessName: string
      businessOrderStart: string
    }
  }
}

type FilterProps = {
  filters?: string
  urgency?: string
  grossmin?: string
  grossmax?: string
  profitmin?: string
  profitmax?: string
  unitsrange?: string
  unitsmin?: string
  unitsmax?: string
  supplier?: string
  brand?: string
  category?: string
  showHidden?: string
  trendTag?: string
  // show0Days?: string
}

type SelectedSupplierState = {
  key: boolean
  value: string
}

const ReorderingPoints = ({ session }: Props) => {
  const { state } = useContext(AppContext)
  const router = useRouter()
  const { filters, urgency, grossmin, grossmax, profitmin, profitmax, unitsrange, unitsmin, unitsmax, supplier, brand, category, trendTag, showHidden }: FilterProps = router.query
  const [startDate, setStartDate] = useState(moment().subtract(15, 'days').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [setField, setsetField] = useState('urgency')
  const [sortingDirectionAsc, setsortingDirectionAsc] = useState(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [splits, setsplits] = useState({ isSplitting: false, splitsQty: 2 })

  // PRODUCTS INFO
  const {
    completeProductData,
    productsData,
    isLoadingProductsData,
    handleOrderQty,
    handleSplitsOrderQty,
    handleUseAdjustedQty,
    handleNewVisibilityState,
    handleSaveProductConfig,
    handleRegenerateForecast,
    handleUrgencyRange,
    handleSaveProductsTrendTagBulk,
    handleSaveProductTrendTag,
  } = useRPProductsInfo({
    session,
    state,
    startDate,
    endDate,
    searchValue,
    urgency,
    grossmin,
    grossmax,
    profitmin,
    profitmax,
    unitsrange,
    unitsmin,
    unitsmax,
    supplier,
    brand,
    category,
    trendTag,
    showHidden,
    setField,
    sortingDirectionAsc,
    isSplitting: splits.isSplitting,
  })
  // PRODUCTS CONFIG
  const { rpProductConfig, setRPProductConfig } = useRPProductConfig()
  // GET MARKETPLACES
  const { suppliers, brands, categories } = useMarketplaces()
  const { splitNames, saveNewSplitName } = useRPSplits()

  const { isOpen, isLoading, value, setValue, setValuesAndOpen, handleSubmit, closeModal } = useInputModal({
    onSubmit: async (value) => {
      await saveNewSplitName(value.id, value.text)
    },
    initialValue: { id: '', text: '' },
  })

  const [selectedSupplierState, setSelectedSupplierState] = useState<SelectedSupplierState>({ key: false, value: '' })
  const [filterOpen, setFilterOpen] = useState(false)
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [selectedRows, setSelectedRows] = useState<ReorderingPointsProduct[]>([])
  const [error, setError] = useState<string[]>([])
  const [salesModal, setSalesModal] = useState({
    showSalesModal: false,
    sku: '',
    title: '',
    totalUnitsSold: {},
    marketplaces: {},
  })
  const [promptModal, setPromptModal] = useState({
    show: false,
  })

  const [showPOModal, setshowPOModal] = useState(false)
  const [aiForecastProduct, setAIForecastProduct] = useState<ReorderingPointsProduct | null>(null)
  const [isBulkTrendTagDialogOpen, setIsBulkTrendTagDialogOpen] = useState(false)

  // FILTER FUNCTIONS
  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
      return
    }
  }

  const handleApplyFilters = useCallback(
    (
      urgency: string,
      grossmin: string,
      grossmax: string,
      profitmin: string,
      profitmax: string,
      unitsrange: string,
      unitsmin: string,
      unitsmax: string,
      supplier: string,
      brand: string,
      category: string,
      trendTag: string,
      showHidden: string
      // show0Days: string
    ) => {
      let filterString = `/reorderingPoints?filters=true`
      if (urgency || urgency !== '') filterString += `&urgency=${urgency}`
      if (grossmin || grossmin !== '') filterString += `&grossmin=${grossmin}`
      if (grossmax || grossmax !== '') filterString += `&grossmax=${grossmax}`
      if (profitmin || profitmin !== '') filterString += `&profitmin=${profitmin}`
      if (profitmax || profitmax !== '') filterString += `&profitmax=${profitmax}`
      if (unitsrange || unitsrange !== '') filterString += `&unitsrange=${unitsrange}`
      if (unitsmin || unitsmin !== '') filterString += `&unitsmin=${unitsmin}`
      if (unitsmax || unitsmax !== '') filterString += `&unitsmax=${unitsmax}`
      if (supplier || supplier !== '') filterString += `&supplier=${supplier}`
      if (brand || brand !== '') filterString += `&brand=${brand}`
      if (category || category !== '') filterString += `&category=${category}`
      if (trendTag || trendTag !== '') filterString += `&trendTag=${trendTag}`
      if (showHidden || showHidden !== '') filterString += `&showHidden=${showHidden}`
      // if (show0Days || show0Days !== '') filterString += `&show0Days=${show0Days}`
      router.push(filterString, undefined, { shallow: true })
      setFilterOpen(false)
    },
    [router]
  )

  // TABLE FUNCTIONS
  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const handleSetSorting = (field: string) => {
    setsetField(field)
    setsortingDirectionAsc(!sortingDirectionAsc)
  }

  // ACTIONS
  const changeSelectedProductsState = useCallback(
    async (newState: boolean) => {
      if (selectedRows.length <= 0) return

      const confirmationResponse = confirm(`Are you sure you want to ${newState ? 'Hide' : 'Show'} Selected Products?`)

      if (confirmationResponse) {
        const response = await axios.post(`/api/reorderingPoints/setNewShowingStatusReorderingPoints?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          newState,
          selectedRows: selectedRows.map((item) => {
            return {
              inventoryId: item.inventoryId,
              sku: item.sku,
            }
          }),
        })
        if (!response.data.error) {
          setToggleClearRows(!toggledClearRows)
          setSelectedRows([])
          toast.success(response.data.msg)
          await handleNewVisibilityState(selectedRows, newState)
        } else {
          toast.error(response.data.msg)
        }
      }
    },
    [handleNewVisibilityState, selectedRows, state.currentRegion, state.user.businessId, toggledClearRows]
  )

  // REORDERING POINTS ORDER SUMMARY
  const reorderingPointsOrder = useMemo(() => {
    const orderSummary = { totalQty: 0, totalCost: 0, totalVolume: 0, products: {} } as {
      totalQty: number
      totalCost: number
      totalVolume: number
      products: { [key: string]: ReorderingPointsProduct }
    }
    if (!completeProductData || Object.values(completeProductData).length === 0) {
      return orderSummary
    }

    for (const item of Object.values(completeProductData)) {
      if (item.order <= 0) continue
      orderSummary.totalQty += item.useOrderAdjusted ? item.orderAdjusted : item.order
      orderSummary.totalCost += item.useOrderAdjusted ? item.orderAdjusted * item.sellerCost : item.order * item.sellerCost
      orderSummary.totalVolume += item.useOrderAdjusted ? item.orderAdjusted * item.itemVolume : item.order * item.itemVolume
      orderSummary.products[item.sku] = item
    }

    return orderSummary
  }, [completeProductData])

  const hasOrderProducts = Boolean(completeProductData && Object.values(completeProductData).length > 0 && reorderingPointsOrder.totalQty > 0)
  const selectedSupplier = selectedSupplierState.key === hasOrderProducts ? selectedSupplierState.value : ''
  const setSelectedSupplier = useCallback(
    (value: string) => {
      setSelectedSupplierState({ key: hasOrderProducts, value })
    },
    [hasOrderProducts]
  )

  const orderHasSplitswithZeroQty = useMemo(() => {
    if (splits.isSplitting) {
      for (const product of Object.values(reorderingPointsOrder.products)) {
        for (let i = 0; i < splits.splitsQty; i++) {
          if (product.orderSplits[`${i}`] === undefined || product.orderSplits[`${i}`]?.order <= 0) {
            return true
          }
        }
      }
      return false
    } else {
      return false
    }
  }, [splits, reorderingPointsOrder])

  const title = `Reordering Points | ${session?.user?.businessName}`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Reordering Points' pageTitle='Inbound' />
          <Container fluid>
            <ReorderingPointsSummary
              reorderingPointsOrder={reorderingPointsOrder}
              selectedSupplier={selectedSupplier}
              error={error}
              orderHasSplitswithZeroQty={orderHasSplitswithZeroQty}
              setshowPOModal={setshowPOModal}
              splits={splits}
              splitNames={splitNames}
            />
            <Row className='d-flex flex-column justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='d-flex flex-column justify-content-between align-items-start p-0 flex-md-row align-items-md-center gap-2'>
                <div className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2 w-100'>
                  <ShadcnButton variant={filters === 'true' ? 'default' : 'light'} onClick={() => setFilterOpen(!filterOpen)}>
                    Filters
                    <ChevronDownIcon className='tw:size-3' />
                  </ShadcnButton>
                  <FilterByDates
                    shipmentsStartDate={startDate}
                    setShipmentsStartDate={setStartDate}
                    setShipmentsEndDate={setEndDate}
                    shipmentsEndDate={endDate}
                    handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                  />
                  {state?.user?.us && (
                    <>
                      <ReorderingPointsSettings
                        initialHighAlert={state?.user?.us?.rphighAlertMax}
                        initialMediumAlert={state?.user?.us?.rpmediumAlertMax}
                        initialLowAlert={state?.user?.us?.rplowAlertMax}
                        handleUrgencyRange={handleUrgencyRange}
                        canSplit={state?.user?.us?.rpCanSplit}
                        splits={splits}
                        setsplits={setsplits}
                      />
                      {state.user.us.canEditPrompt ? (
                        <ShadcnButton onClick={() => setPromptModal({ show: true })} className='d-flex flex-row justify-content-start align-items-center gap-1'>
                          <i className='las la-brain fs-4 m-0 p-0' />
                          Prompt
                        </ShadcnButton>
                      ) : null}
                    </>
                  )}
                  {selectedRows.length > 0 && (
                    <ShadcnDropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ShadcnButton>
                          {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                          <ChevronDownIcon className='tw:size-3' />
                        </ShadcnButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => setIsBulkTrendTagDialogOpen(true)}>
                            <i className='las la-chart-line fs-5 text-info' />
                            Set Product Trend Tag
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeSelectedProductsState(false)}>
                            <i className='mdi mdi-eye fs-5 text-primary' />
                            Set Visible
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeSelectedProductsState(true)}>
                            <i className='mdi mdi-eye-off fs-5 text-danger' />
                            Hide Selected
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={clearAllSelectedRows}>Clear</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </ShadcnDropdownMenu>
                  )}
                </div>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={3} />
              </div>
              <Collapse className='px-0' isOpen={filterOpen}>
                <FilterReorderingPoints
                  urgency={urgency !== undefined ? urgency : '[]'}
                  grossmin={grossmin !== undefined ? grossmin : ''}
                  grossmax={grossmax !== undefined ? grossmax : ''}
                  profitmin={profitmin !== undefined ? profitmin : ''}
                  profitmax={profitmax !== undefined ? profitmax : ''}
                  unitsrange={unitsrange !== undefined ? unitsrange : '30D'}
                  unitsmin={unitsmin !== undefined ? unitsmin : ''}
                  unitsmax={unitsmax !== undefined ? unitsmax : ''}
                  supplier={supplier !== undefined ? supplier : ''}
                  brand={brand !== undefined ? brand : ''}
                  category={category !== undefined ? category : ''}
                  trendTag={trendTag !== undefined ? trendTag : ''}
                  showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
                  // show0Days={show0Days !== undefined || show0Days === '' ? show0Days : 'false'}
                  supplierOptions={suppliers}
                  brandOptions={brands}
                  categoryOptions={categories}
                  handleApplyFilters={handleApplyFilters}
                  setFilterOpen={setFilterOpen}
                />
              </Collapse>
            </Row>
            <Card>
              <CardBody>
                <ReorderingPointsTable
                  filterDataTable={productsData}
                  pending={isLoadingProductsData}
                  handleOrderQty={handleOrderQty}
                  handleSplitsOrderQty={handleSplitsOrderQty}
                  handleUseAdjustedQty={handleUseAdjustedQty}
                  setSelectedRows={setSelectedRows}
                  toggledClearRows={toggledClearRows}
                  selectedSupplier={selectedSupplier}
                  setSelectedSupplier={setSelectedSupplier}
                  setError={setError}
                  setSalesModal={setSalesModal}
                  setField={setField}
                  handleSetSorting={handleSetSorting}
                  sortingDirectionAsc={sortingDirectionAsc}
                  splits={splits}
                  splitNames={splitNames}
                  setRPProductConfig={setRPProductConfig}
                  setValuesAndOpen={setValuesAndOpen}
                  handleRegenerateForecast={handleRegenerateForecast}
                  setAIForecastProduct={setAIForecastProduct}
                  expandedRowProps={{ session, startDate, endDate }}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
        {salesModal.showSalesModal && <ReorderingPointsSalesModal salesModal={salesModal} setSalesModal={setSalesModal} />}
        {showPOModal && (
          <ReorderingPointsCreatePOModal
            reorderingPointsOrder={reorderingPointsOrder}
            selectedSupplier={selectedSupplier}
            showPOModal={showPOModal}
            setshowPOModal={setshowPOModal}
            username={session?.user?.businessOrderStart}
            splits={splits}
            splitNames={splitNames}
          />
        )}
        {promptModal.show && <ReorderingPointsPromptModal promptModal={promptModal} setPromptModal={setPromptModal} />}
        <RPEditProductConfigOffCanvas rpProductConfig={rpProductConfig} setRPProductConfig={setRPProductConfig} handleSaveProductConfig={handleSaveProductConfig} />
        <InputModal
          isOpen={isOpen}
          headerText='Edit Split Name'
          primaryText='Enter new split name'
          confirmText='Save'
          loadingText='Saving...'
          value={value}
          onChange={setValue}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          onClose={closeModal}
        />
        <RPAIForecastDrawer
          product={aiForecastProduct}
          isOpen={aiForecastProduct !== null}
          onClose={() => setAIForecastProduct(null)}
          region={state.currentRegion}
          onSave={handleSaveProductTrendTag}
        />
        <RPBulkProductTrendTagDialog
          isOpen={isBulkTrendTagDialogOpen}
          onClose={() => setIsBulkTrendTagDialogOpen(false)}
          onSuccess={() => {
            setIsBulkTrendTagDialogOpen(false)
            clearAllSelectedRows()
          }}
          products={selectedRows}
          onSubmit={handleSaveProductsTrendTagBulk}
        />
      </React.Fragment>
    </div>
  )
}

export default ReorderingPoints
