import { useCallback, useContext, useEffect, useMemo, useRef } from 'react'

import AppContext from '@context/AppContext'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type GetReceivingsResponse = OrderRowType[]

type ReceiginsHookProps = {
  searchValue: string
  searchStatus: string | number | undefined
  searchWarehouse: string | number | undefined
  startDate: string
  endDate: string
}
export const useReceivings = ({ searchValue, searchStatus, searchWarehouse, startDate, endDate }: ReceiginsHookProps) => {
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
  } = useSWR(
    state.user.businessId ? `/api/receivings/getReceivingOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  const filteredData = useMemo(() => {
    if (!receivings) return []

    if (!searchValue && !searchStatus && !searchWarehouse) return receivings

    console.log('Filtering receivings with status:', searchStatus, 'and search value:', searchValue, 'and warehouse:', searchWarehouse)

    const lowerCaseSearchValue = searchValue.toLowerCase()
    const lowerStatus = searchStatus ? String(searchStatus).toLowerCase() : ''
    const lowerWarehouse = searchWarehouse ? Number(searchWarehouse) : 0

    return receivings.filter((order) => {
      const matchesStatus = lowerStatus ? order.orderStatus.toLowerCase() === lowerStatus : true

      const matchesWarehouse = lowerWarehouse ? order.warehouseId === lowerWarehouse : true

      const matchesSearch =
        !lowerCaseSearchValue ||
        order?.orderNumber?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.tag?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderStatus?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderType?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.shipName?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.trackingNumber?.toLowerCase().includes(lowerCaseSearchValue) ||
        order?.orderItems?.some(
          (item: ShipmentOrderItem) =>
            item.name.toLowerCase().includes(lowerCaseSearchValue) ||
            searchValue.split(' ').every((word) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
            item.sku.toLowerCase().includes(lowerCaseSearchValue) ||
            item.poNumber?.toLowerCase().includes(lowerCaseSearchValue)
        )

      return matchesStatus && matchesWarehouse && matchesSearch
    })
  }, [receivings, searchStatus, searchValue, searchWarehouse])

  return { receivings: filteredData, isLoading: isValidating && !receivings, mutateReceivings }
}
