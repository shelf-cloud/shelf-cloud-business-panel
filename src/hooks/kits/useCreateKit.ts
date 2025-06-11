import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

interface CreateKitInfoResponse {
  skus: Sku[]
  validSkus: string[]
  skuInfo: SkuInfo
}

interface SkuInfo {
  [sku: string]: { inventoryId: number; title: string }
}

interface Sku {
  sku: string
  title: string
}

export const useCreateKit = () => {
  const { state } = useContext(AppContext)
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
      const response = await axios.get<CreateKitInfoResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching create kit data')
      }
    }
  }, [])

  const { data, isValidating } = useSWR(state.user.businessId ? `/api/kits/get-create-kit-info?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  return { skus: data?.skus ?? [], validSkus: data?.validSkus ?? [], skuInfo: data?.skuInfo ?? {}, isLoading: isValidating }
}
