import { columnsProductsFile } from '@components/products/TemplateInfo'
import { Product } from '@typings'
import ExcelJS from 'exceljs'

type ExportProductsFileMessage = {
  products: Product[]
}

self.onmessage = async (event: MessageEvent<ExportProductsFileMessage>) => {
  const { products } = event.data

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Product Details')

    worksheet.columns = columnsProductsFile

    for (const product of products) {
      worksheet.addRow({
        title: product.title,
        sku: product.sku,
        qty: product.quantity,
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    self.postMessage({ buffer, error: null })
  } catch (error: any) {
    self.postMessage({ buffer: null, error: error.message })
  }
}
