import { MarketplaceListingsProduct } from '@hooks/products/useMarketplaceListings'
import ExcelJS from 'exceljs'

self.onmessage = async (e) => {
  const { products }: { products: MarketplaceListingsProduct[] } = e.data

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Marketplace Pricing')

    const columns = [
      { key: 'sku', header: 'Sku' },
      { key: 'isKit', header: 'Is Kit' },
      { key: 'title', header: 'Title' },
      { key: 'description', header: 'Description' },
      { key: 'asin', header: 'Asin' },
      { key: 'fnsku', header: 'Fnsku' },
      { key: 'barcode', header: 'Barcode' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'brand', header: 'Brand' },
      { key: 'category', header: 'Category' },
      { key: 'weight', header: 'Weight' },
      { key: 'length', header: 'Length' },
      { key: 'width', header: 'Width' },
      { key: 'height', header: 'Height' },
      { key: 'boxQty', header: 'Boxqty' },
      { key: 'boxWeight', header: 'Boxweight' },
      { key: 'boxLength', header: 'Boxlength' },
      { key: 'boxWidth', header: 'Boxwidth' },
      { key: 'boxHeight', header: 'Boxheight' },
      { key: 'htsCode', header: 'HTS Code' },
      { key: 'defaultPrice', header: 'Defaultprice' },
      { key: 'msrp', header: 'Msrp' },
      { key: 'map', header: 'Map' },
      { key: 'floor', header: 'Floor' },
      { key: 'ceilling', header: 'Ceilling' },
      { key: 'sellerCost', header: 'Sellercost' },
      { key: 'inboundShippingCost', header: 'Inboundshippingcost' },
      { key: 'otherCosts', header: 'Othercosts' },
      { key: 'productionTime', header: 'Productiontime (Days)' },
      { key: 'transitTime', header: 'Transittime (Days)' },
      { key: 'shippingToFBACost', header: 'Shippingtofbacost' },
      { key: 'buffer', header: 'Buffer' },
      { key: 'itemCondition', header: 'Itemcondition' },
      { key: 'image', header: 'Image' },
      { key: 'note', header: 'Note' },
      { key: 'identifiers', header: 'Identifiers' },
      { key: 'listings', header: 'Listings' },
    ]

    worksheet.columns = columns

    const toBulletList = (items: string[]) => {
      const cleaned = items.map((s) => (s ?? '').toString().trim()).filter(Boolean)
      return cleaned.length ? cleaned.map((s) => `• ${s}`).join('\n') : ''
    }

    // Make list cells show new lines in Excel
    const noteColumn = worksheet.getColumn('note')
    noteColumn.width = 20
    noteColumn.alignment = { wrapText: true, vertical: 'top' }
    const identifiersColumn = worksheet.getColumn('identifiers')
    identifiersColumn.width = 35
    identifiersColumn.alignment = { wrapText: true, vertical: 'top' }
    const listingsColumn = worksheet.getColumn('listings')
    listingsColumn.width = 90
    listingsColumn.alignment = { wrapText: true, vertical: 'top' }

    for await (const product of products) {
      worksheet.addRow({
        sku: product.sku,
        isKit: product.isKit,
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
        htsCode: product.htsCode,
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
        note: product.note,
        identifiers: toBulletList((product.identifiers ?? []).map((id) => `${id.type}: ${id.value}`)),

        listings: toBulletList(
          (product.listings ?? []).map((l) => {
            const price = typeof l.price === 'number' ? ` ($${l.price})` : ''
            return `${l.channelName ?? 'Store'} / ${l.store} — ${l.storeSku}${price}`
          })
        ),
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    self.postMessage({ buffer, error: null })
  } catch (error: any) {
    self.postMessage({ buffer: null, error: error.message })
  }
}
