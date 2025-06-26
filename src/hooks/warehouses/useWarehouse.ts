import { useContext, useEffect, useRef } from 'react'

import AppContext from '@context/AppContext'
import { WarehousesResponse } from '@typesTs/warehouses/warehouse'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export const useWarehouses = () => {
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

  const fetcher = async (endPoint: string) => {
    try {
      const { data } = await axios.get<WarehousesResponse>(endPoint, {
        signal: controllerRef.current?.signal,
      })

      if (data.error) {
        toast.error(data.message || 'Error fetching warehouses')
      }

      return data.warehouses
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching product performance data')
        throw error
      }
    }
  }

  const { data: warehouses, isValidating: isLoadingWareouses } = useSWR(
    state.user.businessId ? `/api/warehouses/getWarehouses?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      // dedupingInterval: 60000 * 5, // 5 minutes
    }
  )

  return { warehouses, isLoading: isLoadingWareouses }
}
