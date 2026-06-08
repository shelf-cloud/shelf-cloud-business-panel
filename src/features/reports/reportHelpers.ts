export const PRODUCTS_REPORT_TYPE = 'productsReport'
export const SHIPMENTS_REPORT_TYPE = 'shipmentsReport'

export type ReportProductSource = {
  inventoryId: number
  sku: string
}

export type ReportProductPayload = {
  id: number
  sku: string
}

type BuildCreateReportRequestParams = {
  reportType: string
  region: string
  businessId: string | number
  businessName: string
  startDate: string
  endDate: string
  products: ReportProductPayload[]
}

export const parseSelectedProductIds = (selectedProducts: string): number[] => {
  try {
    const parsedValue = JSON.parse(selectedProducts)

    if (!Array.isArray(parsedValue)) return []

    return parsedValue.map((value) => Number(value)).filter((value) => Number.isInteger(value))
  } catch {
    return []
  }
}

export const getSelectedReportProducts = (products: ReportProductSource[], selectedProducts: string): ReportProductPayload[] => {
  const selectedIds = new Set(parseSelectedProductIds(selectedProducts))

  return products.filter((product) => selectedIds.has(product.inventoryId)).map((product) => ({ id: product.inventoryId, sku: product.sku }))
}

export const buildCreateReportRequest = ({ reportType, region, businessId, businessName, startDate, endDate, products }: BuildCreateReportRequestParams) => {
  const queryParams = new URLSearchParams({
    region,
    businessId: String(businessId),
  })
  const body: { businessName?: string; startDate?: string; endDate?: string; products?: ReportProductPayload[] } = {}

  if (reportType === PRODUCTS_REPORT_TYPE) {
    body.businessName = businessName
    body.startDate = startDate
    body.endDate = endDate
    body.products = products
  } else {
    queryParams.set('businessName', businessName)
    queryParams.set('startDate', startDate)
    queryParams.set('endDate', endDate)
  }

  return {
    url: `/api/reports/createReport/${reportType}?${queryParams.toString()}`,
    body,
  }
}
