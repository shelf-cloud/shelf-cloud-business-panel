/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useMemo, useState } from 'react'
import { Card, CardBody, Collapse, Container, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown, Button } from 'reactstrap'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import Head from 'next/head'
import BreadCrumb from '@components/Common/BreadCrumb'
import { DebounceInput } from 'react-debounce-input'
import moment from 'moment'
import FilterReorderingPoints from '@components/ui/FilterReorderingPoints'
import FilterByDates from '@components/FilterByDates'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import ReorderingPointsTable from '@components/reorderingPoints/ReorderingPointsTable'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import ReorderingPointsSalesModal from '@components/modals/reorderingPoints/ReorderingPointsSalesModal'
import ReorderingPointsSettings from '@components/reorderingPoints/ReorderingPointsSettings'
import ReorderingPointsCreatePOModal from '@components/modals/reorderingPoints/ReorderingPointsCreatePOModal'
import { useRPProductsInfo } from '@hooks/useRPProductsInfo'
import { useRPProductConfig } from '@hooks/useRPProductConfig'
import RPEditProductConfigOffCanvas from '@components/reorderingPoints/RPEditProductConfigOffCanvas'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']

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
    props: { session, sessionToken },
  }
}

type Props = {
  sessionToken: string
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
  unitsmin?: string
  unitsmax?: string
  supplier?: string
  brand?: string
  category?: string
  showHidden?: string
  // show0Days?: string
}

type MarketpalcesInfo = {
  error?: boolean
  suppliers: string[]
  brands: string[]
  categories: string[]
  marketplaces: {
    storeId: string
    name: string
    logo: string
  }[]
}

const fetcherMarketplaces = (endPoint: string) => axios(endPoint).then((res) => res.data)

const ReorderingPoints = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { filters, urgency, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showHidden }: FilterProps = router.query
  const [startDate, setStartDate] = useState(moment().subtract(15, 'days').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [setField, setsetField] = useState('urgency')
  const [sortingDirectionAsc, setsortingDirectionAsc] = useState(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [splits, setsplits] = useState({ isSplitting: false, splitsQty: 2 })

  const { productsData, isLoadingProductsData, handleOrderQty, handleSplitsOrderQty, handleUseAdjustedQty, handleNewVisibilityState, handleSaveProductConfig, handleUrgencyRange } = useRPProductsInfo({
    sessionToken,
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
    unitsmin,
    unitsmax,
    supplier,
    brand,
    category,
    showHidden,
    setField,
    sortingDirectionAsc,
    isSplitting: splits.isSplitting,
  })

  const { rpProductConfig, setRPProductConfig } = useRPProductConfig()

  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
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

  const [showPOModal, setshowPOModal] = useState(false)

  // GET MARKETPLACES
  const { data: marketplacesInfo }: { data?: MarketpalcesInfo } = useSWR(state.user.businessId ? `/api/marketplaces/getMarketplacesInfo?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcherMarketplaces, {
    revalidateOnFocus: false,
  })

  // FILTER FUNCTIONS
  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
      return
    }
  }

  const handleApplyFilters = (
    urgency: string,
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    showHidden: string
    // show0Days: string
  ) => {
    let filterString = `/reorderingPoints?filters=true`
    if (urgency || urgency !== '') filterString += `&urgency=${urgency}`
    if (grossmin || grossmin !== '') filterString += `&grossmin=${grossmin}`
    if (grossmax || grossmax !== '') filterString += `&grossmax=${grossmax}`
    if (profitmin || profitmin !== '') filterString += `&profitmin=${profitmin}`
    if (profitmax || profitmax !== '') filterString += `&profitmax=${profitmax}`
    if (unitsmin || unitsmin !== '') filterString += `&unitsmin=${unitsmin}`
    if (unitsmax || unitsmax !== '') filterString += `&unitsmax=${unitsmax}`
    if (supplier || supplier !== '') filterString += `&supplier=${supplier}`
    if (brand || brand !== '') filterString += `&brand=${brand}`
    if (category || category !== '') filterString += `&category=${category}`
    if (showHidden || showHidden !== '') filterString += `&showHidden=${showHidden}`
    // if (show0Days || show0Days !== '') filterString += `&show0Days=${show0Days}`
    router.push(filterString, undefined, { shallow: true })
    setFilterOpen(false)
  }

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
  const changeSelectedProductsState = async (newState: boolean) => {
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
  }

  // REORDERING POINTS ORDER SUMMARY
  const reorderingPointsOrder = useMemo(() => {
    const orderSummary = { totalQty: 0, totalCost: 0, totalVolume: 0, products: {} } as {
      totalQty: number
      totalCost: number
      totalVolume: number
      products: { [key: string]: ReorderingPointsProduct }
    }
    if (!productsData || Object.values(productsData).length === 0) {
      setSelectedSupplier('')
      return orderSummary
    }

    for (const item of Object.values(productsData)) {
      if (item.order <= 0) continue
      orderSummary.totalQty += item.useOrderAdjusted ? item.orderAdjusted : item.order
      orderSummary.totalCost += item.useOrderAdjusted ? item.orderAdjusted * item.sellerCost : item.order * item.sellerCost
      orderSummary.totalVolume += item.useOrderAdjusted ? item.orderAdjusted * item.itemVolume : item.order * item.itemVolume
      orderSummary.products[item.sku] = item
    }

    if (orderSummary.totalQty <= 0) setSelectedSupplier('')
    return orderSummary
  }, [productsData])

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
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='d-flex flex-sm-column justify-content-between align-items-center p-0 flex-xl-row gap-sm-2 gap-xl-0'>
                <div className='d-flex flex-wrap justify-content-start align-items-center gap-2 w-100'>
                  <button
                    className={'btn dropdown-toggle ' + (filters === 'true' ? 'btn-info' : 'btn-light')}
                    style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                    type='button'
                    data-bs-toggle='dropdown'
                    data-bs-auto-close='outside'
                    aria-expanded='false'
                    onClick={() => setFilterOpen(!filterOpen)}>
                    Filters
                  </button>
                  <FilterByDates shipmentsStartDate={startDate} setShipmentsStartDate={setStartDate} setShipmentsEndDate={setEndDate} shipmentsEndDate={endDate} handleChangeDatesFromPicker={handleChangeDatesFromPicker} />
                  {selectedRows.length > 0 && (
                    <UncontrolledButtonDropdown>
                      <DropdownToggle className='btn btn-info fs-7 py-2' caret>
                        {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem className='text-nowrap text-primary fs-7' onClick={() => changeSelectedProductsState(false)}>
                          <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                          Set Visible
                        </DropdownItem>
                        <DropdownItem className='text-nowrap text-danger fs-7' onClick={() => changeSelectedProductsState(true)}>
                          <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2' />
                          Hide Selected
                        </DropdownItem>
                        <DropdownItem className='text-nowrap text-muted fs-7 text-end' onClick={clearAllSelectedRows}>
                          Clear
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  )}
                  {state?.user?.us && (
                    <ReorderingPointsSettings
                      initialHighAlert={state?.user?.us?.rphighAlertMax}
                      initialMediumAlert={state?.user?.us?.rpmediumAlertMax}
                      initialLowAlert={state?.user?.us?.rplowAlertMax}
                      handleUrgencyRange={handleUrgencyRange}
                      splits={splits}
                      setsplits={setsplits}
                    />
                  )}
                </div>
                <div className='app-search col-sm-12 col-xl-3 p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={500}
                      className='form-control bg-white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center bg-white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                    </span>
                  </div>
                </div>
              </div>
              <Collapse className='px-0' isOpen={filterOpen}>
                <Card className='mb-0' style={{ zIndex: '999' }}>
                  <CardBody className='w-100'>
                    <FilterReorderingPoints
                      urgency={urgency !== undefined ? urgency : '[]'}
                      grossmin={grossmin !== undefined ? grossmin : ''}
                      grossmax={grossmax !== undefined ? grossmax : ''}
                      profitmin={profitmin !== undefined ? profitmin : ''}
                      profitmax={profitmax !== undefined ? profitmax : ''}
                      unitsmin={unitsmin !== undefined ? unitsmin : ''}
                      unitsmax={unitsmax !== undefined ? unitsmax : ''}
                      supplier={supplier !== undefined ? supplier : ''}
                      brand={brand !== undefined ? brand : ''}
                      category={category !== undefined ? category : ''}
                      showHidden={showHidden !== undefined || showHidden === '' ? showHidden : 'false'}
                      // show0Days={show0Days !== undefined || show0Days === '' ? show0Days : 'false'}
                      supplierOptions={marketplacesInfo?.suppliers || []}
                      brandOptions={marketplacesInfo?.brands || []}
                      categoryOptions={marketplacesInfo?.categories || []}
                      handleApplyFilters={handleApplyFilters}
                      setFilterOpen={setFilterOpen}
                    />
                  </CardBody>
                </Card>
              </Collapse>
            </Row>
            <Card>
              <CardBody style={{ height: '82dvh', scrollbarWidth: 'thin' }}>
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
                  setRPProductConfig={setRPProductConfig}
                  expandedRowProps={{ sessionToken, session, startDate, endDate }}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
        {!isLoadingProductsData && productsData.length > 0 && (
          <div className='position-fixed shadow-lg' style={{ left: '40px', bottom: '150px', zIndex: '99999' }}>
            <Card className='mb-0 bg-body-tertiary border border-primary border-opacity-25 rounded' style={{ zIndex: '999' }}>
              <CardBody>
                <p className='fw-semibold fs-6 m-0 p-0'>Reordering Points Order</p>
                <p className='fs-7 m-0 p-0 text-muted mb-1'>
                  <span>{`Supplier: `}</span>
                  <span>{selectedSupplier}</span>
                </p>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Total Qty</td>
                      <td className='fw-semibold text-end'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Total Cost</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Total Volume</td>
                      <td className='fw-semibold text-end'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</td>
                    </tr>
                  </tbody>
                </table>
                <div className='mt-2 text-end'>
                  <Button disabled={error.length > 0 || Object.keys(reorderingPointsOrder.products).length === 0 || orderHasSplitswithZeroQty} className='fs-7 btn btn-sm' color='primary' onClick={() => setshowPOModal(true)}>
                    Create Order
                  </Button>
                  {error.length > 0 && <p className='fs-7 text-danger m-0 p-0'>Error in some Products</p>}
                  {orderHasSplitswithZeroQty && <p className='fs-7 text-danger m-0 p-0'>Products missing splits Qty</p>}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        {salesModal.showSalesModal && <ReorderingPointsSalesModal salesModal={salesModal} setSalesModal={setSalesModal} />}
        {showPOModal && (
          <ReorderingPointsCreatePOModal reorderingPointsOrder={reorderingPointsOrder} selectedSupplier={selectedSupplier} showPOModal={showPOModal} setshowPOModal={setshowPOModal} username={session?.user?.businessOrderStart} splits={splits} />
        )}
        <RPEditProductConfigOffCanvas rpProductConfig={rpProductConfig} setRPProductConfig={setRPProductConfig} handleSaveProductConfig={handleSaveProductConfig} />
      </React.Fragment>
    </div>
  )
}

export default ReorderingPoints
