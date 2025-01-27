export interface DashboardResponse {
    invoices: Invoice[]
    summary: Summary[]
}

export interface Invoice {
    totalInvoices: number
    storeId: number
    checkDate: string
    orderTotal: number
    checkTotal: number
    deductions: number
    charges: number
    checkNumber?: string
    storeName: string
    channelLogo: string
    payterms: string
}

export interface Summary {
    storeId: string
    totalInvoices: number
    orderTotal: number
    storeName: string
    channelLogo: string
  }