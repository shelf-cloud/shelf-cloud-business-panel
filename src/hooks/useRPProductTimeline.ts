import { ReorderingPointsTimelineResponse } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import useEffectAfterMount from './useEffectAfterMount'

export type ExpandedRowProps = { sessionToken: string; session: any; startDate: string; endDate: string }

export const useRPProductTimeline = ({ sessionToken, session, state, sku }: any) => {
  const controller = new AbortController()
  useEffectAfterMount(() => {
    return () => {
      controller.abort()
    }
  }, [])

  const fetcher = async (endPoint: string) => {
    try {
      const response = await axios.get<ReorderingPointsTimelineResponse>(endPoint, {
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

  const { data: productTimeline, isValidating: isLoadingProductsTimeline } = useSWR(
    session && state.user.businessId ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reorderingPoints/getReorderingPointsTimeline?region=${state.currentRegion}&businessId=${state.user.businessId}&sku=${sku}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 * 15, // 15 minutes
    }
  )

  return { productTimeline, isLoadingProductsTimeline }
}
