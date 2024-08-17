export interface FBAShipmentsRepsonse {
    error: boolean;
    shipments: ShipmentElement[];
    message: string;
}

export interface FBAShipmentsDetailsRepsonse {
    error: boolean;
    shipment: ShipmentElement;
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
    skus_details: SkusDetails;
    shipment: ShipmentShipment;
    shipmentBoxes: ShipmentBoxes;
    shipmentItems: ShipmentItems;
    shipmentPallets: ShipmentPallets;
    totalPrepFees: number;
    totalPlacementFees: number;
    totalSpdFees: number;
    totalLtlFees: number;
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
    countryCode: CountryCode;
    addressLine1: string;
    stateOrProvinceCode: string;
    phoneNumber?: string;
}

export enum CountryCode {
    Us = "US",
}

export interface Source {
    address: Address;
    sourceType: string;
}

export interface TrackingDetails {
    ltlTrackingDetail: Pagination;
    spdTrackingDetail: SpdTrackingDetail;
}

export interface Pagination {
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
    unitOfMeasurement: UnitOfMeasurement;
}

export enum UnitOfMeasurement {
    In = "IN",
}

export interface Item {
    asin: Asin;
    msku: Msku;
    fnsku: Asin;
    quantity: number;
    labelOwner: LabelOwner;
    prepInstructions: any[];
}

export enum Asin {
    B071Hxdrgv = "B071HXDRGV",
}

export enum LabelOwner {
    None = "NONE",
}

export enum Msku {
    FBADogBedPillowLarge2017 = "FBA-Dog-Bed-Pillow-Large-2017",
}

export interface Weight {
    unit: Unit;
    value: number;
}

export enum Unit {
    LB = "LB",
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

export interface SkusDetails {
    "FBA-Dog-Bed-Pillow-Large-2017": FBADogBedPillowLarge2017;
}

export interface FBADogBedPillowLarge2017 {
    asin: Asin;
    boxes: number;
    image: string;
    isKit: boolean;
    title: string;
    width: number;
    boxQty: number;
    height: number;
    length: number;
    weight: number;
    boxWidth: number;
    children: any[];
    boxHeight: number;
    boxLength: number;
    boxWeight: number;
    inventoryId: number;
    shelfcloud_id: number;
    shelfcloud_sku: string;
}
