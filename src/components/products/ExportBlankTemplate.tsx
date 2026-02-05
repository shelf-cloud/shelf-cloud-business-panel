import React from 'react'

import ExcelJS from 'exceljs'
import { DropdownItem } from 'reactstrap'

import { CONDITIONS, blankProducts, columns, columnsInfo, columnsInfoBlankData, columnsReferenceData } from './TemplateInfo'

type Props = {
  brands: string[]
  suppliers: string[]
  categories: string[]
}

const ExportBlankTemplate = ({ brands, suppliers, categories }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Product Details Template')
    const worksheetInfo = workbook.addWorksheet('ReferenceData')
    const worksheetColumns = workbook.addWorksheet('Columns')

    worksheet.columns = columns
    worksheetInfo.columns = columnsReferenceData
    worksheetColumns.columns = columnsInfo

    worksheetInfo.getColumn('suppliers').values = ['Suppliers', ...suppliers]
    worksheetInfo.getColumn('brands').values = ['Brands', ...brands]
    worksheetInfo.getColumn('categories').values = ['Categories', ...categories]
    worksheetInfo.getColumn('conditions').values = CONDITIONS

    for (const columnData of columnsInfoBlankData) {
      worksheetColumns.addRow(columnData)
    }

    for (const blank of blankProducts) {
      worksheet.addRow(blank)
    }
    worksheetColumns.protect('xmQC!zpH-3ZX', {
      selectLockedCells: false,
      formatCells: false,
      formatColumns: true,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    })
    worksheetInfo.protect('xmQC!zpH-3ZX', {
      selectLockedCells: false,
      formatCells: false,
      formatColumns: true,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    })
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

    worksheet.getColumn('title').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: false,
        formulae: [0, 150],
        errorTitle: 'Invalid input',
        error: 'Title must be between 0 and 150 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('description').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: true,
        formulae: [0, 250],
        errorTitle: 'Invalid input',
        error: 'Description must be between 0 and 250 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('asin').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: true,
        formulae: [0, 20],
        errorTitle: 'Invalid input',
        error: 'Asin must be less than 20 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('fnsku').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: true,
        formulae: [0, 20],
        errorTitle: 'Invalid input',
        error: 'Fnsku must be less than 20 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('barcode').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'equal',
        showErrorMessage: true,
        allowBlank: false,
        formulae: [12],
        errorTitle: 'Invalid input',
        error: 'Barcode is required. Barcode must be 12 characters',
      }
      cell.numFmt = "'000000000000"
      cell.protection = { locked: false }
    })

    worksheet.getColumn('supplier').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$A$2:$A$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('brand').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$B$2:$B$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('category').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$C$2:$C$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('weight').eachCell({ includeEmpty: true }, (cell) => {
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

    worksheet.getColumn('length').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Length must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('width').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorStyle: 'error',
        errorTitle: 'Invalid input',
        error: 'Width must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('height').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Height must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('boxQty').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Quantity must be integer and greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('boxWeight').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Weight must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('boxLength').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Length must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('boxWidth').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Width must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('boxHeight').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Height must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    // worksheet.getColumn('activeState').eachCell({ includeEmpty: true }, (cell) => {
    //   cell.dataValidation = {
    //     type: 'list',
    //     allowBlank: false,
    //     formulae: ['"True,False"'],
    //   }
    //   cell.protection = { locked: false }
    // })

    worksheet.getColumn('note').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: true,
        formulae: [0, 250],
        errorTitle: 'Invalid input',
        error: 'Note must be between 0 and 250 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('htsCode').eachCell((cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'between',
        showErrorMessage: true,
        allowBlank: true,
        formulae: [0, 40],
        errorTitle: 'Invalid input',
        error: 'Note must be between 0 and 40 characters',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('defaultPrice').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Default Price must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('msrp').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'MSRP must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('map').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'MAP must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('floor').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Floor must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('ceilling').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Ceilling must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('sellerCost').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Seller Cost must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('inboundShippingCost').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Inbound Shipping Cost must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('otherCosts').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Other Cost must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('productionTime').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Production Time must be integer and greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('transitTime').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Transit Time must be integer and greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('shippingToFBACost').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Shipping To FBA Cost must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('buffer').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Buffer must be integer and greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('itemCondition').eachCell({ includeEmpty: true }, (cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['=ReferenceData!$D$2:$D$999'],
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('image').eachCell({ includeEmpty: true }, (cell) => {
      cell.protection = { locked: false }
    })

    worksheet.getColumn('recommendedDaysOfStock').eachCell((cell) => {
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Days Of Stock must be integer and greater or equal than 0',
      }
      cell.protection = { locked: false }
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Empty Template.xlsx'
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
    <DropdownItem className='text-nowrap text-info' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-6 me-2' />
      Export Empty Template
    </DropdownItem>
  )
}

export default ExportBlankTemplate
