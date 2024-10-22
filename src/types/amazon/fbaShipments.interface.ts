export interface FBAShipmentsRepsonse {
    error: boolean;
    shipments: FBAShipment[];
    message: string;
}

export interface FBAShipmentsDetailsRepsonse {
    error: boolean;
    shipment: FBAShipment;
    message: string;
}

export interface FBAShipment {
    id: number;
    businessUniqId: string;
    region: string;
    fulfillmentType: string;
    shippingMode: string;
    inboundPlanId: string;
    placementOptionId: string;
    shipmentId: string;
    createdAt: string;
    lastUpdated: string;
    destinationMarketplaces: string;
    skus_details: { [sku: string]: SkuDetails }
    shipment: ShipmentShipment;
    shipmentBoxes: ShipmentBoxes;
    shipmentItems: ShipmentItems;
    shipmentPallets: ShipmentPallets;
    totalPrepFees: number;
    totalPlacementFees: number;
    totalSpdFees: number;
    totalLtlFees: number;
    receipts?: { [msku: string]: Receipt }
    isComplete: boolean
}

export interface Receipt {
    reason: string
    quantity: number
    reconciled: number
    shipmentId: string
    unreconciled: number
}

export interface SkuDetails {
    asin: string
    boxes: string
    image: string
    isKit: boolean
    title: string
    width: number
    boxQty: number
    height: number
    length: number
    weight: number
    boxWidth: number
    children: Child[]
    boxHeight: number
    boxLength: number
    boxWeight: number
    inventoryId: number
    shelfcloud_id: number
    shelfcloud_sku: string
}

export interface Child {
    qty: number;
    sku: string;
    title: string;
    idInventory: number;
    available: number;
    maxKits: number;
}

export interface ShipmentShipment {
    name: string;
    source: Source;
    status: string;
    shipmentId: string;
    destination: Destination;
    placementOptionId: string;
    contactInformation: ContactInformation;
    shipmentConfirmationId: string;
    trackingDetails?: TrackingDetails;
    selectedTransportationOptionId?: string;
}

export interface ContactInformation {
    name: string;
    email: string;
    phoneNumber: string;
}

export interface Destination {
    address: Address;
    warehouseId: string;
    destinationType: string;
}

export interface Address {
    city: string;
    name: string;
    postalCode: string;
    countryCode: string;
    addressLine1: string;
    stateOrProvinceCode: string;
    phoneNumber?: string;
}

export interface Source {
    address: Address;
    sourceType: string;
}

export interface TrackingDetails {
    ltlTrackingDetail: LtlTrackingDetail;
    spdTrackingDetail: SpdTrackingDetail;
}

export interface LtlTrackingDetail {
    billOfLadingNumber: string
}

export interface SpdTrackingDetail {
    spdTrackingItems: SpdTrackingItem[];
}

export interface SpdTrackingItem {
    boxId: string;
    trackingId: string;
}

export interface ShipmentBoxes {
    boxes: Box[];
    pagination: Pagination;
}

export interface Box {
    boxId: string;
    items: Item[];
    weight: Weight;
    quantity: number;
    packageId: string;
    dimensions: Dimensions;
    contentInformationSource: string;
}

export interface Dimensions {
    width: number;
    height: number;
    length: number;
    unitOfMeasurement: string;
}

export interface Item {
    asin: string;
    msku: string;
    fnsku: string;
    quantity: number;
    labelOwner: string;
    prepInstructions: any[];
}

export interface Weight {
    unit: string;
    value: number;
}

export interface ShipmentItems {
    items: Item[];
    pagination: Pagination;
}

export interface ShipmentPallets {
    pallets: Pallet[];
    pagination: Pagination;
}

export interface Pallet {
    weight: Weight;
    quantity: number;
    packageId: string;
    dimensions: Dimensions;
    stackability: string;
}

export interface Pagination {
    nextToken: string;
}