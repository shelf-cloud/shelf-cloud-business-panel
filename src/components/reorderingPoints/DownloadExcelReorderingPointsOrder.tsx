import React, { useContext } from 'react'
import ExcelJS from 'exceljs'
import { DropdownItem } from 'reactstrap'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import AppContext from '@context/AppContext'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  orderDetails: {
    orderNumber: string
    destinationSC: string
  }
  selectedSupplier: string
  username: string
}

const DownloadExcelReorderingPointsOrder = ({ reorderingPointsOrder, orderDetails, selectedSupplier, username }: Props) => {
  const { state }: any = useContext(AppContext)
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(`PO - ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`)

    const columnsProductPerformance = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'upc', header: 'UPC' },
      { key: 'qtyPerBox', header: 'Qty Per Box' },
      { key: 'volume', header: state.currentRegion === 'us' ? 'Volume ft³' : 'Volume m³' },
      { key: 'orderQty', header: 'Order Qty' },
      { key: 'cost', header: 'Cost' },
    ]

    worksheet.columns = columnsProductPerformance

    for (const product of Object.values(reorderingPointsOrder.products)) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        upc: product.barcode,
        qtyPerBox: product.boxQty,
        volume: product.useOrderAdjusted
          ? state.currentRegion === 'us'
            ? (product.itemVolume / 1728) * product.orderAdjusted
            : (product.itemVolume / 1000000) * product.orderAdjusted
          : state.currentRegion === 'us'
          ? (product.itemVolume / 1728) * product.order
          : (product.itemVolume / 1000000) * product.order,
        orderQty: product.useOrderAdjusted ? product.orderAdjusted : product.order,
        cost: product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost,
      })
    }

    worksheet.addRow({
      sku: '',
      title: '',
      upc: '',
      qtyPerBox: 'TOTAL',
      volume: state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 1728 : reorderingPointsOrder.totalVolume / 1000000,
      orderQty: reorderingPointsOrder.totalQty,
      cost: reorderingPointsOrder.totalCost,
    })
    Array(3)
      .fill(0)
      .forEach(() => worksheet.addRow({}))
    worksheet.addRow({
      sku: 'PO Number',
      title: `${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`,
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
      title: selectedSupplier,
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

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PO - ${selectedSupplier} - ${username.substring(0, 3).toUpperCase()}-${orderDetails.orderNumber}`
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <DropdownItem className='text-nowrap text-primary fs-6 py-0' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </DropdownItem>
  )
}

export default DownloadExcelReorderingPointsOrder
