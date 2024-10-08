export interface InvoicesResponse {
    error: boolean
    message: string
    offset: string
    invoices: Invoice[]
}

export interface Invoice {
    invoicePoId: string
    orderNumber: string
    closedDate: string
    invoiceNumber: string
    poNumber: string
    storeId: number
    invoiceDate: string | null
    dueDate: string | null
    checkDate: string | null
    invoiceTotal: number
    checkTotal: number
    cashDiscountTotal: number
    checkNumber: string | null
    comments: string | null
    channelName: string
    storeName: string
    channelLogo: string
    payterms: number
}