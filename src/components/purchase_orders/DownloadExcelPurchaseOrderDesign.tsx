import React, { useContext } from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import AppContext from '@context/AppContext'
import { PurchaseOrder } from '@typesTs/purchaseOrders'

type Props = {
  // reorderingPointsOrder: {
  //   totalQty: number
  //   totalCost: number
  //   totalVolume: number
  //   products: { [key: string]: ReorderingPointsProduct }
  // }
  // username: string
  // orderComment: string
  purchaseOrder: PurchaseOrder
}

const DownloadExcelPurchaseOrder = ({ purchaseOrder }: Props) => {
  const { state }: any = useContext(AppContext)
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`PO - ${purchaseOrder.orderNumber}`)

    worksheet.pageSetup.fitToPage = true
    worksheet.pageSetup.fitToWidth = 1
    worksheet.pageSetup.fitToHeight = 1

    const rowValues1 = []
    rowValues1[1] = 'PURCHASE ORDER'
    rowValues1[4] = purchaseOrder.orderNumber
    worksheet.addRow(rowValues1)
    worksheet.mergeCells('A1', 'B1')
    worksheet.mergeCells('D1', 'E1')

    worksheet.getCell('A1').font = {
      color: { argb: '000' },
      family: 2,
      size: 18,
      bold: true,
    }

    worksheet.getCell('D1').font = {
      color: { argb: '458BC9' },
      family: 2,
      size: 20,
      bold: true,
    }

    worksheet.addRow([state.user.name, '', '', `PO Date: ${purchaseOrder.date}`])
    worksheet.addRow([state.user.us.address])
    worksheet.addRow([`${state.user.us.city}, ${state.user.us.state} ${state.user.us.zipcode} ${state.user.us.country}`])
    worksheet.addRow([state.user.us.email])
    worksheet.addRow([state.user.us.website])
    worksheet.addRow([`Supplier: ${purchaseOrder.suppliersName}`])

    Array(2)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow(['Bill Info:', 'Ship To:'])

    worksheet.getRow(10).font = {
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

    Array(3)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow(['SKU', 'Product Name', 'UPC', 'Qty Per Box', 'Order Qty'])

    for (const product of purchaseOrder.poItems) {
      const rowValues = []
      rowValues[1] = product.sku
      rowValues[2] = product.title
      rowValues[3] = product.barcode
      rowValues[4] = product.boxQty
      rowValues[5] = product.orderQty

      worksheet.addRow(rowValues)
    }

    const totalValues = []
    totalValues[1] = ''
    totalValues[2] = ''
    totalValues[3] = ''
    totalValues[4] = 'TOTAL'
    totalValues[5] = purchaseOrder.poItems.reduce((acc, item) => acc + item.orderQty, 0)
    worksheet.addRow(totalValues)

    Array(3)
      .fill(0)
      .forEach(() => worksheet.addRow({}))
    worksheet.addRow({
      sku: 'PO Number',
      title: purchaseOrder.orderNumber,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].name,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].address,
    })
    worksheet.addRow({
      sku: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].email,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].website,
    })
    worksheet.addRow({
      sku: 'Supplier',
      title: purchaseOrder.suppliersName,
    })

    Array(2)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow({
      sku: 'Bill Info:',
      title: 'Ship To:',
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].name,
      title: state.user[state.currentRegion].name,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].address,
      title: state.user[state.currentRegion].address,
    })
    worksheet.addRow({
      sku: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
      title: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].email,
      title: state.user[state.currentRegion].email,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].website,
      title: state.user[state.currentRegion].website,
    })

    // {
    //   orderComment !== '' &&
    //     Array(2)
    //       .fill(0)
    //       .forEach(() => worksheet.addRow({}))
    // }
    // {
    //   orderComment !== '' && worksheet.addRow({ sku: 'Order Comment:', title: orderComment })
    // }

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
