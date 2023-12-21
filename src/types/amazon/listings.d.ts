export interface ListingsResponse {
    error: boolean;
    listings: Listing[];
    message: string;
}

export interface Listing {
    id: number;
    businessUniqId: string;
    sku: string;
    fnsku: string;
    asin: string;
    product_name: string;
    condition: string;
    price: number;
    mfn_listing_exists: boolean;
    mfn_fulfillable_quantity: number;
    afn_listing_exists: boolean;
    afn_warehouse_quantity: number;
    afn_fulfillable_quantity: number;
    afn_unsellable_quantity: number;
    afn_reserved_quantity: number;
    afn_total_quantity: number;
    afn_inbound_working_quantity: number;
    afn_inbound_shipped_quantity: number;
    afn_inbound_receiving_quantity: number;
    shelfcloud_sku: null | string;
    shelfcloud_sku_id: null | number;
    image: null | string;
    brand: string | null;
}