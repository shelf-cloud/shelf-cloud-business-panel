import React from 'react'
import ExcelJS from 'exceljs'
import { DropdownItem } from 'reactstrap'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  orderDetails: {
    orderNumber: string
    destinationSC: string
  }
  selectedSupplier: string
  username: string
}

const DownloadExcelReorderingPointsOrder = ({ reorderingPointsOrder, orderDetails, selectedSupplier, username }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`PO - ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`)

    const columnsProductPerformance = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'volume', header: 'Volume' },
      { key: 'orderQty', header: 'Order Qty' },
      { key: 'cost', header: 'Cost' },
    ]

    worksheet.columns = columnsProductPerformance

    for (const product of Object.values(reorderingPointsOrder.products)) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        volume: product.useOrderAdjusted ? product.orderAdjusted * product.itemVolume : product.order * product.itemVolume,
        orderQty: product.useOrderAdjusted ? product.orderAdjusted : product.order,
        cost: product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost,
      })
    }

    worksheet.addRow({
      sku: '',
      title: 'TOTAL',
      volume: reorderingPointsOrder.totalVolume,
      orderQty: reorderingPointsOrder.totalQty,
      cost: reorderingPointsOrder.totalCost,
    })
    Array(3)
      .fill(0)
      .forEach(() => worksheet.addRow({}))
    worksheet.addRow({
      sku: 'PO Number',
      title: `${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`,
    })
    worksheet.addRow({
      sku: 'Supplier',
      title: selectedSupplier,
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PO - ${selectedSupplier} - ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <DropdownItem className='text-nowrap text-primary fs-6 py-0' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </DropdownItem>
  )
}

export default DownloadExcelReorderingPointsOrder
