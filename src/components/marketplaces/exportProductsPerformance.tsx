import React from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import { ProductPerformance } from '@typesTs/marketplaces/productPerformance'
import { AMAZON_MARKETPLACES, AMAZON_MARKETPLACES_ID } from '@lib/AmzConstants'

type Props = {
  products: ProductPerformance[]
  startDate: string
  endDate: string
  marketpalces: {
    storeId: string
    name: string
    logo: string
  }[]
}

const ExportProductsPerformance = ({ products, startDate, endDate, marketpalces }: Props) => {
  const buildTemplate = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Product Performance')

    const columnsProductPerformance = [
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'asin', header: 'Asin' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'brand', header: 'Brand' },
      { key: 'category', header: 'Category' },
      { key: 'grossRevenue', header: 'Grossrevenue' },
      { key: 'expenses', header: 'Expenses' },
      { key: 'profit', header: 'Profit' },
      { key: 'margin', header: 'Margin' },
      { key: 'roi', header: 'Roi' },
      { key: 'refundQty', header: 'Refundqty' },
      { key: 'unitsSold', header: 'Unitssold' },
      { key: 'basePrice', header: 'Baseprice' },
      { key: 'totalTax', header: 'Totaltax' },
      { key: 'taxCollected', header: 'Taxcollected' },
      { key: 'taxWithheld', header: 'Taxwithheld' },
      { key: 'shipping', header: 'Shipping' },
      { key: 'refunds', header: 'Refunds' },
      { key: 'promos', header: 'Promos' },
      { key: 'shelfCloudCost', header: 'ShelfCloud Cost' },
      { key: 'storageCost', header: 'ShelfCloud Storage Cost' },
      { key: 'shippingCost', header: 'Shippingcost' },
      { key: 'sponsoredProducts', header: 'PPC Sponsored Products' },
      { key: 'displayAds', header: 'PPC Display Ads' },
      { key: 'productCost', header: 'Product Cost Landed' },
      { key: 'shippingToFbaCost', header: 'Shipping To Fba Cost' },
      { key: 'returnedCogs', header: 'Returned Cogs' },
      { key: 'reimbursements', header: 'Reimbursements' },
      { key: 'marketplacesFee', header: 'Marketplacesfee' },
    ]

    for (const market of marketpalces) {
      if (AMAZON_MARKETPLACES_ID.includes(market.storeId)) {
        columnsProductPerformance.push({ key: AMAZON_MARKETPLACES[market.storeId].name, header: AMAZON_MARKETPLACES[market.storeId].name.toUpperCase() })
      } else {
        columnsProductPerformance.push({ key: market.name, header: market.name.toUpperCase() })
      }
    }
    worksheet.columns = columnsProductPerformance

    const marketplaces = {} as any
    for (const product of products) {
      for (const market of Object.values(product.marketplaces)) {
        if (!marketplaces[product.sku]) marketplaces[product.sku] = {}
        if (!marketplaces[product.sku][market.name]) marketplaces[product.sku][market.name] = 0
        marketplaces[product.sku][market.name] = market.fees.totalComission + market.fees.totalFixedFee
      }
    }

    for (const product of products) {
      worksheet.addRow({
        sku: product.sku,
        title: product.title,
        asin: product.asin,
        supplier: product.supplier,
        brand: product.brand,
        category: product.category,
        grossRevenue: product.grossRevenue,
        expenses: product.expenses,
        profit: product.grossRevenue - product.expenses,
        margin: product.grossRevenue === 0 ? 0 : ((product.grossRevenue - product.expenses) / product.grossRevenue) * 100,
        roi: product.grossRevenue === 0 ? 0 : ((product.grossRevenue - product.expenses) / product.expenses) * 100,
        refundQty: product.refundsQty,
        unitsSold: product.unitsSold,
        basePrice: product.basePrice,
        totalTax: product.totalTax,
        taxCollected: product.taxCollected,
        taxWithheld: product.taxWithheld,
        shipping: product.totalShipping,
        refunds: product.refunds,
        promos: product.promos,
        shelfCloudCost: product.shelfCloudCost,
        storageCost: product.storageCost,
        shippingCost: product.shippingCost,
        sponsoredProducts: product.sponsoredProducts,
        displayAds: product.displayAds,
        productCost: product.productCost,
        shippingToFbaCost: product.shippingToFbaCost,
        returnedCogs: product.productCostOfRefunds,
        reimbursements: product.reimbursements,
        marketplacesFee: product.totalMarketplacesFees,
        ...marketplaces[product.sku],
      })
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Product Performance ${startDate} - ${endDate}`
      a.click()
    })
  }
  const exportExcelFile = async () => {
    await buildTemplate()
  }

  return (
    <Button className='btn btn-primary btn-sm text-nowrap fs-6' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Export Products
    </Button>
  )
}

export default ExportProductsPerformance
