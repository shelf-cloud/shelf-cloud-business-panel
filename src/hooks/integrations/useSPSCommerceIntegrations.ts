import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type SPSCommerceResponse = {
  error?: boolean
  integration: Integration
}

export interface Integration {
  businessInfo: SPSCommerceBusinessInfo
  items: SPSCommerceItem[]
}

export interface SPSCommerceBusinessInfo {
  'VENDOR NUMBER': string
  'REPORTING LOCATION NAME': string
  'REPORTING LOCATION NUMBER': string
  'QUANTITY AVAILABLE FOR SALE UOM': string
}

export interface SPSCommerceItem {
  id: number
  integrationId: number
  businessId: number
  inventoryId: number
  integrationSku: string
  shouldUpdate: boolean
  note: string | null
  quantity: number
  title: string
  sku: string
  barcode: string
  image: string
  description: string
}

export const useSPSCommerceIntegrations = () => {
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
      const response = await axios.get<SPSCommerceResponse>(endPoint, {
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

  const { data, isValidating } = useSWR(
    state.user.businessId ? `/api/integrations/sps_commerce/get_sps_commerce_items?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  return {
    integrationInfo: data?.integration.businessInfo,
    items: data?.integration.items || [],
    isLoading: isValidating,
  }
}
