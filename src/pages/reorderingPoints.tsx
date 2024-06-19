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
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import ReorderingPointsSalesModal from '@components/modals/reorderingPoints/ReorderingPointsSalesModal'
import ReorderingPointsSettings from '@components/reorderingPoints/ReorderingPointsSettings'
import ReorderingPointsCreatePOModal from '@components/modals/reorderingPoints/ReorderingPointsCreatePOModal'
import { SingleForecastResponse } from '@typesTs/reorderingPoints/singleForecast'

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
  const [loadingSales, setLoadingSales] = useState(false)
  const [loadingForecast, setloadingForecast] = useState(false)
  const [error, setError] = useState<string[]>([])
  const [salesModal, setSalesModal] = useState({
    showSalesModal: false,
    sku: '',
    title: '',
    totalUnitsSold: {},
    marketplaces: {},
  })
  const [setField, setsetField] = useState('urgency')
  const [sortingDirectionAsc, setsortingDirectionAsc] = useState(true)
  const [showPOModal, setshowPOModal] = useState(false)

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
                  newProductsData[product.sku].unitsSold = product.unitsSold
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
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty
        return newProductsData
      }
      if (orderQty <= newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty
        return newProductsData
      }
      if (orderQty > newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty * Math.ceil(orderQty / newProductsData[sku].boxQty)
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
    setloadingForecast(true)

    const newForecast = await axios
      .put(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getForecastSingle`,
        {
          region: state.currentRegion,
          businessId: state.user.businessId,
          inventoryId: inventoryId,
          sku: sku,
          recommendedDaysOfStock: daysOfStockQty,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
      .then(({ data }: { data: SingleForecastResponse }) => {
        setProductsData((prevData) => {
          const newProductsData = { ...prevData }
          if (daysOfStockQty <= 0 || daysOfStockQty === null || daysOfStockQty === undefined || isNaN(daysOfStockQty)) {
            newProductsData[sku].recommendedDaysOfStock = 0
            newProductsData[sku].forecastModel = data[sku].best_model
            newProductsData[sku].forecast = data[sku].unitsSold
            newProductsData[sku].adjustedForecast =
              Object.values(data[sku].unitsSold[data[sku].best_model]).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) *
              newProductsData[sku].variation
            return newProductsData
          }

          newProductsData[sku].recommendedDaysOfStock = daysOfStockQty
          newProductsData[sku].forecastModel = data[sku].best_model
          newProductsData[sku].forecast = data[sku].unitsSold
          newProductsData[sku].adjustedForecast =
            Object.values(data[sku].unitsSold[data[sku].best_model]).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) *
            newProductsData[sku].variation
          return newProductsData
        })
      })
      .then(async () => {
        const response = await axios.post(`/api/reorderingPoints/setNewRecommendedDaysOfSotck?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          daysOfStockQty: daysOfStockQty <= 0 || daysOfStockQty === null || daysOfStockQty === undefined || isNaN(daysOfStockQty) ? 0 : daysOfStockQty,
          inventoryId,
        })

        return response
      })
      .catch((error) => {
        return error
      })

    if (newForecast.data.error) {
      toast.error(newForecast.data.message)
    } else {
      toast.success(`SKU ${sku}: Forecast Updated`)
    }
    setloadingForecast(false)
  }
  const handleSetSorting = (field: string) => {
    setsetField(field)
    setsortingDirectionAsc(!sortingDirectionAsc)
  }
  const handleSortingList = (rows: ReorderingPointsProduct[], field: string, direction: boolean) => {
    if (['30D', '60D', '90D', '120D', '180D', '365D'].includes(field)) {
      return rows.sort((a, b) => {
        if (a.totalUnitsSold[field] > b.totalUnitsSold[field]) {
          return direction ? 1 : -1
        } else if (a.totalUnitsSold[field] < b.totalUnitsSold[field]) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (['sku', 'supplier', 'brand'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = a[field as keyof ReorderingPointsProduct]!.toLocaleString().toLowerCase()
        const bField = b[field as keyof ReorderingPointsProduct]!.toLocaleString().toLowerCase()
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (
      ['daysRemaining', 'warehouseQty', 'fbaQty', 'productionQty', 'receiving', 'sellerCost', 'leadTime', 'boxQty', 'adjustedForecast', 'order', 'orderAdjusted'].includes(field)
    ) {
      return rows.sort((a, b) => {
        const aField = a[field as keyof ReorderingPointsProduct]!
        const bField = b[field as keyof ReorderingPointsProduct]!
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (['recommendedQty'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = (a.leadTime + a.recommendedDaysOfStock) * (a.totalUnitsSold['30D'] / 30) - (a.warehouseQty + a.fbaQty + a.productionQty + a.receiving)
        const bField = (b.leadTime + b.recommendedDaysOfStock) * (b.totalUnitsSold['30D'] / 30) - (b.warehouseQty + b.fbaQty + b.productionQty + b.receiving)
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (['forecast'].includes(field)) {
      return rows.sort((a, b) => {
        const aField =
          Object.values(a.forecast[a.forecastModel]!).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (a.warehouseQty + a.fbaQty + a.productionQty + a.receiving)
        const bField =
          Object.values(b.forecast[b.forecastModel]!).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (b.warehouseQty + b.fbaQty + b.productionQty + b.receiving)
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (['totalInventory'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = a.warehouseQty + a.fbaQty + a.productionQty + a.receiving
        const bField = b.warehouseQty + b.fbaQty + b.productionQty + b.receiving
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    if (['ExponentialSmoothing', 'AutoREG', 'VAR', 'Naive', 'ARDL', 'ARDL_seasonal'].includes(field)) {
      return rows.sort((a, b) => {
        const aField =
          Object.values(a.forecast[field as keyof ReorderingPointsProduct]!).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (a.warehouseQty + a.fbaQty + a.productionQty + a.receiving)
        const bField =
          Object.values(b.forecast[field as keyof ReorderingPointsProduct]!).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (b.warehouseQty + b.fbaQty + b.productionQty + b.receiving)
        if (aField > bField) {
          return direction ? 1 : -1
        } else if (aField < bField) {
          return direction ? -1 : 1
        } else {
          return 0
        }
      })
    }

    return rows.sort((a, b) => {
      if (a.daysToOrder > b.daysToOrder) {
        return direction ? 1 : -1
      } else if (a.daysToOrder < b.daysToOrder) {
        return direction ? -1 : 1
      } else {
        return 0
      }
    })
  }
  const handleUrgencyRange = async (highAlertMax: number, mediumAlertMax: number, lowAlertMax: number) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      for (const product of Object.values(newProductsData)) {
        switch (true) {
          case product.daysToOrder <= highAlertMax:
            product.urgency = 3
            break
          case product.daysToOrder <= mediumAlertMax && product.daysToOrder >= highAlertMax + 1:
            product.urgency = 2
            break
          case product.daysToOrder <= lowAlertMax && product.daysToOrder >= mediumAlertMax + 1:
            product.urgency = 1
            break
          default:
            product.urgency = 0
            break
        }
      }
      return newProductsData
    })

    const response = await axios.post(`/api/reorderingPoints/setNewUrgencyRange?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      highAlertMax,
      mediumAlertMax,
      lowAlertMax,
    })
    if (response.data.error) {
      toast.error(response.data.msg)
    } else {
      toast.success(response.data.msg)
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

  // FILTERING TABLE
  const filterDataTable = useMemo(() => {
    if (!productsData || Object.values(productsData).length === 0) {
      return []
    }
    const urgencyParsed: number[] = urgency !== undefined && urgency !== '[]' ? JSON.parse(urgency) : []
    const sortedList = handleSortingList(Object.values(productsData), setField, sortingDirectionAsc)

    if (searchValue === '') {
      return sortedList.filter(
        (item: ReorderingPointsProduct) =>
          (urgency !== undefined && urgency !== '[]' ? urgencyParsed.includes(item.urgency) : true) &&
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showHidden === undefined || showHidden === '' ? !item.hideReorderingPoints : showHidden === 'false' ? !item.hideReorderingPoints : true)
        // (show0Days === undefined || show0Days === '' ? item.daysRemaining > 0 : show0Days === 'false' ? item.daysRemaining > 0 : true)
      )
    }

    if (searchValue !== '') {
      return sortedList.filter(
        (item: ReorderingPointsProduct) =>
          (urgency !== undefined && urgency !== '[]' ? urgencyParsed.includes(item.urgency) : true) &&
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showHidden === undefined || showHidden === '' ? !item.hideReorderingPoints : showHidden === 'false' ? !item.hideReorderingPoints : true) &&
          // (show0Days === undefined || show0Days === '' ? item.daysRemaining > 0 : show0Days === 'false' ? item.daysRemaining > 0 : true) &&
          (item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return []
  }, [productsData, searchValue, urgency, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showHidden, setField, sortingDirectionAsc])

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

  const title = `Reordering Points | ${session?.user?.businessName}`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Reordering Points' pageTitle='Inbound' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='d-flex flex-sm-column justify-content-between align-items-center p-0 flex-xl-row gap-sm-2 gap-xl-0'>
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
                  {state?.user?.us && (
                    <ReorderingPointsSettings
                      initialHighAlert={state?.user?.us?.rphighAlertMax}
                      initialMediumAlert={state?.user?.us?.rpmediumAlertMax}
                      initialLowAlert={state?.user?.us?.rplowAlertMax}
                      handleUrgencyRange={handleUrgencyRange}
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
                {!loadingData && loadingSales && (
                  <div className='text-left fs-6 text-primary m-0 p-0'>
                    Loading Sales Data... <Spinner size={'sm'} color='primary' />
                  </div>
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
                  setField={setField}
                  handleSetSorting={handleSetSorting}
                  sortingDirectionAsc={sortingDirectionAsc}
                  loadingForecast={loadingForecast}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
        {!loadingData && filterDataTable.length > 0 && (
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
                      <td className='fw-semibold text-end'>{`${FormatIntPercentage(
                        state.currentRegion,
                        state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000
                      )} m³`}</td>
                    </tr>
                  </tbody>
                </table>
                <div className='mt-2 text-end'>
                  <Button
                    disabled={error.length > 0 || Object.keys(reorderingPointsOrder.products).length === 0}
                    className='fs-7 btn btn-sm'
                    color='primary'
                    onClick={() => setshowPOModal(true)}>
                    Create Order
                  </Button>
                  {error.length > 0 && <p className='fs-7 text-danger m-0 p-0'>Error in some Products</p>}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        {salesModal.showSalesModal && <ReorderingPointsSalesModal salesModal={salesModal} setSalesModal={setSalesModal} />}
        {showPOModal && (
          <ReorderingPointsCreatePOModal
            reorderingPointsOrder={reorderingPointsOrder}
            selectedSupplier={selectedSupplier}
            showPOModal={showPOModal}
            setshowPOModal={setshowPOModal}
            username={session?.user?.businessOrderStart}
          />
        )}
      </React.Fragment>
    </div>
  )
}

export default ReorderingPoints
