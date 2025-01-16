import React from 'react'
import ExcelJS from 'exceljs'

const COLUMNS = [
  { key: 'sku', header: 'Sku', width: 12 },
  { key: 'quantity', header: 'Quantity to Receive', width: 20 },
]

const blankProducts = Array(50).fill({
  sku: '',
  quantity: '',
})

const ExportBlankReceivingTemplate = () => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Create Receiving File Template')

    worksheet.columns = COLUMNS

    for (const blank of blankProducts) {
      worksheet.addRow(blank)
    }

    worksheet.protect('xmQC!zpH-3ZX', {
      selectLockedCells: true,
      formatCells: false,
      formatColumns: true,
      formatRows: false,
      insertColumns: false,
      insertRows: true,
      insertHyperlinks: true,
      deleteColumns: false,
      deleteRows: true,
      sort: true,
      autoFilter: true,
      pivotTables: true,
    })

    worksheet.getColumn('sku').eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: false,
        formulae: [5, 100],
        errorTitle: 'Invalid input',
        error: 'Sku must be between 5 and 100 characters. No white space allowed. No special characters allowed',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('quantity').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Weight must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Empty Receiving Template.xlsx'
      a.click()
    })
  }

  const exportExcelFile = async () => {
    await new Promise<void>((resolve) => {
      buildTemplate()
      resolve()
    })
  }

  return (
    <span className='text-nowrap text-info' style={{ cursor: 'pointer' }} onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-6 me-0' />
      Download Empty Template
    </span>
  )
}

export default ExportBlankReceivingTemplate
