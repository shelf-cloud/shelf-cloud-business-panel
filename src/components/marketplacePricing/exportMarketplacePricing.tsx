import React from 'react'
import ExcelJS from 'exceljs'
import { Button } from 'reactstrap'
import { MKP_Product, MKP_Product_Table } from '@typesTs/marketplacePricing/marketplacePricing'
import { toast } from 'react-toastify'
import moment from 'moment'

type Props = {
  products: any[]
  activeTab: string
}

const ExportMarketplacePricing = ({ products, activeTab }: Props) => {
  const buildByProductsTemplate = async (products: MKP_Product[]) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Marketplace Pricing')

    const marketplacePricingColumns = [
      { key: 'marketplace', header: 'Marketplace' },
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'asin', header: 'Asin' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'brand', header: 'Brand' },
      { key: 'category', header: 'Category' },
      { key: 'landedCost', header: 'Landed Cost' },
      { key: 'units1Month', header: '1 Month Sales' },
      { key: 'units1year', header: '1 Year Sales' },
      { key: 'shippingToMarketpalce', header: 'Shipping Cost' },
      { key: 'storeOtherCosts', header: 'Other Costs' },
      { key: 'currency', header: 'Currency' },
      { key: 'actualPrice', header: 'Actual Price' },
      { key: 'totalFees', header: 'Total Fees' },
      { key: 'profit', header: 'Profit' },
      { key: 'margin', header: 'Margin' },
      { key: 'proposedPrice', header: 'Proposed Price' },
      { key: 'proposedFees', header: 'Proposed Fees' },
      { key: 'proposedProfit', header: 'Proposed Profit' },
      { key: 'proposedMargin', header: 'Proposed Margin' },
      { key: 'notes', header: 'Notes' },
    ]

    worksheet.columns = marketplacePricingColumns

    for (const product of products) {
      for (const marketplace of Object.values(product.marketplaces)) {
        const proposedMargin = parseFloat(
          (
            ((marketplace.proposedPrice -
              (marketplace.proposedPrice * (marketplace.comissionFee / 100) + marketplace.fixedFee + marketplace.fbaHandlingFee) -
              product.sellerCost -
              product.inboundShippingCost -
              marketplace.storeOtherCosts -
              marketplace.shippingToMarketpalce) /
              marketplace.proposedPrice) *
            100
          ).toFixed(2)
        )

        worksheet.addRow({
          marketplace: marketplace.name,
          sku: product.sku,
          title: product.title,
          asin: product.asin,
          supplier: product.supplier,
          brand: product.brand,
          category: product.category,
          landedCost: product.sellerCost + product.inboundShippingCost,
          units1Month: marketplace.unitsSold['1M'],
          units1year: marketplace.unitsSold['1Y'],
          shippingToMarketpalce: marketplace.shippingToMarketpalce,
          storeOtherCosts: marketplace.storeOtherCosts,
          currency: marketplace.currency,
          actualPrice: marketplace.actualPrice,
          totalFees: marketplace.totalFees,
          profit: marketplace.actualPrice - marketplace.totalFees - product.sellerCost - product.inboundShippingCost - marketplace.storeOtherCosts - marketplace.shippingToMarketpalce,
          margin: parseFloat(
            (marketplace.actualPrice <= 0
              ? 0
              : ((marketplace.actualPrice - marketplace.totalFees - product.sellerCost - product.inboundShippingCost - marketplace.storeOtherCosts - marketplace.shippingToMarketpalce) / marketplace.actualPrice) * 100
            ).toFixed(2)
          ),
          proposedPrice: marketplace.proposedPrice,
          proposedFees: parseFloat((marketplace.proposedPrice * (marketplace.comissionFee / 100) + marketplace.fixedFee + marketplace.fbaHandlingFee).toFixed(2)),
          proposedProfit: parseFloat(
            (
              marketplace.proposedPrice -
              (marketplace.proposedPrice * (marketplace.comissionFee / 100) + marketplace.fixedFee + marketplace.fbaHandlingFee) -
              product.sellerCost -
              product.inboundShippingCost -
              marketplace.storeOtherCosts -
              marketplace.shippingToMarketpalce
            ).toFixed(2)
          ),
          proposedMargin: isFinite(proposedMargin) ? proposedMargin : 0,
          notes: marketplace.notes,
        })
      }
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MarketPlace Pricing - By Products ${moment().format('LL')}.xlsx`
      a.click()
    })
  }

  const buildByMarketplaceTemplate = async (products: MKP_Product_Table[]) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Marketplace Pricing')

    const marketplacePricingColumns = [
      { key: 'marketplace', header: 'Marketplace' },
      { key: 'sku', header: 'Sku' },
      { key: 'title', header: 'Title' },
      { key: 'asin', header: 'Asin' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'brand', header: 'Brand' },
      { key: 'category', header: 'Category' },
      { key: 'landedCost', header: 'Landed Cost' },
      { key: 'units1Month', header: '1 Month Sales' },
      { key: 'units1year', header: '1 Year Sales' },
      { key: 'shippingToMarketpalce', header: 'Shipping Cost' },
      { key: 'storeOtherCosts', header: 'Other Costs' },
      { key: 'currency', header: 'Currency' },
      { key: 'actualPrice', header: 'Actual Price' },
      { key: 'totalFees', header: 'Total Fees' },
      { key: 'profit', header: 'Profit' },
      { key: 'margin', header: 'Margin' },
      { key: 'proposedPrice', header: 'Proposed Price' },
      { key: 'proposedFees', header: 'Proposed Fees' },
      { key: 'proposedProfit', header: 'Proposed Profit' },
      { key: 'proposedMargin', header: 'Proposed Margin' },
      { key: 'notes', header: 'Notes' },
    ]

    worksheet.columns = marketplacePricingColumns

    for (const product of products) {
      const proposedMargin = parseFloat(
        (
          ((product.proposedPrice - (product.proposedPrice * (product.comissionFee / 100) + product.fixedFee + product.fbaHandlingFee) - product.sellerCost - product.inboundShippingCost - product.storeOtherCosts - product.shippingToMarketpalce) /
            product.proposedPrice) *
          100
        ).toFixed(2)
      )

      worksheet.addRow({
        marketplace: product.name,
        sku: product.sku,
        title: product.title,
        asin: product.asin,
        supplier: product.supplier,
        brand: product.brand,
        category: product.category,
        landedCost: product.sellerCost + product.inboundShippingCost,
        units1Month: product.unitsSold['1M'],
        units1year: product.unitsSold['1Y'],
        shippingToMarketpalce: product.shippingToMarketpalce,
        storeOtherCosts: product.storeOtherCosts,
        currency: product.currency,
        actualPrice: product.actualPrice,
        totalFees: parseFloat(product.totalFees.toFixed(2)),
        profit: parseFloat((product.actualPrice - product.totalFees - product.sellerCost - product.inboundShippingCost - product.storeOtherCosts - product.shippingToMarketpalce).toFixed(2)),
        margin:
          product.actualPrice <= 0 ? 0 : parseFloat((((product.actualPrice - product.totalFees - product.sellerCost - product.inboundShippingCost - product.storeOtherCosts - product.shippingToMarketpalce) / product.actualPrice) * 100).toFixed(2)),
        proposedPrice: product.proposedPrice,
        proposedFees: parseFloat((product.proposedPrice * (product.comissionFee / 100) + product.fixedFee + product.fbaHandlingFee).toFixed(2)),
        proposedProfit: parseFloat(
          (
            product.proposedPrice -
            (product.proposedPrice * (product.comissionFee / 100) + product.fixedFee + product.fbaHandlingFee) -
            product.sellerCost -
            product.inboundShippingCost -
            product.storeOtherCosts -
            product.shippingToMarketpalce
          ).toFixed(2)
        ),
        proposedMargin: isFinite(proposedMargin) ? proposedMargin : 0,
        notes: product.notes,
      })
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MarketPlace Pricing - By Marketplace ${moment().format('LL hh:mm')}.xlsx`
      a.click()
    })
  }

  const exportExcelFile = async () => {
    const generatingDocument = toast.loading('Generating document...')
    if (activeTab === 'byProducts') {
      await buildByProductsTemplate(products as MKP_Product[]).finally(() => {
        toast.update(generatingDocument, {
          render: 'Document generated successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
    } else {
      await buildByMarketplaceTemplate(products as MKP_Product_Table[]).finally(() => {
        toast.update(generatingDocument, {
          render: 'Document generated successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
    }
  }

  return (
    <Button className='btn btn-primary btn-sm text-nowrap fs-6' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Export Products
    </Button>
  )
}

export default ExportMarketplacePricing
