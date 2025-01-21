import { Marketplace, ProductDatesArray } from '@typesTs/marketplaces/productPerformance'

export const marketplacesSummary = (dataMarketplaces: { [key: string]: Marketplace }, skuMarketplaces: { [key: string]: Marketplace }) => {
  for (const [key, skuMarketplace] of Object.entries(skuMarketplaces)) {
    if (dataMarketplaces[key] !== undefined) {
      dataMarketplaces[key].totalUnitsSold += skuMarketplace.totalUnitsSold
      dataMarketplaces[key].fees.totalComission += skuMarketplace.fees.totalComission
      dataMarketplaces[key].fees.totalFixedFee += skuMarketplace.fees.totalFixedFee

      if (skuMarketplace.fees.totalShipping !== undefined) dataMarketplaces[key].fees.totalShipping += skuMarketplace.fees.totalShipping
      if (skuMarketplace.fees.FBAPerOrderFulfillmentFee !== undefined) dataMarketplaces[key].fees.FBAPerOrderFulfillmentFee! += skuMarketplace.fees.FBAPerOrderFulfillmentFee
      if (skuMarketplace.fees.FBAPerUnitFulfillmentFee !== undefined) dataMarketplaces[key].fees.FBAPerUnitFulfillmentFee! += skuMarketplace.fees.FBAPerUnitFulfillmentFee
      if (skuMarketplace.fees.FBAWeightBasedFee !== undefined) dataMarketplaces[key].fees.FBAWeightBasedFee! += skuMarketplace.fees.FBAWeightBasedFee
      if (skuMarketplace.fees.Commission !== undefined) dataMarketplaces[key].fees.Commission! += skuMarketplace.fees.Commission
      if (skuMarketplace.fees.FixedClosingFee !== undefined) dataMarketplaces[key].fees.FixedClosingFee! += skuMarketplace.fees.FixedClosingFee
      if (skuMarketplace.fees.GiftwrapChargeback !== undefined) dataMarketplaces[key].fees.GiftwrapChargeback! += skuMarketplace.fees.GiftwrapChargeback
      if (skuMarketplace.fees.ShippingChargeback !== undefined) dataMarketplaces[key].fees.ShippingChargeback! += skuMarketplace.fees.ShippingChargeback
      if (skuMarketplace.fees.SalesTaxCollectionFee !== undefined) dataMarketplaces[key].fees.SalesTaxCollectionFee! += skuMarketplace.fees.SalesTaxCollectionFee
      if (skuMarketplace.fees.VariableClosingFee !== undefined) dataMarketplaces[key].fees.VariableClosingFee! += skuMarketplace.fees.VariableClosingFee
    } else {
      dataMarketplaces[key] = { ...skuMarketplace }

      if (skuMarketplace.fees.totalShipping !== undefined) dataMarketplaces[key].fees.totalShipping = skuMarketplace.fees.totalShipping
      if (skuMarketplace.fees.FBAPerOrderFulfillmentFee !== undefined) dataMarketplaces[key].fees.FBAPerOrderFulfillmentFee = skuMarketplace.fees.FBAPerOrderFulfillmentFee
      if (skuMarketplace.fees.FBAPerUnitFulfillmentFee !== undefined) dataMarketplaces[key].fees.FBAPerUnitFulfillmentFee = skuMarketplace.fees.FBAPerUnitFulfillmentFee
      if (skuMarketplace.fees.FBAWeightBasedFee !== undefined) dataMarketplaces[key].fees.FBAWeightBasedFee = skuMarketplace.fees.FBAWeightBasedFee
      if (skuMarketplace.fees.Commission !== undefined) dataMarketplaces[key].fees.Commission = skuMarketplace.fees.Commission
      if (skuMarketplace.fees.FixedClosingFee !== undefined) dataMarketplaces[key].fees.FixedClosingFee = skuMarketplace.fees.FixedClosingFee
      if (skuMarketplace.fees.GiftwrapChargeback !== undefined) dataMarketplaces[key].fees.GiftwrapChargeback = skuMarketplace.fees.GiftwrapChargeback
      if (skuMarketplace.fees.ShippingChargeback !== undefined) dataMarketplaces[key].fees.ShippingChargeback = skuMarketplace.fees.ShippingChargeback
      if (skuMarketplace.fees.SalesTaxCollectionFee !== undefined) dataMarketplaces[key].fees.SalesTaxCollectionFee = skuMarketplace.fees.SalesTaxCollectionFee
      if (skuMarketplace.fees.VariableClosingFee !== undefined) dataMarketplaces[key].fees.VariableClosingFee = skuMarketplace.fees.VariableClosingFee
    }
  }
  return dataMarketplaces
}

export const datesArraySummary = (dataDatesArray: { [key: string]: ProductDatesArray }, skuDatesArray: { [key: string]: ProductDatesArray }) => {
  for (const [key, skuDate] of Object.entries(skuDatesArray)) {
    if (dataDatesArray[key] !== undefined) {
      dataDatesArray[key].grossRevenue += skuDate.grossRevenue
      dataDatesArray[key].expenses += skuDate.expenses
      dataDatesArray[key].unitsSold += skuDate.unitsSold
    } else {
      dataDatesArray[key] = { ...skuDate }
    }
  }
  return dataDatesArray
}
