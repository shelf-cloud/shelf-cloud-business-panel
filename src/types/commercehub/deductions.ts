export interface DeductionsResponse {
    error: boolean
    message: string
    offset: string
    search: any
    invoices: DeductionType[]
  }
  
  export interface DeductionType {
    id: number
    invoicePoId: string
    invoiceNumber: string
    poNumber: string
    checkDate: string
    checkTotal: number
    checkNumber: string
    comments?: string
    status: string | null
    channelName: string
    storeName: string
    channelLogo: string
    payterms: number
  }