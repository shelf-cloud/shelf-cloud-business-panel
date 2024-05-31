import React, { useContext } from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import AppContext from '@context/AppContext'
import { PurchaseOrder } from '@typesTs/purchaseOrders'

type Props = {
  // reorderingPointsOrder: {
  //   totalQty: number
  //   totalCost: number
  //   totalVolume: number
  //   products: { [key: string]: ReorderingPointsProduct }
  // }
  // username: string
  // orderComment: string
  purchaseOrder: PurchaseOrder
}

const DownloadExcelPurchaseOrder = ({ purchaseOrder }: Props) => {
  const { state }: any = useContext(AppContext)
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`PO - ${purchaseOrder.orderNumber}`)

    const columnsProductPerformance = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'upc', header: 'UPC' },
      { key: 'comment', header: 'Comment' },
      { key: 'qtyPerBox', header: 'Qty Per Box' },
      { key: 'orderQty', header: 'Order Qty' },
      { key: 'volume', header: state.currentRegion === 'us' ? 'Volume ft³' : 'Volume m³' },
      { key: 'cost', header: 'Cost' },
    ]

    worksheet.columns = columnsProductPerformance

    for (const product of purchaseOrder.poItems) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        upc: product.barcode,
        comment: product.note,
        qtyPerBox: product.boxQty,
        orderQty: product.orderQty,
        volume: state.currentRegion === 'us' ? (product.itemVolume / 1728) * product.orderQty : (product.itemVolume / 1000000) * product.orderQty,
        cost: product.orderQty * product.sellerCost,
      })
    }

    worksheet.addRow({
      sku: '',
      title: '',
      upc: '',
      qtyPerBox: 'TOTAL',
      volume:
        state.currentRegion === 'us'
          ? purchaseOrder.poItems.reduce((acc, item) => acc + (item.itemVolume / 1728) * item.orderQty, 0)
          : purchaseOrder.poItems.reduce((acc, item) => acc + (item.itemVolume / 1000000) * item.orderQty, 0),
      orderQty: purchaseOrder.poItems.reduce((acc, item) => acc + item.orderQty, 0),
      cost: purchaseOrder.poItems.reduce((acc, item) => acc + item.orderQty * item.sellerCost, 0),
    })

    Array(3)
      .fill(0)
      .forEach(() => worksheet.addRow({}))
    worksheet.addRow({
      sku: 'PO Number',
      title: purchaseOrder.orderNumber,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].name,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].address,
    })
    worksheet.addRow({
      sku: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].email,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].website,
    })
    worksheet.addRow({
      sku: 'Supplier',
      title: purchaseOrder.suppliersName,
    })

    Array(2)
      .fill(0)
      .forEach(() => worksheet.addRow({}))

    worksheet.addRow({
      sku: 'Bill Info:',
      title: 'Ship To:',
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].name,
      title: state.user[state.currentRegion].name,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].address,
      title: state.user[state.currentRegion].address,
    })
    worksheet.addRow({
      sku: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
      title: `${state.user[state.currentRegion].city}, ${state.user[state.currentRegion].state} ${state.user[state.currentRegion].zipcode} ${
        state.user[state.currentRegion].country
      }`,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].email,
      title: state.user[state.currentRegion].email,
    })
    worksheet.addRow({
      sku: state.user[state.currentRegion].website,
      title: state.user[state.currentRegion].website,
    })

    // {
    //   orderComment !== '' &&
    //     Array(2)
    //       .fill(0)
    //       .forEach(() => worksheet.addRow({}))
    // }
    // {
    //   orderComment !== '' && worksheet.addRow({ sku: 'Order Comment:', title: orderComment })
    // }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PO - ${purchaseOrder.suppliersName} - ${purchaseOrder.orderNumber}.xlsx`
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <Button color='primary' className='btn-label' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </Button>
  )
}

export default DownloadExcelPurchaseOrder
