export const FormatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})


export const FormatIntNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})