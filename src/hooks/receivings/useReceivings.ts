import AppContext from '@context/AppContext'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type GetReceivingsResponse = OrderRowType[]

type ReceiginsHookProps = {
  searchValue: string
  startDate: string
  endDate: string
}
export const useReceivings = ({ searchValue, startDate, endDate }: ReceiginsHookProps) => {
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
      const response = await axios.get<GetReceivingsResponse>(endPoint, {
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

  const {
    data: receivings,
    isValidating,
    mutate: mutateReceivings,
  } = useSWR(state.user.businessId ? `/api/receivings/getReceivingOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  const filteredData = useMemo(() => {
    if (!receivings) return []

    if (searchValue === '') return receivings

    const lowerCaseSearchValue = searchValue.toLowerCase()
    return receivings.filter(
      (order) =>
        order?.orderNumber?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderStatus?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderType?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.shipName?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.trackingNumber?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderItems?.some(
          (item: ShipmentOrderItem) => item.name.toLowerCase().includes(lowerCaseSearchValue) || searchValue.split(' ').every((word) => item?.name?.toLowerCase().includes(word.toLowerCase())) || item.sku.toLowerCase().includes(lowerCaseSearchValue)
        )
    )
  }, [receivings, searchValue])

  return { receivings: filteredData, isLoading: isValidating, mutateReceivings }
}
