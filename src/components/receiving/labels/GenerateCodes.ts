import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

export const generateQRCode = async (sku: string, qty: number) => {
  try {
    const qrData = `${sku} - QTY: ${qty}`
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
    })
    return dataUrl
  } catch (error) {
    console.error(`Error generating QR code for label :`, error)
    return ''
  }
}

const barcodeFormats = {
  CODE128: 'CODE128', // Most common, supports alphanumeric
  CODE39: 'CODE39', // Older format, alphanumeric
  EAN13: 'EAN13', // For product codes (13 digits)
  EAN8: 'EAN8', // For product codes (8 digits)
  UPC: 'UPC', // Universal Product Code
  ITF14: 'ITF14', // For shipping containers
}

export const generateBarcode = (text: string) => {
  const canvas = document.createElement('canvas')

  // Generate barcode
  JsBarcode(canvas, text, {
    format: barcodeFormats.CODE128, // You can change this to other formats like CODE39, EAN13, etc.
    width: 2,
    height: 60,
    displayValue: false, // Don't show text below barcode since we'll show PO number separately
    margin: 0,
    background: '#ffffff',
    lineColor: '#000000',
  })

  // Convert canvas to data URL
  const dataUrl = canvas.toDataURL('image/png')
  return dataUrl
}

// export const generateVerticalText = (text: string): string => {
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')!

//   canvas.width = 200
//   canvas.height = 20

//   ctx.fillStyle = '#ffffff'
//   ctx.font = 'bold 7px Helvetica'
//   ctx.textAlign = 'center'
//   ctx.textBaseline = 'middle'

//   ctx.save()
//   ctx.translate(canvas.width / 2, canvas.height / 2)
//   ctx.rotate(-Math.PI / 2)
//   ctx.fillText(text, 0, 0)
//   ctx.restore()

//   const dataUrl = canvas.toDataURL('image/png')
//   return dataUrl
// }
