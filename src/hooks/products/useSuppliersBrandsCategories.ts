import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type GetSuppliersBrandsCategoriesResponse = {
  brands: string[]
  suppliers: string[]
  categories: string[]
}

export const useSuppliersBrandsCategories = () => {
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
      const response = await axios.get<GetSuppliersBrandsCategoriesResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching suppliers brands categories data')
        throw error
      }
    }
  }, [])

  const {
    data,
    isValidating,
    mutate: mutateSuppliersBrandsCategories,
  } = useSWR(state.user.businessId ? `/api/products/getBusinessSuppliersBrandsCategories?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  const addNewOption = useCallback(
    async ({ addEndpoint, values }: { addEndpoint: string; values: any }) => {
      const loadingToast = toast.loading('Adding...')

      const response = await axios.post(`/api/settings/${addEndpoint}?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.update(loadingToast, {
          render: 'Added successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        mutateSuppliersBrandsCategories()
        return { error: false }
      } else {
        toast.update(loadingToast, {
          render: 'Error Adding Option',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      }
    },
    [state.currentRegion, state.user.businessId, mutateSuppliersBrandsCategories]
  )

  return {
    isLoading: isValidating,
    brands: data?.brands || [],
    suppliers: data?.suppliers || [],
    categories: data?.categories || [],
    mutateSuppliersBrandsCategories,
    addNewOption,
  }
}
