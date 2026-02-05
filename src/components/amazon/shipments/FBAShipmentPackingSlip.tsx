import React from 'react'

import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import ExcelJS from 'exceljs'
import { toast } from 'react-toastify'
import { DropdownItem } from 'reactstrap'

type Props = {
  order: FBAShipment
}

const FBAShipmentPackingSlip = ({ order }: Props) => {
  const buildTemplate = async (logo: ArrayBuffer, signature: ArrayBuffer) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`Packing Slip`)

    worksheet.pageSetup.printArea = 'A:E'
    worksheet.pageSetup.fitToPage = true
    worksheet.pageSetup.fitToWidth = 1
    worksheet.pageSetup.fitToHeight = 10

    worksheet.getColumn(1).width = 20
    worksheet.getColumn(2).width = 30
    worksheet.getColumn(3).width = 26
    worksheet.getColumn(4).width = 12
    worksheet.getColumn(5).width = 16

    const imageId1 = workbook.addImage({
      buffer: logo,
      extension: 'png',
    })

    worksheet.addImage(imageId1, 'A2:B4')

    const packingTitle = worksheet.getCell('C1')
    packingTitle.value = 'PACKING SLIP'
    worksheet.mergeCells('C1', 'E1')
    packingTitle.font = { bold: true, size: 20, color: { argb: '000080' } }
    packingTitle.alignment = { vertical: 'middle', horizontal: 'center' }

    const direcction = worksheet.getCell('C3')
    direcction.value = '9629 Premier Parkway'

    const state = worksheet.getCell('C4')
    state.value = 'Miramar, FL 33025'

    const email = worksheet.getCell('C5')
    email.value = 'info@shelf-cloud.com'

    const web = worksheet.getCell('C6')
    web.value = 'www.shelf-cloud.com'

    const shipTo = worksheet.getCell('A7')
    shipTo.value = 'SHIP TO'
    shipTo.font = { bold: true, color: { argb: 'FFFFFF' } }
    shipTo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    shipTo.alignment = { vertical: 'middle', horizontal: 'center' }
    shipTo.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('A7', 'B7')

    const shipTo1 = worksheet.getCell('A8')
    shipTo1.value = order.shipment.destination.destinationType
    shipTo1.alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.mergeCells('A8', 'B8')

    const shipTo2 = worksheet.getCell('A9')
    shipTo2.value = `${order.shipment.destination.address.name}, ${order.shipment.destination.address.addressLine1}, ${order.shipment.destination.address.postalCode}`
    shipTo2.alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.mergeCells('A9', 'B9')

    const shipTo3 = worksheet.getCell('A10')
    shipTo3.value = `${order.shipment.destination.address.city}, ${order.shipment.destination.address.stateOrProvinceCode}, ${order.shipment.destination.address.countryCode}`
    shipTo3.alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.mergeCells('A10', 'B10')

    worksheet.mergeCells('A11', 'B11')

    worksheet.getCell('A8').border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.getCell('A9').border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.getCell('A10').border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.getCell('A11').border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const date = worksheet.getCell('D7')
    date.value = 'DATE'
    date.font = { bold: true, color: { argb: 'FFFFFF' } }
    date.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    date.alignment = { vertical: 'middle', horizontal: 'center' }
    date.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('D7', 'E7')

    const closedDate = new Date(order.createdAt)

    worksheet.getCell('D8').value = closedDate.toLocaleDateString('en-US')
    worksheet.getCell('D8').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.mergeCells('D8', 'E8')
    worksheet.getCell('D8').border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const shipment = worksheet.getCell('A13')
    shipment.value = 'SHIPMENT'
    shipment.font = { bold: true, color: { argb: 'FFFFFF' } }
    shipment.alignment = { vertical: 'middle', horizontal: 'center' }
    shipment.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    shipment.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('A13', 'B13')

    worksheet.getCell('A14').value = order.shipment.shipmentConfirmationId
    worksheet.getCell('A14').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A14').border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('A14', 'B14')

    const salesPerson = worksheet.getCell('D13')
    salesPerson.value = 'SALES PERSON'
    salesPerson.font = { bold: true, color: { argb: 'FFFFFF' } }
    salesPerson.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    salesPerson.alignment = { vertical: 'middle', horizontal: 'center' }
    salesPerson.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('D13', 'E13')

    worksheet.getCell('D14').value = 'Jose Sanchez'
    worksheet.getCell('D14').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('D14').border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }
    worksheet.mergeCells('D14', 'E14')

    worksheet.addRow({})

    worksheet.addRow(['SKU', 'Description', '', '', 'Quantity'])
    const titleSku = worksheet.getCell('A16')
    titleSku.font = { bold: true, color: { argb: 'FFFFFF' } }
    titleSku.alignment = { vertical: 'middle', horizontal: 'center' }
    titleSku.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    titleSku.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const titleDescription = worksheet.getCell('B16')
    titleDescription.font = { bold: true, color: { argb: 'FFFFFF' } }
    titleDescription.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    titleDescription.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    worksheet.mergeCells('B16', 'D16')
    titleDescription.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const titleQuantity = worksheet.getCell('E16')
    titleQuantity.font = { bold: true, color: { argb: 'FFFFFF' } }
    titleQuantity.alignment = { vertical: 'middle', horizontal: 'center' }
    titleQuantity.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    titleQuantity.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    // ITEMS LIST

    for (const item of order.shipmentItems.items) {
      const rowValues = [`${order.skus_details[item.msku].shelfcloud_sku}`, order.skus_details[item.msku].title, '', '', item.quantity]

      const rowItem = worksheet.addRow(rowValues)
      rowItem.getCell(1).font = { color: { argb: '000080' } }
      rowItem.getCell(1).alignment = { horizontal: 'center' }
      rowItem.getCell(1).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }

      rowItem.getCell(2).font = { color: { argb: '000080' } }
      rowItem.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
      const descriptionStart = rowItem.getCell(2).address
      const descriptionEnd = descriptionStart.substring(1)
      worksheet.mergeCells(descriptionStart, `D${descriptionEnd}`)
      rowItem.getCell(2).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }

      rowItem.getCell(5).font = { color: { argb: '000080' } }
      rowItem.getCell(5).alignment = { horizontal: 'center' }
      rowItem.getCell(5).border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
      }
    }

    const totalRow = worksheet.addRow(['', '', '', 'Total', order.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)])
    const totalRowNumber = parseInt(totalRow.getCell(1).address.substring(1))
    worksheet.mergeCells(`A${totalRowNumber}`, `C${totalRowNumber}`)
    worksheet.getCell(`A${totalRowNumber}`).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const titleTotal = totalRow.getCell(4)
    titleTotal.font = { bold: true, color: { argb: '000080' } }
    titleTotal.alignment = { horizontal: 'center' }
    titleTotal.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    const titleTotalQuantity = totalRow.getCell(5)
    titleTotalQuantity.font = { bold: true, color: { argb: '000080' } }
    titleTotalQuantity.alignment = { horizontal: 'center' }
    titleTotalQuantity.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    worksheet.addRow({})

    const notesRow = worksheet.addRow(['SPECIAL NOTES', '', '', 'Authorized Signatory:', ''])
    const notesRowNumber = parseInt(notesRow.getCell(1).address.substring(1))

    notesRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFF' } }
    notesRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '538DD5' } }
    worksheet.mergeCells(`A${notesRowNumber}`, `C${notesRowNumber}`)
    notesRow.getCell(1).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    notesRow.getCell(4).alignment = { horizontal: 'center' }
    notesRow.getCell(4).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    }

    worksheet.mergeCells(`D${notesRowNumber}`, `E${notesRowNumber}`)

    const authorize = worksheet.addRow(['', '', '', 'Jose Sanchez', ''])
    const authorizeNumber = parseInt(authorize.getCell(4).address.substring(1))
    authorize.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.mergeCells(`D${authorizeNumber}`, `E${authorizeNumber + 1}`)
    authorize.getCell(4).border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    worksheet.getCell(`A${authorizeNumber}`).value = `Tracking Number: ${
      order.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber
        ? order.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber
        : order.shipment.trackingDetails?.spdTrackingDetail.spdTrackingItems[0].trackingId
    }`
    worksheet.mergeCells(`A${authorizeNumber}`, `C${authorizeNumber + 4}`)
    worksheet.getCell(`A${authorizeNumber}`).alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell(`A${authorizeNumber}`).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    worksheet.getCell(`D${authorizeNumber + 2}`).value = 'Signature:'
    worksheet.getCell(`D${authorizeNumber + 2}`).alignment = { horizontal: 'center' }
    worksheet.mergeCells(`D${authorizeNumber + 2}`, `E${authorizeNumber + 2}`)
    worksheet.getCell(`D${authorizeNumber + 2}`).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    }

    worksheet.mergeCells(`D${authorizeNumber + 3}`, `E${authorizeNumber + 4}`)

    const signatureId = workbook.addImage({
      buffer: signature!,
      extension: 'png',
    })

    worksheet.addImage(signatureId, `E${authorizeNumber + 3}:E${authorizeNumber + 4}`)

    worksheet.getCell(`D${authorizeNumber + 3}`).border = {
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `FBA Packing Slip - ${order.shipment.shipmentConfirmationId}.xlsx`
      a.click()
    })
  }

  const downloadPackingSlip = async () => {
    const generatePackingSlip = toast.loading('Generating Packing Slip...')

    const logo = await fetch(
      'https://firebasestorage.googleapis.com/v0/b/shelf-cloud-bucket.appspot.com/o/brand%2Fshelfcloud-blue-h.png?alt=media&token=6536dd7b-383b-4e4f-9160-893d91c0ca09'
    )
      .then((response) => {
        return response.blob()
      })
      .then((imgBlob) => {
        return imgBlob.arrayBuffer()
      })
      .catch((error) => {
        console.error('Error fetching the image:', error)
        return null
      })

    const signature = await fetch(
      'https://firebasestorage.googleapis.com/v0/b/shelf-cloud-bucket.appspot.com/o/operations%2Fonix_signature.png?alt=media&token=17f47b7f-0bf4-4087-a1a4-850b57985bb1'
    )
      .then((response) => {
        return response.blob()
      })
      .then((imgBlob) => {
        return imgBlob.arrayBuffer()
      })
      .catch((error) => {
        console.error('Error fetching the image:', error)
      })

    await buildTemplate(logo!, signature!)
      .then(() => {
        toast.update(generatePackingSlip, {
          render: 'Packing Slip Generated',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
      .catch(() => {
        toast.update(generatePackingSlip, {
          render: 'Error Generating Packing Slip',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      })
  }

  return (
    <DropdownItem className='edit-item-btn' onClick={downloadPackingSlip}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      <span className='fs-6 fw-normal text-dark'>Packing Slip</span>
    </DropdownItem>
  )
}

export default FBAShipmentPackingSlip
