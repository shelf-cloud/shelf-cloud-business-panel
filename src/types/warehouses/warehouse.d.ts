export interface WarehousesResponse {
  warehouses: Warehouse[]
  error: boolean
  message?: string
}

export interface Warehouse {
  warehouseId: number
  isActive: boolean
  isSCDestination: boolean
  name: string
  type: string
  address1: string
  address2: any
  zipcode: string
  city: string
  state: string
  countryCode: string
}
