const localUS = 'en-US'
const optionsUS = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
}
const localEU = 'es-ES'
const optionsEU = {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
}

export const FormatCurrency = (route: string, value: number) => {
    const Format = new Intl.NumberFormat(route == 'us' ? localUS : localEU, route == 'us' ? optionsUS : optionsEU)
    return Format.format(value)
}

// export const FormatCurrency = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
//   maximumFractionDigits: 2,
// })


export const FormatIntNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})