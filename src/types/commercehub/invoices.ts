export interface InvoicesResponse {
  error: boolean
  message: string
  offset: string
  invoices: Invoice[]
}

export interface Invoice {
  id: number
  orderId: number
  invoicePoId: string
  orderNumber: string
  closedDate: string
  invoiceNumber: string
  poNumber: string
  storeId: number
  invoiceDate: string | null
  dueDate: string | null
  checkDate: string | null
  orderTotal: number
  invoiceTotal: number
  checkTotal: number
  deductions: number
  charges: number
  checkNumber: string | null
  keyrecNumber: string | null
  comments: string | null
  status: string | null
  commerceHubStatus: string | null
  commerceHubComment: string | null
  channelName: string
  storeName: string
  channelLogo: string
  payterms: number
}

export interface CommerceHubStoresResponse {
  stores: CommerceHubStore[]
}

export interface CommerceHubStore {
  value: string
  label: string
  logoLink: string
  payTerms: number
  fileType: string
}
