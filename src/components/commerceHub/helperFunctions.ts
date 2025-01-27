import { Invoice } from '@typesTs/commercehub/invoices'

export const getOrderStatus = (checkNumber: string, commerceHubStatus: string) => {
  if (checkNumber) return 'Paid'
  if (commerceHubStatus) return commerceHubStatus
  return 'unpaid'
}

export const getCheckAmountTotal = (invoices: Invoice[]) => {
  const totalPaid = invoices.reduce((acc, invoice) => {
    const { orderTotal, charges, deductions, checkTotal } = invoice

    if (deductions < 0) return acc + orderTotal + deductions + charges
    if (checkTotal < 0) return acc + orderTotal + checkTotal + charges
    return acc + orderTotal + charges
  }, 0)
  if (totalPaid <= 0) return 0
  return parseFloat(totalPaid.toFixed(2))
}

export const getTotalPaid = (orderTotal: number, deductions: number, charges: number) => {
  const totalPaid = orderTotal + deductions + charges
  if (totalPaid <= 0) return 0
  return parseFloat(totalPaid.toFixed(2))
}

export const getTotalPending = (orderTotal: number, deductions: number, charges: number) => {
  const totalPending = orderTotal - (orderTotal + deductions * -1 + charges * -1)
  if (totalPending <= 0) return 0
  return parseFloat(totalPending.toFixed(2))
}
