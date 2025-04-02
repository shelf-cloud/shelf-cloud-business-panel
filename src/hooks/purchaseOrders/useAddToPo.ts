import AppContext from '@context/AppContext'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import axios from 'axios'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export interface SkuInListToAddToPo extends SkuToAddPo {
  addQty: number | string
}

type GetSkusToAddToPoResponse = SkuToAddPo[]

export const useAddToPo = () => {
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
      const response = await axios.get<GetSkusToAddToPoResponse>(endPoint, {
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

  const { data: skuList, isValidating } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getSkusToAddToPo?region=${state.currentRegion}&businessId=${state.user.businessId}&supplier=${state.modalAddSkuToPurchaseOrder?.suppliersName}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  return { skuList: skuList ?? [], isLoading: isValidating }
}
