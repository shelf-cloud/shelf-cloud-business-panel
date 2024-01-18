import React from 'react'
import ExcelJS from 'exceljs'
import { Product } from '@typings'
import { DropdownItem } from 'reactstrap'
import { CONDITIONS, columns, columnsInfo, columnsInfoData, columnsReferenceData } from './TemplateInfo'

type Props = {
  products: Product[]
  brands: string[]
  suppliers: string[]
  categories: string[]
  selected: boolean
}

const ExportProductsTemplate = ({ products, brands, suppliers, categories, selected }: Props) => {
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

    for (const columnData of columnsInfoData) {
      worksheetColumns.addRow(columnData)
    }

    for (const product of products) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        description: product.description,
        asin: product.asin,
        fnsku: product.fnSku,
        barcode: `'${product.barcode}`,
        supplier: product.supplier,
        brand: product.brand,
        category: product.category,
        weight: product.weight,
        length: product.length,
        width: product.width,
        height: product.height,
        boxQty: product.boxQty,
        boxWeight: product.boxWeight,
        boxLength: product.boxLength,
        boxWidth: product.boxWidth,
        boxHeight: product.boxHeight,
        activeState: product.activeState,
        note: product.note,
        defaultCost: product.defaultCost,
        defaultPrice: product.defaultPrice,
        msrp: product.msrp,
        map: product.map,
        floor: product.floor,
        ceilling: product.ceilling,
        sellerCost: product.sellerCost,
        inboundShippingCost: product.inboundShippingCost,
        otherCosts: product.otherCosts,
        productionTime: product.productionTime,
        transitTime: product.transitTime,
        shippingToFBACost: product.shippingToFBA,
        buffer: product.buffer,
        itemCondition: product.itemCondition,
        image: product.image,
      })
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
      insertRows: false,
      insertHyperlinks: true,
      deleteColumns: false,
      deleteRows: true,
      sort: true,
      autoFilter: true,
      pivotTables: true,
    })

    worksheet.getColumn('sku').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('title').eachCell((cell) => {
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

    worksheet.getColumn('description').eachCell((cell) => {
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

    worksheet.getColumn('asin').eachCell((cell) => {
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

    worksheet.getColumn('fnsku').eachCell((cell) => {
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

    worksheet.getColumn('barcode').eachCell((cell) => {
      cell.dataValidation = {
        type: 'textLength',
        operator: 'equal',
        showErrorMessage: true,
        allowBlank: false,
        formulae: [12],
        errorTitle: 'Invalid input',
        error: 'Barcode is required. Barcode must be 12 characters',
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('supplier').eachCell((cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$A$2:$A$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('brand').eachCell((cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$B$2:$B$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('category').eachCell((cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['=ReferenceData!$C$2:$C$999'],
        error: 'Please use the DropDown to select a valid value',
        errorTitle: 'Invalid input',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('weight').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Weight must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('length').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Length must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('width').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
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
      cell.protection = { locked: true }
    })

    worksheet.getColumn('height').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Height must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('boxQty').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'whole',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Quantity must be integer and greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('boxWeight').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Weight must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('boxLength').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Length must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('boxWidth').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Width must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('boxHeight').eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'lightGray',
      }
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThan',
        allowBlank: false,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Box Height must be greater than 0',
      }
      cell.protection = { locked: true }
    })

    worksheet.getColumn('activeState').eachCell((cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"True,False"'],
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('note').eachCell((cell) => {
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

    worksheet.getColumn('defaultCost').eachCell((cell) => {
      cell.dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        allowBlank: true,
        showErrorMessage: true,
        formulae: [0],
        errorTitle: 'Invalid input',
        error: 'Default Cost must be greater than 0',
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('defaultPrice').eachCell((cell) => {
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

    worksheet.getColumn('msrp').eachCell((cell) => {
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

    worksheet.getColumn('map').eachCell((cell) => {
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

    worksheet.getColumn('floor').eachCell((cell) => {
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

    worksheet.getColumn('ceilling').eachCell((cell) => {
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

    worksheet.getColumn('sellerCost').eachCell((cell) => {
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

    worksheet.getColumn('inboundShippingCost').eachCell((cell) => {
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

    worksheet.getColumn('otherCosts').eachCell((cell) => {
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

    worksheet.getColumn('productionTime(Days)').eachCell((cell) => {
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

    worksheet.getColumn('transitTime(Days)').eachCell((cell) => {
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

    worksheet.getColumn('shippingToFBACost').eachCell((cell) => {
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

    worksheet.getColumn('buffer').eachCell((cell) => {
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

    worksheet.getColumn('itemCondition').eachCell((cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['=ReferenceData!$D$2:$D$999'],
      }
      cell.protection = { locked: false }
    })

    worksheet.getColumn('image').eachCell((cell) => {
      cell.protection = { locked: false }
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Product Details Template.xlsx'
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
      {selected ? 'Export Selected Products Template' : 'Export All Products Template'}
    </DropdownItem>
  )
}

export default ExportProductsTemplate
