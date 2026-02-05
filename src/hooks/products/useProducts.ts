import { useCallback, useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import { Product } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

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
}
export const useProducts = ({ searchValue, brand, supplier, category, condition }: ProductsHookProps) => {
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
      const response = await axios.get<GetProductsResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })
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

  const filteredData = (() => {
    if (!data?.products) return []

    if (searchValue === '') {
      return data.products?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase())
      )
    }

    if (searchValue !== '') {
      return data.products?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase()) &&
          (item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.fnSku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.barcode?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return data.products
  })()

  return {
    products: filteredData,
    isLoading: isValidating && !data?.products,
    brands: data?.brands || [],
    suppliers: data?.suppliers || [],
    categories: data?.categories || [],
    mutateProducts,
  }
}
