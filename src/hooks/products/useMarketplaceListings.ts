import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { useMarketplaceListingsQueries } from './useMarketplaceListingsQuery'

export type GetMarketplaceListingsResponse = {
  error: boolean
  products: MarketplaceListingsProduct[]
}

export type MarketplaceListingsProduct = {
  inventoryId: number
  title: string
  sku: string
  asin: string
  mfnSku: string
  afnSku: string
  fnSku: string
  barcode: string
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
  image: string
  note: string
  description: string
  brand: string | null
  category: string | null
  htsCode: string
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
  supplier: string | null
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA: number
  buffer: number
  itemCondition: string
  identifiers: MarketplaceListingsProductIdentifier[]
  listings: MarketplaceListingsProductListing[]
  isKit: boolean
  showDiscontinued?: boolean
}

export interface MarketplaceListingsProductIdentifier {
  type: string
  value: string
}

export interface MarketplaceListingsProductListing {
  price?: number
  store: string
  channel: string
  storeId: string
  storeSku: string
  channelName: string
  storeId_true: number
  isHidden?: boolean
  isManual?: boolean
}

type MarketplaceListingsHookProps = {
  searchValue: string
  storeId: string
}

type SetSelectedVisibilityParams = {
  products: {
    inventoryId: number
    sku: string
    isKit: boolean
  }[]
  storeId: number
  visibility: boolean
}

export const useMarketplaceListings = ({ searchValue, storeId }: MarketplaceListingsHookProps) => {
  const { state } = useContext(AppContext)
  const { listingsFilter } = useMarketplaceListingsQueries()
  const { showMKHidden, showMapped, showDiscontinued, supplier, brand, category } = listingsFilter
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    controllerRef.current = new AbortController()
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  const fetcher = useCallback(async (endPoint: string) => {
    try {
      const response = await axios.get<GetMarketplaceListingsResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching suppleirs data')
        throw error
      }
    }
  }, [])

  const {
    data,
    isValidating,
    mutate: mutateListings,
  } = useSWR(state.user.businessId ? `/api/marketplaces/listings/get_marketplace_listings?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  const filteredData = useMemo(() => {
    if (!data?.products) return []

    return data.products?.filter(
      (item: MarketplaceListingsProduct) =>
        (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
        (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
        (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
        (searchValue
          ? item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.fnSku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
          : true) &&
        (showMKHidden ? true : item.listings.find((listing) => listing.storeId_true?.toString() === storeId)?.isHidden !== true) &&
        (showMapped ? true : !item.listings.find((listing) => listing.storeId_true?.toString() === storeId)) &&
        (showDiscontinued ? true : !item.showDiscontinued)
    )
  }, [data?.products, brand, supplier, category, searchValue, showMKHidden, showMapped, showDiscontinued, storeId])

  const setSelectedVisibility = useCallback(
    async ({ products, storeId, visibility }: SetSelectedVisibilityParams) => {
      try {
        await axios.post(`/api/marketplaces/listings/set_selected_visibility?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          products,
          storeId,
          visibility,
        })
        toast.success(`Listings visibility updated successfully`)
        mutateListings()
      } catch (error) {
        toast.error((error as any)?.response?.data?.message || 'Error updating listings visibility')
      }
    },
    [mutateListings, state.currentRegion, state.user.businessId]
  )

  const setSelectedasMapped = useCallback(
    async ({ products, storeId }: Pick<SetSelectedVisibilityParams, 'products' | 'storeId'>) => {
      try {
        await axios.post(`/api/marketplaces/listings/set_selected_mapped?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          products,
          storeId,
        })
        toast.success(`Listings updated successfully`)
        mutateListings()
      } catch (error) {
        toast.error((error as any)?.response?.data?.message || 'Error updating listings')
      }
    },
    [mutateListings, state.currentRegion, state.user.businessId]
  )

  return {
    products: filteredData,
    isLoading: isValidating && !data?.products,
    setSelectedVisibility,
    setSelectedasMapped,
  }
}
