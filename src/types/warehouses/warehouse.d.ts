export interface WarehousesResponse {
    warehouses: Warehouse[]
    error: boolean
  }
  
  export interface Warehouse {
    warehouseId: number
    isActive: boolean
    name: string
    type: string
    address1: string
    address2: any
    zipcode: string
    city: string
    state: string
    countryCode: string
  }