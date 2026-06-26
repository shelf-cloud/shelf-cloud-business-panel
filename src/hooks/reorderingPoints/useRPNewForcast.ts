import { useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

export interface GenerateNewProductsForecastResponse {
  error: boolean
  message?: string
}

export const useRPNewForecast = () => {
  const { state } = useContext(AppContext)

  const generate_new_forecast_products = async ({ skus, productIds }: { skus: string[]; productIds: number[] }) => {
    if (skus.length === 0 || productIds.length === 0) {
      toast.error('No SKUs or Product IDs provided for generating new cache.')
      return
    }

    const { data } = await axios.post<GenerateNewProductsForecastResponse>(
      `/api/reorderingPoints/generate-new-products-cache?region=${state.currentRegion}&businessId=${state.user.businessId}`,
      {
        skus,
        productIds,
      }
    )

    if (data.error) {
      toast.error(data.message || 'Error generating new cache for products.')
    } else {
      toast.success(data.message || 'New cache generated.')
    }
  }

  return {
    generate_new_forecast_products,
  }
}
