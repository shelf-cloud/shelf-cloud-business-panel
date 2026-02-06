import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type SPSCommerceResponse = {
  error?: boolean
  integration: Integration
  warehouses: { [warehouseId: string]: SPSCommerceWarehouse }
}

export interface Integration {
  businessInfo: SPSCommerceBusinessInfo
  items: SPSCommerceItem[]
}

export interface SPSCommerceBusinessInfo {
  'VENDOR NUMBER': string
  locations: SPSCommerceLocations
  'QUANTITY AVAILABLE FOR SALE UOM': string
}

export interface SPSCommerceLocations {
  [locationId: string]: {
    'REPORTING LOCATION NAME': string
    'REPORTING LOCATION NUMBER': string
  }
}

export interface SPSCommerceItem {
  id: number
  integrationId: number
  businessId: number
  inventoryId: number
  integrationSku: string
  shouldUpdate: boolean
  note: string | null
  quantity: SPSCommerceItemQuantity
  title: string
  sku: string
  barcode: string
  image: string
  description: string
}

type SPSCommerceItemQuantity = { [warehouseId: string]: number }

export interface SPSCommerceWarehouse {
  name: string
  shipTo: string
  address1: string
  address2: string
  zipcode: string
  city: string
  state: string
  countryCode: string
  phone: string
  isActive: boolean
  isSCDestination: boolean
  hasInventory: boolean
  id3PL: any
  is3PL: boolean
  name3PL: string
  goflowId: string
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
    warehouses: data?.warehouses,
    items: data?.integration.items || [],
    isLoading: isValidating,
  }
}
