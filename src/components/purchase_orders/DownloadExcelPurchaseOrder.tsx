import React, { useContext } from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import AppContext from '@context/AppContext'
import { PurchaseOrder } from '@typesTs/purchaseOrders'

type Props = {
  purchaseOrder: PurchaseOrder
}

const DownloadExcelPurchaseOrder = ({ purchaseOrder }: Props) => {
  const { state }: any = useContext(AppContext)
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`PO - ${purchaseOrder.orderNumber}`)

    worksheet.pageSetup.printArea = 'A:E'
    worksheet.pageSetup.fitToPage = true
    worksheet.pageSetup.fitToWidth = 1
    worksheet.pageSetup.fitToHeight = 10

    worksheet.getColumn(1).width = 23
    worksheet.getColumn(2).width = 45
    worksheet.getColumn(3).width = 13
    worksheet.getColumn(4).width = 17
    worksheet.getColumn(5).width = 10

    const rowValues1 = []
    rowValues1[1] = 'PURCHASE ORDER'
    rowValues1[4] = purchaseOrder.orderNumber
    worksheet.addRow(rowValues1)
    worksheet.mergeCells('A1', 'B2')
    worksheet.mergeCells('D1', 'E2')

    const cellA1 = worksheet.getCell('A1')
    cellA1.font = {
      family: 2,
      size: 20,
      bold: true,
    }
    cellA1.alignment = { vertical: 'middle' }

    const cellD1 = worksheet.getCell('D1')
    cellD1.font = {
      color: { argb: '458BC9' },
      family: 2,
      size: 22,
      bold: true,
    }
    cellD1.alignment = { vertical: 'middle', horizontal: 'right' }

    Array(1)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow([state.user.name, '', '', `PO Date: ${purchaseOrder.date}`])
    worksheet.mergeCells('D4', 'E4')
    const cellDate = worksheet.getCell('D4')
    cellDate.font = { bold: true }
    cellDate.alignment = { vertical: 'middle', horizontal: 'right' }

    worksheet.addRow([state.user.us.address])
    worksheet.addRow([`${state.user.us.city}, ${state.user.us.state} ${state.user.us.zipcode} ${state.user.us.country}`])
    worksheet.addRow([state.user.us.email])
    worksheet.addRow([state.user.us.website])
    worksheet.addRow([`Supplier: ${purchaseOrder.suppliersName}`])
    worksheet.getCell('A9').font = { bold: true }

    Array(2)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow(['Bill Info:', 'Ship To:'])
    worksheet.getRow(12).font = {
      color: { argb: '000' },
      family: 2,
      size: 16,
      bold: true,
    }

    worksheet.addRow([state.user.us.name, state.user.us.name])
    worksheet.addRow([state.user.us.contactName, state.user.us.contactName])
    worksheet.addRow([state.user.us.address, state.user.us.address])
    worksheet.addRow([
      `${state.user.us.city}, ${state.user.us.state} ${state.user.us.zipcode} ${state.user.us.country}`,
      `${state.user.us.city}, ${state.user.us.state} ${state.user.us.zipcode} ${state.user.us.country}`,
    ])
    worksheet.addRow([`Phone: ${state.user.us.phone}`, `Phone: ${state.user.us.phone}`])

    Array(2)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    const rowTitles = worksheet.addRow(['SKU', 'Product Name', 'UPC', 'Qty Per Box', 'Order Qty'])
    rowTitles.font = { bold: true }
    rowTitles.alignment = { horizontal: 'center' }
    rowTitles.getCell(1).border = {
      top: { style: 'thin', color: { argb: '909497' } },
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTitles.getCell(2).border = {
      top: { style: 'thin', color: { argb: '909497' } },
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTitles.getCell(3).border = {
      top: { style: 'thin', color: { argb: '909497' } },
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTitles.getCell(4).border = {
      top: { style: 'thin', color: { argb: '909497' } },
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTitles.getCell(5).border = {
      top: { style: 'thin', color: { argb: '909497' } },
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }

    for (const product of purchaseOrder.poItems) {
      const rowValues = []
      rowValues[1] = product.sku
      rowValues[2] = product.title
      rowValues[3] = product.barcode
      rowValues[4] = product.boxQty
      rowValues[5] = product.orderQty

      const rowItem = worksheet.addRow(rowValues)
      rowItem.getCell(1).alignment = { horizontal: 'center' }
      rowItem.getCell(4).alignment = { horizontal: 'center' }
      rowItem.getCell(5).alignment = { horizontal: 'center' }
      rowItem.getCell(1).border = {
        left: { style: 'thin', color: { argb: '909497' } },
        right: { style: 'thin', color: { argb: '909497' } },
        bottom: { style: 'thin', color: { argb: '909497' } },
      }
      rowItem.getCell(2).border = {
        left: { style: 'thin', color: { argb: '909497' } },
        right: { style: 'thin', color: { argb: '909497' } },
        bottom: { style: 'thin', color: { argb: '909497' } },
      }
      rowItem.getCell(3).border = {
        left: { style: 'thin', color: { argb: '909497' } },
        right: { style: 'thin', color: { argb: '909497' } },
        bottom: { style: 'thin', color: { argb: '909497' } },
      }
      rowItem.getCell(4).border = {
        left: { style: 'thin', color: { argb: '909497' } },
        right: { style: 'thin', color: { argb: '909497' } },
        bottom: { style: 'thin', color: { argb: '909497' } },
      }
      rowItem.getCell(5).border = {
        left: { style: 'thin', color: { argb: '909497' } },
        right: { style: 'thin', color: { argb: '909497' } },
        bottom: { style: 'thin', color: { argb: '909497' } },
      }
    }

    const totalValues = []
    totalValues[1] = ''
    totalValues[2] = ''
    totalValues[3] = ''
    totalValues[4] = 'TOTAL'
    totalValues[5] = purchaseOrder.poItems.reduce((acc, item) => acc + item.orderQty, 0)
    const rowTotal = worksheet.addRow(totalValues)
    rowTotal.font = { bold: true }
    rowTotal.alignment = { horizontal: 'center' }
    rowTotal.getCell(1).border = {
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTotal.getCell(2).border = {
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTotal.getCell(3).border = {
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTotal.getCell(4).border = {
      left: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }
    rowTotal.getCell(5).border = {
      left: { style: 'thin', color: { argb: '909497' } },
      right: { style: 'thin', color: { argb: '909497' } },
      bottom: { style: 'thin', color: { argb: '909497' } },
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PO - ${purchaseOrder.suppliersName} - ${purchaseOrder.orderNumber}.xlsx`
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <Button color='primary' className='btn-label' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </Button>
  )
}

export default DownloadExcelPurchaseOrder
