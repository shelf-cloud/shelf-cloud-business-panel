import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

type GetReceivingsResponse = { error: boolean; message: string; inventory: ReceivingInventory[] }

export interface ReceivingInventory {
  inventoryId: number
  businessId: number
  business: string
  inventoryQuantity: number
  quantity: number
  title: string
  name: string
  sku: string
  image: string
  boxQty: number
  suppliersName: string
}
type ReceivingInventoryHookProps = {
  searchValue: string
}

export const useReceivingInventory = ({ searchValue }: ReceivingInventoryHookProps) => {
  const { state } = useContext(AppContext)
  const controllerRef = useRef<AbortController | null>(null)
  const [receivingInventory, setReceivingInventory] = useState<ReceivingInventory[]>([])

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

  const { isValidating, mutate: mutateReceivingInventory } = useSWR(
    state.user.businessId ? `/api/receivings/getReceivingInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      onSuccess: (data) => {
        setReceivingInventory(data?.inventory || [])
      },
    }
  )

  const handleOrderQty = useCallback(
    (value: number, sku: string) => {
      if (value === 0) {
        const newData = receivingInventory.map((item) => {
          if (item.sku === sku) {
            item.quantity = 0
            return item
          } else {
            return item
          }
        })

        setReceivingInventory(newData)
        return
      }
      const newData = receivingInventory.map((item) => {
        if (item.sku === sku) {
          item.quantity = value
          return item
        } else {
          return item
        }
      })
      setReceivingInventory(newData)
    },
    [receivingInventory]
  )

  const filterReceivingInventory = useMemo(() => {
    if (!receivingInventory) return []

    if (searchValue === '') return receivingInventory

    const lowerCaseSearchValue = searchValue.toLowerCase()

    return receivingInventory.filter(
      (item) =>
        item?.title?.toLowerCase().includes(lowerCaseSearchValue) ||
        searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
        item?.sku?.toLowerCase().includes(lowerCaseSearchValue)
    )
  }, [receivingInventory, searchValue])

  return { receivingInventory, filterReceivingInventory, isLoading: isValidating || !receivingInventory, mutateReceivingInventory, handleOrderQty }
}
