import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ReorderingPointsProduct, ReorderingPointsResponse } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export type RPProductUpdateConfig = {
  inventoryId: number
  sku: string
  leadTimeSC: number
  leadTimeFBA: number
  leadTimeAWD: number
  daysOfStockSC: number
  daysOfStockFBA: number
  daysOfStockAWD: number
  buffer: number
  sellerCost: number
}
export const useRPProductsInfo = ({
  session,
  state,
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
  showHidden,
  setField,
  sortingDirectionAsc,
  isSplitting,
}: any) => {
  const [productsData, setProductsData] = useState<ReorderingPointsResponse>({})
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    controllerRef.current = new AbortController()
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  const { isValidating: isLoadingProductsData } = useSWR(
    session && state.user.businessId ? `/api/reorderingPoints/get-reordering-points-products?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    async (endPoint: string) => {
      try {
        const response = await axios.get<ReorderingPointsResponse>(endPoint, {
          signal: controllerRef.current?.signal,
        })
        return response.data
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error((error as any)?.data?.message || 'Error fetching product performance data')
        }
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        setProductsData(data)
      },
    }
  )

  useEffect(() => {
    if (productsData) {
      if (isSplitting) {
        setProductsData((prevData) => {
          const newProductsData = { ...prevData }
          for (const sku of Object.keys(newProductsData)) {
            newProductsData[sku].orderSplits = { '0': newProductsData[sku].orderSplits['0'] }
          }
          return newProductsData
        })
      } else {
        setProductsData((prevData) => {
          const newProductsData = { ...prevData }
          for (const sku of Object.keys(newProductsData)) {
            if (!newProductsData[sku].orderSplits['0']) continue
            newProductsData[sku].order = newProductsData[sku].orderSplits['0'].order
            newProductsData[sku].orderAdjusted = newProductsData[sku].orderSplits['0'].orderAdjusted
            newProductsData[sku].orderSplits = { '0': newProductsData[sku].orderSplits['0'] }
          }
          return newProductsData
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSplitting])

  const handleOrderQty = useCallback((sku: string, orderQty: number) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }

      const orderAdjusted = newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty
      const orderAdjustedMoreThanBoxQty = orderAdjusted * Math.ceil(orderQty / newProductsData[sku].boxQty)
      if (orderQty === 0 || orderQty === null || orderQty === undefined || isNaN(orderQty)) {
        newProductsData[sku].order = 0
        newProductsData[sku].orderAdjusted = 0
        newProductsData[sku].orderSplits['0'] = { order: 0, orderAdjusted: 0 }
        return newProductsData
      }
      if (orderQty < 0) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = orderAdjusted
        newProductsData[sku].orderSplits['0'] = { order: orderQty, orderAdjusted: orderAdjusted }
        return newProductsData
      }
      if (orderQty <= newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = orderAdjusted
        newProductsData[sku].orderSplits['0'] = { order: orderQty, orderAdjusted: orderAdjusted }
        return newProductsData
      }
      if (orderQty > newProductsData[sku].boxQty) {
        newProductsData[sku].order = orderQty
        newProductsData[sku].orderAdjusted = orderAdjustedMoreThanBoxQty
        newProductsData[sku].orderSplits['0'] = { order: orderQty, orderAdjusted: orderAdjustedMoreThanBoxQty }
        return newProductsData
      }
      return newProductsData
    })
  }, [])

  const handleSplitsOrderQty = useCallback((sku: string, orderQty: number, splitIndex: string) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      if (orderQty === 0 || orderQty === null || orderQty === undefined || isNaN(orderQty)) {
        newProductsData[sku].orderSplits[splitIndex] = { order: 0, orderAdjusted: 0 }
        newProductsData[sku].order = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.order, 0)
        newProductsData[sku].orderAdjusted = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.orderAdjusted, 0)
        return newProductsData
      }
      if (orderQty < 0) {
        newProductsData[sku].orderSplits[splitIndex] = { order: orderQty, orderAdjusted: newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty }
        newProductsData[sku].order = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.order, 0)
        newProductsData[sku].orderAdjusted = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.orderAdjusted, 0)
        return newProductsData
      }
      if (orderQty <= newProductsData[sku].boxQty) {
        newProductsData[sku].orderSplits[splitIndex] = { order: orderQty, orderAdjusted: newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty }
        newProductsData[sku].order = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.order, 0)
        newProductsData[sku].orderAdjusted = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.orderAdjusted, 0)
        return newProductsData
      }
      if (orderQty > newProductsData[sku].boxQty) {
        newProductsData[sku].orderSplits[splitIndex] = {
          order: orderQty,
          orderAdjusted: newProductsData[sku].boxQty === 0 ? orderQty : newProductsData[sku].boxQty * Math.ceil(orderQty / newProductsData[sku].boxQty),
        }
        newProductsData[sku].order = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.order, 0)
        newProductsData[sku].orderAdjusted = Object.values(newProductsData[sku].orderSplits).reduce((total, split) => total + split.orderAdjusted, 0)
        return newProductsData
      }
      return newProductsData
    })
  }, [])

  const handleUseAdjustedQty = useCallback((sku: string, state: boolean) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      newProductsData[sku].useOrderAdjusted = state
      return newProductsData
    })
  }, [])

  const handleNewVisibilityState = useCallback(async (selectedRows: ReorderingPointsProduct[], newState: boolean) => {
    setProductsData((prevData) => {
      const newProductsData = { ...prevData }
      for (const item of selectedRows) {
        newProductsData[item.sku].hideReorderingPoints = newState
      }
      return newProductsData
    })
  }, [])

  const handleSaveProductConfig = useCallback(
    async ({ inventoryId, sku, leadTimeSC, leadTimeFBA, leadTimeAWD, daysOfStockSC, daysOfStockFBA, daysOfStockAWD, buffer, sellerCost }: RPProductUpdateConfig) => {
      const updatingProductConfig = toast.loading('Updating Product Config...')

      const response = await axios
        .post(`/api/reorderingPoints/setNewProductConfig?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          inventoryId,
          sku,
          leadTimeSC,
          leadTimeFBA,
          leadTimeAWD,
          daysOfStockSC,
          daysOfStockFBA,
          daysOfStockAWD,
          buffer,
          sellerCost,
        })
        .then(() =>
          toast.update(updatingProductConfig, {
            render: `${sku} Config saved`,
            type: 'success',
            isLoading: true,
          })
        )
        .then(async () => {
          toast.update(updatingProductConfig, {
            render: `Generating New ${sku} Forecast`,
            type: 'success',
            isLoading: true,
          })
          const newForecast = await axios
            .get(`/api/reorderingPoints/get-single-product-forecast?region=${state.currentRegion}&businessId=${state.user.businessId}&sku=${sku}`)
            .then(({ data }: { data: ReorderingPointsResponse }) => {
              if (!data[sku]) return { error: true, message: 'Error saving product config' }

              setProductsData((prevData) => {
                const newProductsData = { ...prevData }
                newProductsData[sku] = data[sku]
                return newProductsData
              })
              return { error: false, message: `SKU ${sku}: Forecast Updated` }
            })
            .catch(() => {
              return { error: true, message: 'Error saving product config' }
            })
          return newForecast
        })
        .catch(() => {
          return { error: true, message: 'Error saving product config' }
        })

      if (response.error) {
        toast.update(updatingProductConfig, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      } else {
        toast.update(updatingProductConfig, {
          render: `SKU ${sku}: Forecast Updated`,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      }
    },
    [state.currentRegion, state.user.businessId]
  )

  const handleUrgencyRange = useCallback(
    async (highAlertMax: number, mediumAlertMax: number, lowAlertMax: number) => {
      setProductsData((prevData) => {
        const newProductsData = { ...prevData }
        for (const product of Object.values(newProductsData)) {
          if (product.totalUnitsSold['90D'] > 0) {
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
    },
    [state.currentRegion, state.user.businessId]
  )

  // FILTERING TABLE

  const handleSortingList = useCallback((rows: ReorderingPointsProduct[], field: string, direction: boolean) => {
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
      [
        'daysRemaining',
        'warehouseQty',
        'fbaQty',
        'awdQty',
        'productionQty',
        'receiving',
        'sellerCost',
        'leadTime',
        'boxQty',
        'adjustedForecast',
        'order',
        'orderAdjusted',
        'totalSCForecast',
        'totalFBAForecast',
        'totalAWDForecast',
      ].includes(field)
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

    if (['totalOrdered'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = a.useOrderAdjusted ? a.orderAdjusted : a.order
        const bField = b.adjustedForecast ? b.orderAdjusted : b.order
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

    if (['totalAIForecast_1'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = a.totalAIForecast_1.forecast
        const bField = b.totalAIForecast_1.forecast
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
      if (a.urgency > b.urgency) {
        return !direction ? 1 : -1
      } else if (a.urgency < b.urgency) {
        return !direction ? -1 : 1
      } else {
        if (a.daysToOrder < b.daysToOrder) {
          return !direction ? 1 : -1
        } else if (a.daysToOrder > b.daysToOrder) {
          return !direction ? -1 : 1
        } else {
          return 0
        }
      }
    })
  }, [])

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
          (unitsmin !== undefined && unitsmin !== '' ? item.totalUnitsSold[unitsrange] >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.totalUnitsSold[unitsrange] <= parseInt(unitsmax!) : true) &&
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
          (unitsmin !== undefined && unitsmin !== '' ? item.totalUnitsSold[unitsrange] >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.totalUnitsSold[unitsrange] <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase() === supplier.toLowerCase() : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showHidden === undefined || showHidden === '' ? !item.hideReorderingPoints : showHidden === 'false' ? !item.hideReorderingPoints : true) &&
          // (show0Days === undefined || show0Days === '' ? item.daysRemaining > 0 : show0Days === 'false' ? item.daysRemaining > 0 : true) &&
          (item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word: string) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return []
  }, [
    productsData,
    urgency,
    handleSortingList,
    setField,
    sortingDirectionAsc,
    searchValue,
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
    showHidden,
  ])

  return {
    completeProductData: productsData,
    productsData: filterDataTable,
    isLoadingProductsData,
    handleOrderQty,
    handleSplitsOrderQty,
    handleUseAdjustedQty,
    handleNewVisibilityState,
    handleSaveProductConfig,
    handleUrgencyRange,
  }
}
