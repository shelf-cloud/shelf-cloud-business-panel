/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Card, CardBody, Collapse, Container, Row, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown, Button, Spinner } from 'reactstrap'
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
import { ReorderingPointsProduct, ReorderingPointsResponse, ReorderingPointsSalesResponse } from '@typesTs/reorderingPoints/reorderingPoints'
import ReorderingPointsTable from '@components/reorderingPoints/ReorderingPointsTable'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import ReorderingPointsSalesModal from '@components/modals/reorderingPoints/ReorderingPointsSalesModal'

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
      name: string
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

const ReorderingPoints = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { filters, urgency, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showHidden }: FilterProps = router.query
  const [searchValue, setSearchValue] = useState<any>('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [startDate, setStartDate] = useState(moment().subtract(15, 'days').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [loadingData, setLoadingData] = useState(true)
  const [productsData, setProductsData] = useState<ReorderingPointsResponse>({})
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [selectedRows, setSelectedRows] = useState<ReorderingPointsProduct[]>([])
  const [loadingSales, setLoadingSales] = useState(true)
  const [error, setError] = useState<string[]>([])
  const [salesModal, setSalesModal] = useState({
    showSalesModal: false,
    sku: '',
    title: '',
    totalUnitsSold: {},
    marketplaces: {},
  })

  const fetcherMarketplaces = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data: marketplacesInfo }: { data?: MarketpalcesInfo } = useSWR(
    state.user.businessId ? `/api/marketplaces/getMarketplacesInfo?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcherMarketplaces,
    {
      revalidateOnFocus: false,
    }
  )

  // REORDERING POINTS PRODUCTS
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const getReorderingPointsProducts = async () => {
      setLoadingData(true)
      await axios(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getReorderingPointsProducts?region=${state.currentRegion}&businessId=${state.user.businessId}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
        .then((res) => {
          setProductsData(res.data as ReorderingPointsResponse)
          setLoadingData(false)
        })
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error(error?.data?.message || 'Error fetching product performance data')
            setProductsData({})
          }
        })
    }
    if (session && state.user.businessId) getReorderingPointsProducts()
    return () => {
      controller.abort()
    }
  }, [session, state.user.businessId])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const getNewDateRange = async () => {
      setLoadingSales(true)
      await axios(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getReorderingPointsSales?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
        .then(async ({ data }: { data: ReorderingPointsSalesResponse }) => {
          if (data.error) {
            toast.error(data.message || 'Error fetching Products Sales Data')
          }
          if (Object.keys(data).length > 0) {
            for await (const product of Object.values(data)) {
              setProductsData((prevData) => {
                const newProductsData = { ...prevData }
                if (newProductsData[product.sku]) {
                  newProductsData[product.sku].grossRevenue = product.grossRevenue
                  newProductsData[product.sku].expenses = product.expenses
                  for (const [storeId, values] of Object.entries(product.marketplaces)) {
                    if (newProductsData[product.sku].marketplaces[storeId] === undefined) {
                      newProductsData[product.sku].marketplaces[storeId] = {
                        name: values.name,
                        storeId: values.storeId,
                        grossRevenue: values.grossRevenue,
                        expenses: values.expenses,
                        totalUnitsSold: values.totalUnitsSold,
                        unitsSold: {},
                      }
                    }
                    newProductsData[product.sku].marketplaces[storeId].grossRevenue = values.grossRevenue
                    newProductsData[product.sku].marketplaces[storeId].expenses = values.expenses
                    newProductsData[product.sku].marketplaces[storeId].totalUnitsSold = values.totalUnitsSold
                  }
                }
                return newProductsData
              })
            }
          }
          setLoadingSales(false)
        })
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error(error?.data?.message || 'Error fetching product performance data')
            setProductsData({})
          }
        })
    }
    if (session && state.user.businessId && Object.keys(productsData).length > 0 && !loadingData) getNewDateRange()

    return () => {
      controller.abort()
    }
  }, [session, state.user.businessId, startDate, endDate, loadingData])

  const filterDataTable = useMemo(() => {
    if (!productsData || Object.values(productsData).length === 0) {
      return []
    }
    const urgencyParsed: number[] = urgency !== undefined && urgency !== '[]' ? JSON.parse(urgency) : []

    if (searchValue === '') {
      return Object.values(productsData).filter(
        (item: ReorderingPointsProduct) =>
          (urgency !== undefined && urgency !== '[]' ? urgencyParsed.includes(item.urgency) : true) &&
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase().includes(supplier.toLowerCase()) : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showHidden === undefined || showHidden === '' ? !item.hideReorderingPoints : showHidden === 'false' ? !item.hideReorderingPoints : true)
      )
    }

    if (searchValue !== '') {
      return Object.values(productsData).filter(
        (item: ReorderingPointsProduct) =>
          (urgency !== undefined && urgency !== '[]' ? urgencyParsed.includes(item.urgency) : true) &&
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase().includes(supplier.toLowerCase()) : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showHidden === undefined || showHidden === '' ? !item.hideReorderingPoints : showHidden === 'false' ? !item.hideReorderingPoints : true) &&
          (item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return []
  }, [productsData, searchValue, urgency, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showHidden])

  // FILTER FUNCTIONS
  const handleChangeDatesFromPicker = (dateStr: string) => {
    // setStartDate(moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'))
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
      return
    }
    // if (startDate === moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD')) {
    //   setEndDate(moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'))
    //   return
    // }
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
    router.push(filterString, undefined, { shallow: true })
  }

  // TABLE FUNCTIONS
  const handleOrderQty = (sku: string, orderQty: number) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      if (orderQty === 0 || orderQty === null || orderQty === undefined || isNaN(orderQty)) {
        newProductsData[sku].order = 0
        newProductsData[sku].orderAdjusted = 0
        return newProductsData
      }
      if (orderQty < 0) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty
        return newProductsData
      }
      if (orderQty <= newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty
        return newProductsData
      }
      if (orderQty > newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty * Math.ceil(orderQty / newProductsData[sku].boxQty)
        return newProductsData
      }
      return newProductsData
    })
  }
  const handleUseAdjustedQty = (sku: string, state: boolean) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      newProductsData[sku].useOrderAdjusted = state
      return newProductsData
    })
  }
  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }
  const handleNewVisibilityState = async (selectedRows: ReorderingPointsProduct[], newState: boolean) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      for (const item of selectedRows) {
        newProductsData[item.sku].hideReorderingPoints = newState
      }
      return newProductsData
    })
  }
  const handleDaysOfStockQty = async (sku: string, daysOfStockQty: number, inventoryId: number) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      if (daysOfStockQty <= 0 || daysOfStockQty === null || daysOfStockQty === undefined || isNaN(daysOfStockQty)) {
        newProductsData[sku].recommendedDaysOfStock = 0
        return newProductsData
      }

      newProductsData[sku].recommendedDaysOfStock = daysOfStockQty
      return newProductsData
    })

    const response = await axios.post(`/api/reorderingPoints/setNewRecommendedDaysOfSotck?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      daysOfStockQty,
      inventoryId,
    })
    if (response.data.error) {
      toast.error(response.data.msg)
    }
  }

  // ACTIONS
  const changeSelectedProductsState = async (newState: boolean) => {
    if (selectedRows.length <= 0) return

    const confirmationResponse = confirm(`Are you sure you want to ${newState ? 'Hide' : 'Show'} Selected Products?`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/reorderingPoints/setNewShowingStatusReorderingPoints?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newState,
        selectedRows,
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
    const orderSummary = { totalQty: 0, totalCost: 0, totalVolume: 0 }
    if (!productsData || Object.values(productsData).length === 0) return orderSummary

    for (const item of Object.values(productsData)) {
      orderSummary.totalQty += item.useOrderAdjusted ? item.orderAdjusted : item.order
      orderSummary.totalCost += item.useOrderAdjusted ? item.orderAdjusted * item.sellerCost : item.order * item.sellerCost
      orderSummary.totalVolume += item.useOrderAdjusted ? item.orderAdjusted * item.itemVolume : item.order * item.itemVolume
    }

    return orderSummary
  }, [productsData])

  const title = `Reordering Points | ${session?.user?.name}`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Reordering Points' pageTitle='Inbound' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='app-search d-flex flex-sm-column justify-content-between align-items-center p-0 flex-xl-row gap-sm-2 gap-xl-0'>
                <div className='d-flex flex-wrap justify-content-start align-items-center gap-3 w-100'>
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
                  <FilterByDates
                    shipmentsStartDate={startDate}
                    setShipmentsStartDate={setStartDate}
                    setShipmentsEndDate={setEndDate}
                    shipmentsEndDate={endDate}
                    handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                  />
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
                </div>
                <div className='col-sm-12 col-xl-3'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={500}
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center input_background_white'
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
            <Card style={{ marginBottom: '160px' }}>
              <CardBody>
                {!loadingData && loadingSales && (
                  <p className='text-left fs-6 text-primary m-0 p-0'>
                    Loading Sales Data... <Spinner size={'sm'} color='primary' />
                  </p>
                )}
                <ReorderingPointsTable
                  filterDataTable={filterDataTable}
                  pending={loadingData}
                  loadingSales={loadingSales}
                  handleOrderQty={handleOrderQty}
                  handleUseAdjustedQty={handleUseAdjustedQty}
                  setSelectedRows={setSelectedRows}
                  toggledClearRows={toggledClearRows}
                  selectedSupplier={selectedSupplier}
                  setSelectedSupplier={setSelectedSupplier}
                  setError={setError}
                  setSalesModal={setSalesModal}
                  handleDaysOfStockQty={handleDaysOfStockQty}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
        {!loadingData && filterDataTable.length > 0 && (
          <div className='position-fixed shadow-lg' style={{ right: '20px', bottom: '40px' }}>
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
                      <td className='fw-semibold text-end'>{`${FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalVolume)} ${
                        state.currentRegion === 'us' ? 'in' : 'cm'
                      }`}</td>
                    </tr>
                  </tbody>
                </table>
                <div className='mt-2 text-end'>
                  <Button disabled={error.length > 0} className='fs-7 btn btn-sm' color='primary'>
                    Create Order
                  </Button>
                  {error.length > 0 && <p className='fs-7 text-danger m-0 p-0'>Error in some Products</p>}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        {salesModal.showSalesModal && <ReorderingPointsSalesModal salesModal={salesModal} setSalesModal={setSalesModal} />}
      </React.Fragment>
    </div>
  )
}

export default ReorderingPoints
