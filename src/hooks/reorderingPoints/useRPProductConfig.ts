import { useState } from 'react'

import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'

export type RPProductConfig = {
  isOpen: boolean
  product: ReorderingPointsProduct
}

export const useRPProductConfig = () => {
  const [rpProductConfig, setRPProductConfig] = useState({
    isOpen: false,
    product: {} as ReorderingPointsProduct,
  })

  return { rpProductConfig, setRPProductConfig }
}
