import { columns } from '@components/products/TemplateInfo'

export type ProductFeedType = 'general' | 'identifiers' | 'reorderingPoint'

export type ProductFeedValidationError = {
  errorLine: number
  errorMessage: string
  value: string
}

export type ProductIdentifierFeedRow = {
  sku: string
  type: 'EAN' | 'Barcode' | 'WalmartCode' | 'FBA' | 'Other'
  value: string
}

export type ProductReorderingPointFeedRow = {
  sku: string
  isActive: boolean
  orderFrequency: number
  leadTimeSC: number
  daysOfStockSC: number
  manualLeadTime: number
}

export const IDENTIFIER_TYPE_LABELS = ['EAN', 'Barcode', 'Walmart Code', 'FBA', 'Other'] as const
export const IDENTIFIER_TYPE_VALUES = ['EAN', 'Barcode', 'WalmartCode', 'FBA', 'Other'] as const

export const PRODUCT_FEED_DEFINITIONS = {
  general: {
    label: 'Product General Information',
    worksheetName: 'Product Details Template',
    filename: 'Product General Information Template.xlsx',
    headers: columns.map((column) => column.header),
  },
  identifiers: {
    label: 'Products Identifiers',
    worksheetName: 'Products Identifiers Template',
    filename: 'Products Identifiers Template.xlsx',
    headers: ['Sku', 'Identifier Type', 'Identifier Value'],
  },
  reorderingPoint: {
    label: 'Products Reordering Point',
    worksheetName: 'Products Reordering Point Template',
    filename: 'Products Reordering Point Template.xlsx',
    headers: ['Sku', 'isActive', 'orderFrequency', 'leadTimeSC', 'daysOfStockSC', 'manualLeadTime'],
  },
} as const satisfies Record<ProductFeedType, { label: string; worksheetName: string; filename: string; headers: readonly string[] }>

const SKU_PATTERN = /^[a-zA-Z0-9-]+$/

const getCellValue = (value: unknown) => (value == null ? '' : String(value).trim())

const rowsHaveNoData = (rows: unknown[][]) => rows.length <= 1 || rows.slice(1).every((row) => row.every((value) => getCellValue(value) === ''))

export const validateProductFeedHeaders = (feedType: ProductFeedType, headerRow: unknown[]): ProductFeedValidationError[] => {
  const expectedHeaders = PRODUCT_FEED_DEFINITIONS[feedType].headers
  const receivedHeaders = headerRow.map(getCellValue)
  const hasMatchingHeaders = expectedHeaders.length === receivedHeaders.length && expectedHeaders.every((header, index) => header === receivedHeaders[index])

  if (hasMatchingHeaders) return []

  return [
    {
      errorLine: 1,
      errorMessage: `${PRODUCT_FEED_DEFINITIONS[feedType].label} columns do not match. Expected: ${expectedHeaders.join(', ')}`,
      value: receivedHeaders.join(', '),
    },
  ]
}

export const normalizeIdentifierType = (type: unknown): ProductIdentifierFeedRow['type'] | '' => {
  const trimmedType = getCellValue(type)
  if (trimmedType === 'Walmart Code') return 'WalmartCode'
  if (IDENTIFIER_TYPE_VALUES.includes(trimmedType as ProductIdentifierFeedRow['type'])) return trimmedType as ProductIdentifierFeedRow['type']
  return ''
}

const validateSku = (sku: string, line: number): ProductFeedValidationError | null => {
  if (SKU_PATTERN.test(sku) && sku.length >= 4 && sku.length <= 50) return null

  return {
    errorLine: line,
    errorMessage: `SKU: Required - No Spaces - Invalid Special characters: " ' @ ~ , ...`,
    value: sku,
  }
}

const validateNonNegativeNumber = (value: string, line: number, label: string): ProductFeedValidationError | null => {
  const numberValue = Number(value)
  if (value !== '' && Number.isFinite(numberValue) && numberValue >= 0) return null

  return {
    errorLine: line,
    errorMessage: `${label}: Required - Greater or Equal than 0`,
    value,
  }
}

const validateIdentifierFeedRows = (rows: unknown[][]): ProductFeedValidationError[] => {
  const errorsList: ProductFeedValidationError[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const sku = getCellValue(row[0])

    if (!sku) continue

    const skuError = validateSku(sku, i + 1)
    if (skuError) errorsList.push(skuError)

    const identifierType = normalizeIdentifierType(row[1])
    if (!identifierType) {
      errorsList.push({
        errorLine: i + 1,
        errorMessage: `Identifier Type: Valid values: ${IDENTIFIER_TYPE_LABELS.join(', ')}`,
        value: getCellValue(row[1]),
      })
    }

    const identifierValue = getCellValue(row[2])
    if (!identifierValue) {
      errorsList.push({
        errorLine: i + 1,
        errorMessage: 'Identifier Value: Required',
        value: identifierValue,
      })
    }
  }

  return errorsList
}

const validateReorderingPointFeedRows = (rows: unknown[][]): ProductFeedValidationError[] => {
  const errorsList: ProductFeedValidationError[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const sku = getCellValue(row[0])

    if (!sku) continue

    const skuError = validateSku(sku, i + 1)
    if (skuError) errorsList.push(skuError)

    const isActive = getCellValue(row[1]).toUpperCase()
    if (!['TRUE', 'FALSE'].includes(isActive)) {
      errorsList.push({
        errorLine: i + 1,
        errorMessage: 'isActive: Valid values: TRUE or FALSE',
        value: getCellValue(row[1]),
      })
    }

    const numericColumns = [
      ['orderFrequency', row[2]],
      ['leadTimeSC', row[3]],
      ['daysOfStockSC', row[4]],
      ['manualLeadTime', row[5]],
    ] as const

    for (const [label, value] of numericColumns) {
      const error = validateNonNegativeNumber(getCellValue(value), i + 1, label)
      if (error) errorsList.push(error)
    }
  }

  return errorsList
}

export const validateProductFeedRows = (feedType: ProductFeedType, rows: unknown[][]): ProductFeedValidationError[] => {
  const headerErrors = validateProductFeedHeaders(feedType, rows[0] || [])
  if (headerErrors.length > 0) return headerErrors

  if (rowsHaveNoData(rows)) {
    return [{ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' }]
  }

  if (feedType === 'identifiers') return validateIdentifierFeedRows(rows)
  if (feedType === 'reorderingPoint') return validateReorderingPointFeedRows(rows)

  return []
}

export function parseProductFeedRows(feedType: 'identifiers', rows: unknown[][]): ProductIdentifierFeedRow[]
export function parseProductFeedRows(feedType: 'reorderingPoint', rows: unknown[][]): ProductReorderingPointFeedRow[]
export function parseProductFeedRows(feedType: ProductFeedType, rows: unknown[][]): ProductIdentifierFeedRow[] | ProductReorderingPointFeedRow[] {
  if (feedType === 'identifiers') {
    return rows.slice(1).reduce<ProductIdentifierFeedRow[]>((productsInfo, row) => {
      const sku = getCellValue(row[0])
      if (!sku) return productsInfo

      productsInfo.push({
        sku,
        type: normalizeIdentifierType(row[1]) as ProductIdentifierFeedRow['type'],
        value: getCellValue(row[2]),
      })
      return productsInfo
    }, [])
  }

  if (feedType === 'reorderingPoint') {
    return rows.slice(1).reduce<ProductReorderingPointFeedRow[]>((productsInfo, row) => {
      const sku = getCellValue(row[0])
      if (!sku) return productsInfo

      productsInfo.push({
        sku,
        isActive: getCellValue(row[1]).toUpperCase() === 'TRUE',
        orderFrequency: Number(row[2]),
        leadTimeSC: Number(row[3]),
        daysOfStockSC: Number(row[4]),
        manualLeadTime: Number(row[5]),
      })
      return productsInfo
    }, [])
  }

  return []
}
