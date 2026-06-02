import { useCallback, useContext, useMemo } from 'react'

import AppContext from '@context/AppContext'
import type { Product } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { filterProducts } from './productFilters'
import type { ProductStatusFilter } from './productFilters'

type GetProductsResponse = {
  products: Product[]
  brands: string[]
  suppliers: string[]
  categories: string[]
}

type ProductsHookProps = {
  searchValue: string
  brand: string
  supplier: string
  category: string
  condition: string
  status: ProductStatusFilter
}
export const useProducts = ({ searchValue, brand, supplier, category, condition, status }: ProductsHookProps) => {
  const { state } = useContext(AppContext)

  const fetcher = useCallback(async (endPoint: string) => {
    try {
      const response = await axios.get<GetProductsResponse>(endPoint)
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching products data')
        throw error
      }
    }
  }, [])

  const {
    data,
    isValidating,
    mutate: mutateProducts,
  } = useSWR(state.user.businessId ? `/api/products/getInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  const fetchedProducts = data?.products

  const filteredData = useMemo(() => {
    if (!fetchedProducts) return []

    return filterProducts(fetchedProducts, {
      searchValue,
      brand,
      supplier,
      category,
      condition,
      status,
    })
  }, [brand, category, condition, fetchedProducts, searchValue, status, supplier])

  return {
    products: filteredData,
    isLoading: isValidating && !data?.products,
    brands: data?.brands || [],
    suppliers: data?.suppliers || [],
    categories: data?.categories || [],
    mutateProducts,
  }
}
