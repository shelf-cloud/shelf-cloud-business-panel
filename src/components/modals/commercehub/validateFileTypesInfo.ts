const HOMEDEPOT_HEADERS = [
  'Invoice Number',
  'Keyrec Number',
  'Doc Type',
  'Transaction Value',
  'Cash Discount Amount',
  'Clearing Document Number',
  'Payment/Chargeback Date',
  'Comments',
  'Reason Code',
  'SAP Company Code',
  'PO Number',
  'Reference/Check Number',
  'Invoice Date',
  'Posting Date',
  'Payment Number',
]
const HOMEDEPOT_HEADERS_LENGTH = 15

export const validateHomeDepotFile = async (resultValues: any) => {
  let errorsList = [] as any[]

  if (resultValues.length <= 1) {
    errorsList.push({ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' })
    return errorsList
  }

  const headerRow = resultValues[0] as any
  if (headerRow.length !== HOMEDEPOT_HEADERS_LENGTH) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Missing Columns' })
    return errorsList
  }

  if (headerRow.join(',') !== HOMEDEPOT_HEADERS.join(',')) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Invalid Columns' })
    return errorsList
  }

  return errorsList
}

const LOWES_HEADERS = [
  'Invoice Number',
  'Invoice Date',
  'Due Date',
  'Check Date',
  'Invoice Amount',
  'Store Number',
  'PO Number',
  'Check Number',
  'Check Amount',
  'Discount',
  'Comments',
  'Comments',
]
const LOWES_HEADERS_LENGTH = 12

export const validateLowesFile = async (resultValues: any) => {
  let errorsList = [] as any[]

  if (resultValues.length <= 1) {
    errorsList.push({ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' })
    return errorsList
  }

  const headerRow = resultValues[0] as any
  if (headerRow.length !== LOWES_HEADERS_LENGTH) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Missing Columns' })
    return errorsList
  }

  if (headerRow.join(',') !== LOWES_HEADERS.join(',')) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Invalid Columns' })
    return errorsList
  }

  return errorsList
}

const CITI_BANK_LOWES_HEADERS = [
  'Reference',
  'Payment Reference',
  'Buyer Name',
  'Buyer Account',
  'Supplier Name',
  'Supplier Account',
  'Invoice Status',
  'PMT ID',
  'Issue Date',
  'Due Date',
  'Settle Date',
  'Currency',
  'Amount',
  'Remittances',
  'Add. Info.',
  'Status',
  'Base Rate(%)',
  'Spread Rate(%)',
  'Discount Rate(%)',
  'Discount Tenor',
  'Type',
  'Remit No',
  'Remit Date',
  'Pay Date',
  'Tenor',
  'Net Amount',
  'Gross Amount',
  'Adj Amount',
  'Disc Amount',
  'PO No',
  'Doc No',
  'Comment',
  'Adj Code',
  'Add. Info.',
  'CM Adjusted',
  'CM Adjusted Net Amount',
  'Fee',
  'Charge',
  'Proceeds',
]

const CITI_BANK_LOWES_HEADERS_LENGTH = 39

export const validateCitiBankLowesFile = async (resultValues: any) => {
  let errorsList = [] as any[]

  if (resultValues.length <= 1) {
    errorsList.push({ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' })
    return errorsList
  }

  const headerRow = resultValues[0] as any
  if (headerRow.length !== CITI_BANK_LOWES_HEADERS_LENGTH) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Missing Columns' })
    return errorsList
  }

  if (headerRow.join(',') !== CITI_BANK_LOWES_HEADERS.join(',')) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Invalid Columns' })
    return errorsList
  }

  return errorsList
}
