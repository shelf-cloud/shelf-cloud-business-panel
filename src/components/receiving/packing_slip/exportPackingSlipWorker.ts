import { OrderRowType } from '@typings'
import ExcelJS from 'exceljs'

self.onmessage = async (e) => {
  const { receiving }: { receiving: OrderRowType } = e.data
  const { boxes, orderItems } = receiving
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Packing Slip')

    const packingSlipColumns = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'upc', header: 'UPC' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'boxes', header: 'Boxes' },
    ]

    worksheet.columns = packingSlipColumns

    const finalList = {} as { [key: string]: { title: string; upc: string; quantity: number; boxes: number } }

    for await (const box of boxes!) {
      for await (const item of box.items) {
        const { sku, quantity, name } = item

        const upc = orderItems.find((b) => b.sku === sku)?.upc || ''

        if (finalList[sku]) {
          finalList[sku].quantity += quantity
          finalList[sku].boxes += 1
          continue
        }

        finalList[sku] = { title: name, upc, quantity, boxes: 1 }
      }
    }

    for await (const [sku, info] of Object.entries(finalList)) {
      worksheet.addRow({
        sku: sku,
        title: info.title,
        upc: info.upc,
        quantity: info.quantity,
        boxes: info.boxes,
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    self.postMessage({ buffer, error: null })
  } catch (error: any) {
    self.postMessage({ buffer: null, error: error.message })
  }
}
