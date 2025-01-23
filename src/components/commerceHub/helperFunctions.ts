import { Invoice } from "@typesTs/commercehub/invoices"

export const getDeductionsValue = (orderTotal: number, checkTotal: number) => {
  if (!checkTotal) return ''
  const deductions = parseFloat((orderTotal - checkTotal).toFixed(2))
  if (deductions > 0) {
    return deductions * -1
  } else {
    return 0
  }
}

export const getOrderStatus = (checkNumber: string, commerceHubStatus: string) => {
  if (checkNumber) return 'Paid'
  if (commerceHubStatus) return commerceHubStatus
  return 'unpaid'
}

export const getPendingValue = (orderTotal: number, invoiceTotal: number, checkTotal: number) => {
  if (invoiceTotal) return parseFloat((invoiceTotal - checkTotal).toFixed(2))
  if (orderTotal > invoiceTotal) return parseFloat((orderTotal - checkTotal).toFixed(2))
  return parseFloat((invoiceTotal - checkTotal).toFixed(2))
}

export const getInvoiceTotal = (orderTotal: number, invoiceTotal: number) => {
  if (!invoiceTotal) return parseFloat(orderTotal.toFixed(2))
  if (orderTotal > invoiceTotal) return parseFloat(orderTotal.toFixed(2))
  return parseFloat(invoiceTotal.toFixed(2))
}

export const getCheckAmountTotal = (invoices: Invoice[]) => {
  return invoices.reduce((acc, invoice) => {
    const { orderTotal, checkTotal, cashDiscountTotal } = invoice

    const orderTotalShort = parseFloat(orderTotal.toFixed(2))
    const checkTotalShort = parseFloat(checkTotal.toFixed(2))

    if(checkTotalShort < 0) return acc + checkTotalShort + cashDiscountTotal
    if(!orderTotalShort) return acc + checkTotalShort + cashDiscountTotal
    if(orderTotalShort == checkTotalShort) return acc + checkTotalShort + cashDiscountTotal
    return acc + orderTotalShort + cashDiscountTotal
  }, 0)
}