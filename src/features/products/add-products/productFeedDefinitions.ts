import { columns } from '@components/products/TemplateInfo'

export type ProductFeedType = 'general' | 'identifiers' | 'reorderingPoint' | 'dimensions'

export type ProductFeedValidationError = {
  errorLine: number
  errorMessage: string
  value: string
}

export type ProductIdentifierType = 'EAN' | 'Barcode' | 'WalmartCode' | 'FBA' | 'Other'

export type ProductIdentifierFeedRow = {
  sku: string
  type: ProductIdentifierType
  value: string
}

export type ProductIdentifiersFeedEntry = {
  sku: string
  identifiers: { type: ProductIdentifierType; value: string }[]
}

export type ProductReorderingPointFeedRow = {
  sku: string
  isActive: boolean
  orderFrequency: number
  leadTimeSC: number
  daysOfStockSC: number
  manualLeadTime: boolean
}

export type ProductDimensionsFeedRow = {
  sku: string
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
}

export const IDENTIFIER_TYPE_LABELS = ['EAN', 'Barcode', 'Walmart Code', 'FBA', 'Other'] as const
export const IDENTIFIER_TYPE_VALUES = ['EAN', 'Barcode', 'WalmartCode', 'FBA', 'Other'] as const

type ProductFeedDefinition = {
  label: string
  worksheetName: string
  filename: string
  headers: readonly string[]
  description: string
  instructions: readonly string[]
}

export const PRODUCT_FEED_DEFINITIONS = {
  general: {
    label: 'Product General Information',
    worksheetName: 'Product Details Template',
    filename: 'Product General Information Template.xlsx',
    headers: columns.map((column) => column.header),
    description: 'Use this feed to add new products or update general product details in bulk.',
    instructions: [
      'Export the template, fill or update product rows, then save/export it as a CSV file before uploading.',
      'Keep column names and column order unchanged.',
      'Use the Empty Template to add new products; use this feed to update exported product rows.',
    ],
  },
  identifiers: {
    label: 'Products Identifiers',
    worksheetName: 'Products Identifiers Template',
    filename: 'Products Identifiers Template.xlsx',
    headers: ['Sku', 'Identifier Type', 'Identifier Value'],
    description: 'Use this feed to add or update product identifiers like EAN, Barcode, Walmart Code, FBA, or Other.',
    instructions: [
      'Export the template, add one row per identifier, then save/export it as a CSV file before uploading.',
      'You can copy rows and add more SKUs, including multiple rows for the same SKU.',
      'Only use valid identifier types and do not change column names or column order.',
    ],
  },
  reorderingPoint: {
    label: 'Products Reordering Point',
    worksheetName: 'Products Reordering Point Template',
    filename: 'Products Reordering Point Template.xlsx',
    headers: ['Sku', 'Is Active in Reordering Points', 'Order Frequency (Weeks)', 'Lead Time (Days)', 'Days Of Stock After Lead Time (Days)', 'Manual Lead Time'],
    description: 'Use this feed to update reordering point settings for existing products.',
    instructions: [
      'Export the template, update values, then save/export it as a CSV file before uploading.',
      'Use TRUE or FALSE for isActive and manualLeadTime.',
      'Use numbers greater than or equal to 0 for Order Frequency (Weeks), Lead Time (Days), and Days Of Stock After Lead Time (Days).',
    ],
  },
  dimensions: {
    label: 'Products Dimensions',
    worksheetName: 'Products Dimensions Template',
    filename: 'Products Dimensions Template.xlsx',
    headers: [
      'Sku',
      'Unit Weight',
      'Unit Length',
      'Unit Width',
      'Unit Height',
      'Carton Box Quantity',
      'Carton Box Weight',
      'Carton Box Length',
      'Carton Box Width',
      'Carton Box Height',
    ],
    description: 'Use this feed to update item and box dimensions for existing products.',
    instructions: [
      'Export the template, update dimension values, then save/export it as a CSV file before uploading.',
      'All dimension and weight values must be greater than 0.',
      'boxQty must be a whole number greater than 0.',
    ],
  },
} as const satisfies Record<ProductFeedType, ProductFeedDefinition>

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

const validateBooleanValue = (value: string, line: number, label: string): ProductFeedValidationError | null => {
  if (['TRUE', 'FALSE'].includes(value.toUpperCase())) return null

  return {
    errorLine: line,
    errorMessage: `${label}: Valid values: TRUE or FALSE`,
    value,
  }
}

const validatePositiveNumber = (value: string, line: number, label: string, integer = false): ProductFeedValidationError | null => {
  const numberValue = Number(value)
  const isValid = value !== '' && Number.isFinite(numberValue) && numberValue > 0 && (!integer || Number.isInteger(numberValue))
  if (isValid) return null

  return {
    errorLine: line,
    errorMessage: `${label}: Required${integer ? ' - Integer' : ''} - Greater than 0`,
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

    const isActiveError = validateBooleanValue(getCellValue(row[1]), i + 1, 'isActive')
    if (isActiveError) errorsList.push(isActiveError)

    const numericColumns = [
      ['orderFrequency', row[2]],
      ['leadTimeSC', row[3]],
      ['daysOfStockSC', row[4]],
    ] as const

    for (const [label, value] of numericColumns) {
      const error = validateNonNegativeNumber(getCellValue(value), i + 1, label)
      if (error) errorsList.push(error)
    }

    const manualLeadTimeError = validateBooleanValue(getCellValue(row[5]), i + 1, 'manualLeadTime')
    if (manualLeadTimeError) errorsList.push(manualLeadTimeError)
  }

  return errorsList
}

const validateDimensionsFeedRows = (rows: unknown[][]): ProductFeedValidationError[] => {
  const errorsList: ProductFeedValidationError[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const sku = getCellValue(row[0])

    if (!sku) continue

    const skuError = validateSku(sku, i + 1)
    if (skuError) errorsList.push(skuError)

    const numericColumns = [
      ['weight', row[1], false],
      ['length', row[2], false],
      ['width', row[3], false],
      ['height', row[4], false],
      ['boxQty', row[5], true],
      ['boxWeight', row[6], false],
      ['boxLength', row[7], false],
      ['boxWidth', row[8], false],
      ['boxHeight', row[9], false],
    ] as const

    for (const [label, value, integer] of numericColumns) {
      const error = validatePositiveNumber(getCellValue(value), i + 1, label, integer)
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
  if (feedType === 'dimensions') return validateDimensionsFeedRows(rows)

  return []
}

export function parseProductFeedRows(feedType: 'identifiers', rows: unknown[][]): ProductIdentifiersFeedEntry[]
export function parseProductFeedRows(feedType: 'reorderingPoint', rows: unknown[][]): ProductReorderingPointFeedRow[]
export function parseProductFeedRows(feedType: 'dimensions', rows: unknown[][]): ProductDimensionsFeedRow[]
export function parseProductFeedRows(
  feedType: Exclude<ProductFeedType, 'general'>,
  rows: unknown[][]
): ProductIdentifiersFeedEntry[] | ProductReorderingPointFeedRow[] | ProductDimensionsFeedRow[]
export function parseProductFeedRows(feedType: ProductFeedType, rows: unknown[][]): ProductIdentifiersFeedEntry[] | ProductReorderingPointFeedRow[] | ProductDimensionsFeedRow[] {
  if (feedType === 'identifiers') {
    const entriesBySku = new Map<string, ProductIdentifiersFeedEntry>()
    for (const row of rows.slice(1)) {
      const sku = getCellValue(row[0])
      if (!sku) continue

      const entry = entriesBySku.get(sku) ?? { sku, identifiers: [] }
      entry.identifiers.push({
        type: normalizeIdentifierType(row[1]) as ProductIdentifierType,
        value: getCellValue(row[2]),
      })
      entriesBySku.set(sku, entry)
    }
    return [...entriesBySku.values()]
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
        manualLeadTime: getCellValue(row[5]).toUpperCase() === 'TRUE',
      })
      return productsInfo
    }, [])
  }

  if (feedType === 'dimensions') {
    return rows.slice(1).reduce<ProductDimensionsFeedRow[]>((productsInfo, row) => {
      const sku = getCellValue(row[0])
      if (!sku) return productsInfo

      productsInfo.push({
        sku,
        weight: Number(row[1]),
        length: Number(row[2]),
        width: Number(row[3]),
        height: Number(row[4]),
        boxQty: Number(row[5]),
        boxWeight: Number(row[6]),
        boxLength: Number(row[7]),
        boxWidth: Number(row[8]),
        boxHeight: Number(row[9]),
      })
      return productsInfo
    }, [])
  }

  return []
}
