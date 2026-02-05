import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type MarketpalcesResponse = {
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

export const useMarketplaces = () => {
  const { state }: any = useContext(AppContext)
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
      const response = await axios.get<MarketpalcesResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching product performance data')
        throw error
      }
    }
  }, [])

  const { data: marketplaces, isValidating } = useSWR(
    state.user.businessId ? `/api/marketplaces/getMarketplacesInfo?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  return {
    suppliers: marketplaces?.suppliers ?? [],
    brands: marketplaces?.brands ?? [],
    categories: marketplaces?.categories ?? [],
    marketplaces: marketplaces?.marketplaces ?? [],
    isLoading: isValidating,
  }
}
