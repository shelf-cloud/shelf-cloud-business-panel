export interface FBAOrdersResponse {
    error: boolean;
    orders: FBAOrder[];
}

export interface FBAOrder {
    id: number;
    amazonOrderId: string;
    purchaseDate: Date;
    orderStatus: string;
    salesChannel: string;
    fulfillmentChannel: string;
    marketplaceId: string;
    currencyCode: string;
    orderItems: FBAOrderItem[];
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
}

export interface FBAOrderItem {
    sku: string;
    asin: string;
    itemTax: number;
    orderId: string;
    quantity: number;
    itemPrice: number;
    giftWrapTax: number;
    shippingTax: number;
    giftWrapPrice: number;
    shippingPrice: number;
    itemPromotionDiscount: number;
    shippingPromotionDiscount: number;
    shelfcloud_sku: null | string;
    shelfcloud_sku_id: number | null;
}