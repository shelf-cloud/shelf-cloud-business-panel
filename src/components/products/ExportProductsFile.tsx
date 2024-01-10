import React from 'react'
import ExcelJS from 'exceljs'
import { Product } from '@typings'
import { Button, Spinner } from 'reactstrap'
import { columns } from './TemplateInfo'

type Props = {
  products: Product[]
  loadingCsv: boolean
  setloadingCsv: (loadingCsv: boolean) => void
}

const ExportProductsFile = ({ products, loadingCsv, setloadingCsv }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Product Details')

    worksheet.columns = columns

    for (const product of products) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        description: product.description,
        asin: product.asin,
        fnsku: product.fnSku,
        barcode: product.barcode,
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

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Product Details.xlsx'
      a.click()
    })
  }
  const exportExcelFile = async () => {
    setloadingCsv(true)

    await buildTemplate()

    setloadingCsv(false)
  }

  return (
    <Button type='button' color='primary' className='fs-6 py-1' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      {loadingCsv ? <Spinner color='light' size={'sm'} /> : 'Export Products'}
    </Button>
  )
}

export default ExportProductsFile
