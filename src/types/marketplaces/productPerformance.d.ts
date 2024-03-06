export interface ProductsPerformanceResponse {
    [key: string]: ProductPerformance
}

export interface ProductPerformance {
    inventoryId: number;
    businessId: number;
    business: string;
    image: string;
    title: string;
    barcode: string;
    sku: string;
    asin: string;
    fnSku: string;
    grossRevenue: number;
    expenses: number;
    unitsSold: number;
    basePrice: number;
    totalTax: number;
    taxCollected: number;
    taxWithheld: number;
    totalShipping: number;
    totalMarketplacesFees: number;
    reimbursements: number;
    refunds: number;
    refundsQty: number;
    returns: number;
    promos: number;
    productCost: number;
    productCostOfRefunds: number;
    shippingCost: number;
    storageCost: number;
    sponsoredProducts: number;
    displayAds: number;
    keywordAds: number;
    brand: string;
    category: string;
    supplier: string;
    marketplaces: { [key: string]: Marketplace };
    sellerCost: number;
    inboundShippingCost: number;
    otherCosts: number;
    shippingToFBA: number;
    shippingToFbaCost: number;
    shippingToFbaCostOfRefunds: number;
    shelfCloudCost: number
    listings: Listing[];
    datesArray: { [key: string]: ProductDatesArray };
}

export interface ProductDatesArray {
    grossRevenue: number
    expenses: number
    unitsSold: number
}

export interface Listing {
    store: string;
    channel: string;
    storeSku: string;
}

export interface Marketplace {
    marketplace: string;
    name: string;
    storeId: string,
    totalUnitsSold: number;
    comissionFee: number;
    fixedFee: number;
    fees: Fees;
}

export interface Fees {
    totalComission: number;
    totalFixedFee: number;
    totalShipping: number;
    FBAPerOrderFulfillmentFee?: number
    FBAPerUnitFulfillmentFee?: number
    FBAWeightBasedFee?: number
    Commission?: number
    FixedClosingFee?: number
    GiftwrapChargeback?: number
    ShippingChargeback?: number
    SalesTaxCollectionFee?: number
    VariableClosingFee?: number
}


// export interface ProductsPerformanceResponse {
//     error: boolean;
//     products: ProductPerformance[];
// }

// export interface ProductPerformance {
//     sku: string;
//     asin: string;
//     shelfcloud_sku: null | string;
//     shelfcloud_sku_id: number | null;
//     unitsSold: number;
//     basePrice: number;
//     shippingPrice: number;
//     grossRevenue: number;
//     expenses: number;
//     FBAPerOrderFulfillmentFee: number;
//     FBAPerUnitFulfillmentFee: number;
//     FBAWeightBasedFee: number;
//     Commission: number;
//     FixedClosingFee: number;
//     GiftwrapChargeback: number;
//     ShippingChargeback: number;
//     SalesTaxCollectionFee: number;
//     VariableClosingFee: number;
//     facilitatorTax_item: number;
//     facilitatorTax_shipping: number;
//     refunds: number;
//     refundsQty: number;
//     datesArray: DatesArray[];
// }

// export interface DatesArray {
//     itemTax: number;
//     quantity: number;
//     itemPrice: number;
//     Commission: number;
//     giftWrapTax: number;
//     refund_item: number;
//     shippingTax: number;
//     purchaseDate: string;
//     giftWrapPrice: number;
//     shippingPrice: number;
//     refund_itemTax: number;
//     FixedClosingFee: number;
//     FBAWeightBasedFee: number;
//     refund_commission: number;
//     GiftwrapChargeback: number;
//     ShippingChargeback: number;
//     VariableClosingFee: number;
//     facilitatorTax_item: number;
//     SalesTaxCollectionFee: number;
//     itemPromotionDiscount: number;
//     refund_adminCommission: number;
//     facilitatorTax_shipping: number;
//     FBAPerUnitFulfillmentFee: number;
//     FBAPerOrderFulfillmentFee: number;
//     shippingPromotionDiscount: number;
//     refund_facilitatorTax_item: number;
//     return_FBACustomerReturnPerUnitFee: number;
// }