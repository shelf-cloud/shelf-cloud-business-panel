const localUS = 'en-US'
const optionsUS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
} as any
const localEU = 'es-ES'
const optionsEU = {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
} as any

export const FormatCurrency = (route: string, value: number) => {
  const Format = new Intl.NumberFormat(route == 'us' ? localUS : localEU, route == 'us' ? optionsUS : optionsEU)
  return Format.format(value)
}

const optionsInt = {
  maximumFractionDigits: 0,
}

const optionsIntPercantage = {
  maximumFractionDigits: 2,
}

export const FormatIntNumber = (route: string, value: number) => {
  const Format = new Intl.NumberFormat(route == 'us' ? localUS : localEU, route == 'us' ? optionsInt : optionsInt)
  return Format.format(value)
}

export const FormatIntPercentage = (route: string, value: number) => {
  const Format = new Intl.NumberFormat(route == 'us' ? localUS : localEU, route == 'us' ? optionsIntPercantage : optionsIntPercantage)
  return Format.format(value)
}

export function FormatBytes(bytes: any, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
