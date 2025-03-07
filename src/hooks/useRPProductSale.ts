import { ReorderingPointsSalesResponse } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import useEffectAfterMount from './useEffectAfterMount'

export type ExpandedRowProps = { sessionToken: string; session: any; startDate: string; endDate: string }

export const useRPProductSales = ({ sessionToken, session, state, startDate, endDate, sku }: any) => {
  const controller = new AbortController()
  useEffectAfterMount(() => {
    return () => {
      controller.abort()
    }
  }, [])

  const fetcher = async (endPoint: string) => {
    try {
      const response = await axios.get<ReorderingPointsSalesResponse>(endPoint, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error((error as any)?.data?.message || 'Error fetching product performance data')
        throw error
      }
    }
  }

  const { data: productSales, isValidating: isLoadingProductsSales } = useSWR(
    session && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getReorderingPointsSales?region=${state.currentRegion}&businessId=${state.user.businessId}&sku=${sku}&startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 * 15, // 15 minutes
    }
  )

  return { productSales, isLoadingProductsSales: isLoadingProductsSales }
}
