import AppContext from '@context/AppContext'
import axios from 'axios'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

export type SplitNames = { [key: string]: string }

type SplitsResponse = {
  error?: boolean
  splitNames: SplitNames
}

const GENERIC_SPLITS_NAMES = {
  '0': 'Split # 1',
  '1': 'Split # 2',
  '2': 'Split # 3',
}

export const useRPSplits = () => {
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
      const response = await axios.get<SplitsResponse>(endPoint, {
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

  const {
    data: splits,
    isValidating,
    mutate: mutateSplits,
  } = useSWR(state.user.businessId ? `/api/reorderingPoints/getRPSplits?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  })

  const saveNewSplitName = useCallback(
    async (splitId: string, newName: string) => {
      const setNewSplitNameTaost = toast.loading('Updating Split Name...')

      await axios
        .post(`/api/reorderingPoints/setNewSplitName?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          splitId,
          newName,
        })
        .then(({ data }) => {
          if (data.error) {
            toast.update(setNewSplitNameTaost, {
              render: data.message,
              type: 'error',
              isLoading: false,
              autoClose: 3000,
            })
          } else {
            toast.update(setNewSplitNameTaost, {
              render: 'Split Name updated successfully',
              type: 'success',
              isLoading: false,
              autoClose: 3000,
            })
            mutateSplits()
          }
        })
        .catch(() => {
          toast.update(setNewSplitNameTaost, {
            render: 'Error updating Split Name',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
        })
    },
    [mutateSplits, state.currentRegion, state.user.businessId]
  )

  return { splitNames: splits?.splitNames ?? GENERIC_SPLITS_NAMES, isLoading: isValidating, saveNewSplitName }
}
