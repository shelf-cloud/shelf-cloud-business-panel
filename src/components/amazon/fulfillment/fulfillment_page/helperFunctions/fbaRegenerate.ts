import router from 'next/router'

import axios from 'axios'
import { toast } from 'react-toastify'

export const regenerateFBAPlacementOptions = async (currentRegion: string, businessId: string, inboundPlanId: string) => {
  const regenerateFBAPlacementOptions = toast.loading('Re-Generating Placement Options...')

  const response = await axios(`/api/amazon/fullfilments/masterBoxes/regenerateFBAPlacementOptions?region=${currentRegion}&businessId=${businessId}&inboundPlanId=${inboundPlanId}`)
    .then(({ data }) => {
      return data
    })
    .catch(() => {
      return { data: { error: true, message: 'Error regenerating FBA placement options' } }
    })

  if (!response.error) {
    toast.update(regenerateFBAPlacementOptions, {
      render: response.message,
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    })

    router.push(`/amazon-sellers/fulfillments`)
  } else {
    toast.update(regenerateFBAPlacementOptions, {
      render: response.message,
      type: 'error',
      isLoading: false,
      autoClose: 3000,
    })
  }
}
