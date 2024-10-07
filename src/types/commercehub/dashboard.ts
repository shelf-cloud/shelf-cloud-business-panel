export interface DashboardResponse {
    invoices: Invoice[]
}

export interface Invoice {
    totalInvoices: number
    storeId: number
    invoiceTotal: number
    checkTotal: number
    checkNumber?: string
    storeName: string
    payterms: string
}