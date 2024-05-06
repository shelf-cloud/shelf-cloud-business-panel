export interface ReorderingPointsResponse {
    [key: string]: ReorderingPointsProduct;
}

export interface ReorderingPointsProduct {
    inventoryId: number;
    business: string;
    image: string;
    title: string;
    barcode: string;
    sku: string;
    asin: string;
    fnSku: string;
    boxQty: number;
    itemVolume: number;
    itemBoxVolume: number;
    grossRevenue: number;
    expenses: number;
    unitsSold: number;
    recommendedDaysOfStock: number;
    hideReorderingPoints: boolean;
    warehouseQty: number;
    fbaQty: number;
    productionQty: number;
    poDates: { [key: string]: number };
    receiving: number;
    sellerCost: number;
    leadTime: number;
    brand: string;
    category: string;
    supplier: string;
    show: number;
    daysRemaining: number;
    daysToOrder: number;
    urgency: number;
    adjustedForecast: number;
    order: number;
    orderAdjusted: number;
    useOrderAdjusted: boolean;
    marketplaces: { [key: string]: ReorderingPointsMarketplace };
    dateList: { [key: string]: DateList };
    totalUnitsSold: { [key: string]: number };
    forecastModel: string;
    forecast: { [key: string]: number }
}

export interface DateList {
    unitsSold: number;
    dailyStock: number;
    dailyStockFBA: number;
}

export interface ReorderingPointsMarketplace {
    name: string;
    storeId: number;
    grossRevenue: number;
    expenses: number;
    totalUnitsSold: number;
    unitsSold: { [key: string]: number };
}

export interface ReorderingPointsSalesResponse {
    [key: string]: ReorderingPointsSales;
    error?: string;
    message?: string;
}

export interface ReorderingPointsSales {
    inventoryId: number;
    sku: string;
    asin: string;
    itemVolume: number | number;
    grossRevenue: number;
    expenses: number;
    unitsSold: number;
    sellingPrice: number | number;
    reimbursementsOrders: any[];
    storageCost: number | number;
    marketplaces: { [key: string]: RPSalesMarketplace };
    sellerCost: number | number;
    inboundShippingCost: number;
    otherCosts: number;
    shippingToFBA: number;
}

interface RPSalesMarketplace {
    name: string;
    storeId: number;
    grossRevenue: number;
    expenses: number;
    totalUnitsSold: number;
    comissionFee: number;
    fixedFee: number;
}