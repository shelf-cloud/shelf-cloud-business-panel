import React from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import { UnsellablesType } from '@typesTs/returns/unsellables'

type Props = {
  unsellables: UnsellablesType[]
}

const ExportUnsellables = ({ unsellables }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Unsellables')

    worksheet.columns = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'barcode', header: 'Barcode' },
      { key: 'orderNumber', header: 'Order Number' },
      { key: 'returnRMA', header: 'Return RMA' },
      { key: 'returnReason', header: 'Return Reason' },
      { key: 'status', header: 'Status' },
      { key: 'date', header: 'Date' },
    ]

    for (const item of unsellables) {
      worksheet.addRow({
        sku: item.sku,
        title: item.title,
        barcode: item.barcode,
        orderNumber: item.orderNumber,
        returnRMA: item.returnRMA,
        returnReason: item.returnReason,
        status: item.dispose ? 'Dispose' : item.converted ? 'Converted Sellable' : 'Unsellable',
        date: item.date,
      })
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Unsellables List.xlsx'
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

export default ExportUnsellables
