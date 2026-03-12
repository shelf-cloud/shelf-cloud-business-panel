import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ProductTrendTag, ReorderingPointsForecastProducts, ReorderingPointsProduct, ReorderingPointsResponse } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { useRPNewForecast } from './useRPNewForcast'

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
export type RPProductsTrendTagBulkResult = {
  status: 'success' | 'error'
  message: string
}

export type RPProductTrendTagUpdate = {
  inventoryId: number
  sku: string
  productTrendTag: ProductTrendTag
}

const checkUgerncyTagNumber = (urgency: string) => {
  switch (urgency) {
    case 'High':
      return 3
    case 'Medium':
      return 2
    case 'Low':
      return 1
    default:
      return 0
  }
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
  trendTag,
  showHidden,
  setField,
  sortingDirectionAsc,
  isSplitting,
}: any) => {
  const [productsData, setProductsData] = useState<ReorderingPointsForecastProducts>({})
  const controllerRef = useRef<AbortController | null>(null)
  const { generate_new_forecast_products } = useRPNewForecast()

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
      onSuccess: ({ data, error, message }) => {
        if (!data || error || !data) {
          toast.error(message || 'Error fetching product performance data')
          return
        }
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
            .post(`/api/reorderingPoints/get-single-product-forecast?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
              skus: [sku],
              productIds: [inventoryId],
            })
            .then(({ data }: { data: ReorderingPointsResponse }) => {
              const { error, data: forecastData } = data
              if (error || !forecastData) return { error: true, message: 'Error saving product config' }

              setProductsData((prevData) => {
                const newProductsData = { ...prevData }
                newProductsData[sku] = forecastData[sku]
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

  const handleRegenerateForecast = useCallback(
    async ({ inventoryId, sku }: { inventoryId: number; sku: string }) => {
      const updatingProductConfig = toast.loading('Regenerating Forecast...')

      const response = await axios
        .post(`/api/reorderingPoints/get-single-product-forecast?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          skus: [sku],
          productIds: [inventoryId],
        })
        .then(({ data }: { data: ReorderingPointsResponse }) => {
          const { error, data: forecastData } = data
          if (error || !forecastData) return { error: true, message: 'Error generating forecast.' }

          setProductsData((prevData) => {
            const newProductsData = { ...prevData }
            newProductsData[sku] = forecastData[sku]
            return newProductsData
          })
          return { error: false, message: `SKU ${sku}: Forecast Updated.` }
        })
        .catch(() => {
          return { error: true, message: 'Error generating forecast.' }
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

  const saveProductTrendTags = useCallback(
    async (products: RPProductTrendTagUpdate[]): Promise<RPProductsTrendTagBulkResult> => {
      if (products.length === 0) {
        return {
          status: 'error',
          message: 'No products selected.',
        }
      }

      const isSingleProduct = products.length === 1
      const updatingTrendTag = toast.loading(isSingleProduct ? 'Updating Product Trend Tag...' : 'Updating Product Trend Tags...')

      try {
        const { data } = await axios.post(`/api/reorderingPoints/setNewProductTrendTag?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          products,
        })

        if (data.error) {
          throw new Error(data.message || 'Error updating product trend tag')
        }

        setProductsData((prevData) => {
          const newProductsData = { ...prevData }

          for (const product of products) {
            if (!newProductsData[product.sku]) continue

            newProductsData[product.sku] = {
              ...newProductsData[product.sku],
              productTrendTag: {
                aiTrend: newProductsData[product.sku].productTrendTag?.aiTrend ?? product.productTrendTag.aiTrend,
                analysis: newProductsData[product.sku].productTrendTag?.analysis ?? product.productTrendTag.analysis,
                bsnssTrend: product.productTrendTag.bsnssTrend,
                useAITrend: product.productTrendTag.useAITrend,
              },
            }
          }

          return newProductsData
        })

        toast.update(updatingTrendTag, {
          render: isSingleProduct ? `${products[0].sku} trend saved` : `${products.length} product trend tags saved`,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })

        generate_new_forecast_products({
          skus: products.map((product) => product.sku),
          productIds: products.map((product) => product.inventoryId),
        })

        return {
          status: 'success',
          message: isSingleProduct ? `${products[0].sku} trend saved` : `${products.length} product trend tags saved`,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error updating trend tag'

        toast.update(updatingTrendTag, {
          render: message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return {
          status: 'error',
          message,
        }
      }
    },
    [generate_new_forecast_products, state.currentRegion, state.user.businessId]
  )

  const saveSingleProductTrendTag = useCallback(
    async ({ inventoryId, sku, productTrendTag }: RPProductTrendTagUpdate) => {
      const updatingTrendTag = toast.loading('Updating Product Trend Tag...')

      try {
        const response = await axios
          .post(`/api/reorderingPoints/setNewProductTrendTag?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            products: [{ inventoryId, sku, productTrendTag }],
          })
          .then(({ data }) => {
            if (data.error) {
              throw new Error(data.message || 'Error updating product trend tag')
            }
            toast.update(updatingTrendTag, {
              render: `${sku} trend saved`,
              type: 'success',
            })
            setProductsData((prevData) => {
              const newProductsData = { ...prevData }
              newProductsData[sku].productTrendTag.bsnssTrend = productTrendTag.bsnssTrend
              newProductsData[sku].productTrendTag.useAITrend = productTrendTag.useAITrend
              return newProductsData
            })
          })
          .then(async () => {
            toast.update(updatingTrendTag, {
              render: `Generating New ${sku} Forecast`,
              type: 'success',
              isLoading: true,
            })
            const newForecast = await axios
              .post(`/api/reorderingPoints/get-single-product-forecast?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
                skus: [sku],
                productIds: [inventoryId],
              })
              .then(({ data }: { data: ReorderingPointsResponse }) => {
                const { error, data: forecastData } = data
                if (error || !forecastData) return { error: true, message: 'Error saving product forecast' }

                setProductsData((prevData) => {
                  const newProductsData = { ...prevData }
                  newProductsData[sku] = forecastData[sku]
                  return newProductsData
                })
                return { error: false, message: `SKU ${sku}: Forecast Updated` }
              })
              .catch(() => {
                return { error: true, message: 'Error saving product forecast.' }
              })
            return newForecast
          })

        if (response.error) {
          throw new Error(response.message || 'Error updating product trend tag')
        } else {
          toast.update(updatingTrendTag, {
            render: `SKU ${sku}: Forecast Updated`,
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          })
        }
      } catch (error) {
        toast.update(updatingTrendTag, {
          render: error instanceof Error ? error.message : 'Error updating trend tag',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    },
    [state.currentRegion, state.user.businessId]
  )

  const handleSaveProductsTrendTagBulk = useCallback(
    async (selectedProducts: ReorderingPointsProduct[], bsnssTrend: ProductTrendTag['bsnssTrend']) => {
      return saveProductTrendTags(
        selectedProducts.map((product) => ({
          inventoryId: product.inventoryId,
          sku: product.sku,
          productTrendTag: {
            aiTrend: product.productTrendTag?.aiTrend ?? 'Normal',
            analysis: product.productTrendTag?.analysis ?? '',
            bsnssTrend,
            useAITrend: false,
          },
        }))
      )
    },
    [saveProductTrendTags]
  )

  const handleSaveProductTrendTag = useCallback(
    async ({ inventoryId, sku, productTrendTag }: RPProductTrendTagUpdate) => {
      return saveSingleProductTrendTag({ inventoryId, sku, productTrendTag })
    },
    [saveSingleProductTrendTag]
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

    if (['ai_urgency'].includes(field)) {
      return rows.sort((a, b) => {
        const aField = checkUgerncyTagNumber(a.totalAIForecast_1.urgencyTag)
        const bField = checkUgerncyTagNumber(b.totalAIForecast_1.urgencyTag)
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
          (trendTag !== undefined && trendTag !== ''
            ? (item.productTrendTag.useAITrend ? item.productTrendTag.aiTrend.toLowerCase() : item.productTrendTag.bsnssTrend.toLowerCase()) === trendTag.toLowerCase()
            : true) &&
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
          (trendTag !== undefined && trendTag !== ''
            ? (item.productTrendTag.useAITrend ? item.productTrendTag.aiTrend.toLowerCase() : item.productTrendTag.bsnssTrend.toLowerCase()) === trendTag.toLowerCase()
            : true) &&
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
    trendTag,
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
    handleRegenerateForecast,
    handleUrgencyRange,
    handleSaveProductsTrendTagBulk,
    handleSaveProductTrendTag,
  }
}
