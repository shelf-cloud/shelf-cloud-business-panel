import ExcelJS from 'exceljs'
import { reportTemplateColumns } from './documentsHeaderColumns'
import moment from 'moment'
import { getDeductionsValue, getInvoiceTotal, getOrderStatus, getPendingValue } from '../helperFunctions'



export const generateDocument = async (reportType: string, info: any[]) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(reportType.toUpperCase())
  worksheet.columns = reportTemplateColumns[reportType]

  switch (reportType) {
    case 'checkSummary':
      for await (const row of info) {
        worksheet.addRow({
          storeName: row.storeName,
          checkNumber: row.checkNumber,
          checkDate: moment.utc(row.checkDate).local().format('YYYY-MM-DD'),
          checkPaid: parseFloat((row.checkTotal + row.cashDiscountTotal).toFixed(2)),
          deductions: row.deductions,
        })
      }
      break
    case 'deductions':
      for await (const row of info) {
        worksheet.addRow({
          storeName: row.storeName,
          invoiceNumber: row.invoiceNumber,
          poNumber: row.poNumber,
          comments: row.comments,
          checkDate: moment.utc(row.checkDate).local().format('YYYY-MM-DD'),
          checkNumber: row.checkNumber,
          deductions: row.checkTotal,
          status: !row.status || row.status === '' ? 'pending' : row.status,
        })
      }
      break
    case 'invoices':
      for await (const row of info) {
        worksheet.addRow({
          storeName: row.storeName,
          invoiceNumber: row.invoiceNumber,
          orderNumber: row.orderNumber,
          poNumber: row.poNumber,
          invoiceDate: moment
            .utc(row.invoiceDate ?? row.closedDate)
            .local()
            .format('YYYY-MM-DD'),
          invoiceTotal: getInvoiceTotal(row.orderTotal, row.invoiceTotal),
          dueDate: row.dueDate ? moment.utc(row.dueDate).local().format('YYYY-MM-DD') : moment.utc(row.closedDate).local().add(row.payterms, 'days').format('YYYY-MM-DD'),
          checkDate: row.checkDate ? moment.utc(row.checkDate).local().format('YYYY-MM-DD') : '',
          checkNumber: row.checkNumber ? row.checkNumber : '',
          totalPaid: row.checkTotal ? row.checkTotal : '',
          deductions: getDeductionsValue(row.orderTotal, row.checkTotal),
          pending: getPendingValue(row.orderTotal, row.invoiceTotal, row.checkTotal),
          commerceHubStatus: getOrderStatus(row.checkNumber, row.commerceHubStatus),
          commerceHubComment: !row.commerceHubComment || row.commerceHubComment === '' ? '' : row.commerceHubComment,
        })
      }
      break
    default:
      break
  }

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Report ${reportType}.xlsx`
    a.click()
  })
}
