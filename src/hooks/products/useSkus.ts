import AppContext from '@context/AppContext'
import axios from 'axios'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export type Product = {
  inventoryId: number
  businessId: number
  image: string
  title: string
  sku: string
  isKit: boolean
}

type ProductsResponse = Product[]

export const useSkus = () => {
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
      const response = await axios.get<ProductsResponse>(endPoint, {
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

  const { data: skus, isValidating } = useSWR(state.user.businessId ? `/api/products/getProductsSku?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  return { skus: skus ?? [], isLoading: isValidating }
}
