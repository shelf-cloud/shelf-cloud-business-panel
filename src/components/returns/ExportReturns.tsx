import React from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import { ReturnType } from '@typesTs/returns/returns'

type Props = {
  returns: ReturnType[]
}

const ExportReturns = ({ returns }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Unsellables')

    worksheet.columns = [
      { key: 'orderNumber', header: 'Order Returned' },
      { key: 'return', header: 'Return' },
      { key: 'status', header: 'status' },
      { key: 'reason', header: 'Reason' },
      { key: 'marketplace', header: 'Marketplace' },
      { key: 'returnDate', header: 'Return Date' },
      { key: 'reviewStatus', header: 'Review Status' },
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'condition', header: 'Condition' },
      { key: 'qtyReceived', header: 'Qty Received' },
    ]

    for await (const item of returns) {
      for await (const returnOrder of Object.values(item.returns)) {
        for await (const orderItem of returnOrder.orderItems) {
          worksheet.addRow({
            orderNumber: item.shipmentOrderNumber,
            return: returnOrder.orderNumber,
            status: returnOrder.orderStatus,
            reason: returnOrder.returnReason,
            marketplace: returnOrder.storeName,
            returnDate: returnOrder.orderDate,
            reviewStatus: returnOrder.returnState,
            sku: orderItem.sku,
            title: orderItem.title ?? orderItem.name,
            condition: orderItem.state,
            qtyReceived: orderItem.qtyReceived ?? orderItem.quantity,
          })
        }
      }
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Returns List.xlsx'
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <Button color='primary' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle me-2' />
      Export List
    </Button>
  )
}

export default ExportReturns
