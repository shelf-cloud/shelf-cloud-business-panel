import { useCallback, useMemo } from 'react'

import { IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES } from '@components/constants/receivings'
import { Warehouse } from '@typesTs/warehouses/warehouse'

export const useFilterWarehousesByShipmentType = (warehouses: Warehouse[], shipmentType: string) => {
  const filteredWarehouses = useMemo(() => {
    const selectWarehouses = warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []

    if (!shipmentType) return selectWarehouses

    if (shipmentType === 'parcel_boxes') {
      return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.parcel_boxes.includes(wh.value))
    }
    if (shipmentType === 'ltl') {
      return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.ltl.includes(wh.value))
    }
    if (shipmentType === 'container') {
      return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.container.includes(wh.value))
    }

    return selectWarehouses
  }, [warehouses, shipmentType])

  const splitFilteredWarehouses = useCallback(
    (shipmentType: string) => {
      const selectWarehouses = warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []

      if (!shipmentType) return selectWarehouses

      if (shipmentType === 'parcel_boxes') {
        return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.parcel_boxes.includes(wh.value))
      }
      if (shipmentType === 'ltl') {
        return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.ltl.includes(wh.value))
      }
      if (shipmentType === 'container') {
        return selectWarehouses.filter((wh) => !IGNORE_WAREHOUSES_FOR_SHIPMENT_TYPES.container.includes(wh.value))
      }

      return selectWarehouses
    },
    [warehouses]
  )

  return { filteredWarehouses, splitFilteredWarehouses }
}
