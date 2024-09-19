export interface InboundPlan {
    id: number
    businessUniqId: string
    fulfillmentType: string
    amzFinished: boolean
    region: string
    inboundPlanId: string
    operationId: string
    createdAt: string
    status: string
    destinationMarketplaces: string
    name: string
    sourceAddress: SourceAddress
    contactInformation: ContactInformation
    items: Item[]
    skus_details: { [sku: string]: SkuDetails }
    steps: { [step: number]: Step }
    packingOptions: PackingOption[]
    placementOptions: PlacementOption[]
    packingGroups: { [packingGroupId: string]: PackingGroup }
    packingInformation: PackingInformation | null
    placementOptionId: string
    shipments: { [shipmentId: string]: ShipmentDetail }
    generateTransportationOptions: { [placementOptionId: string]: { [shipmentId: string]: ShipmentTransportationConfiguration } }
    transportationOptionsGenerated: boolean
    transportationOptions: TransportationOptions
    confirmedDate: string | null
    confirmedShipments: { [shipmentId: string]: ConfirmedShipments }
    shipDate: string
    totalPrepFees: number
    totalPlacementFees: number
    totalSpdFees: number
    totalLtlFees: number
    totalFees: number
}

export interface SourceAddress {
    city: string
    name: string
    email: string
    postalCode: string
    companyName: string
    countryCode: string
    phoneNumber: string
    addressLine1: string
    addressLine2: string
    stateOrProvinceCode: string
}

export interface ContactInformation {
    name: string
    email: string
    phoneNumber: string
}

export interface Item {
    msku: string
    quantity: number
    prepOwner: string
    labelOwner: string
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

// STEPS

export interface Step {
    step: string
    complete: boolean
}

// PACKING
export interface PackingOption {
    packingGroups: string[];
    fees: PackingOptionFee[];
    discounts: PackingOptionFee[];
    packingOptionId: string;
    supportedShippingConfigurations: any[];
    status: string;
}

export interface PackingGroup {
    packingGroupId: string
    packingBoxes: any[]
    packingItems: PackingItem[]
}

export interface PackingOptionFee {
    description: string;
    type: string;
    value: Currency;
    target: string;
}

export interface Currency {
    amount: number;
    code: string;
}

export interface PackingItem {
    labelOwner: string;
    msku: string;
    quantity: number;
    fnsku: string;
    asin: string;
    prepInstructions: PrepInstruction[];
}

export interface PrepInstruction {
    prepType: string
    fee: PrepInstructionFee
    prepOwner: string
}

export interface PrepInstructionFee {
    amount: number
    code: string
}

// PACKING INFORMATION

export interface PackingInformation {
    packingGroupId: string
    boxes: PackingBox[]
}

export interface PackingBox {
    weight: PackingWeight
    dimensions: PackingDimensions
    quantity: number
    boxId: string
    items: PackingItem[]
    contentInformationSource: string
}

export interface PackingWeight {
    unit: string
    value: number
}

export interface PackingDimensions {
    unitOfMeasurement: string
    length: number
    width: number
    height: number
}

export interface PackingItem {
    msku: string
    quantity: number
    expiration: string
    prepOwner: string
    labelOwner: string
    manufacturingLotCode: string
}

// PLACEMENT OPTIONS

export interface PlacementOption {
    fees: PlacementOptionFee[];
    shipmentIds: string[];
    discounts: PlacementOptionFee[];
    expiration: string;
    placementOptionId: string;
    status: string;
}

export interface PlacementOptionFee {
    description: string;
    type: string;
    value: Value;
    target: string;
}

export interface Value {
    amount: number;
    code: string;
}


// SHIPMENT DETAILS

export interface ShipmentDetail {
    shipment: Shipment
    shipmentId: string
    shipmentBoxes: ShipmentBoxes
    shipmentItems: ShipmentItems
    shipmentPallets: ShipmentPallets
}

export interface Shipment {
    contactInformation: ContactInformation;
    shipmentId: string;
    destination: Destination;
    source: Source;
    placementOptionId: string;
    status: string;
}

export interface ContactInformation {
    phoneNumber: string;
    name: string;
    email: string;
}

export interface Destination {
    address: Address;
    warehouseId: string;
    destinationType: string;
}

export interface Address {
    city: string;
    countryCode: string;
    postalCode: string;
    companyName: string;
    name: string;
    addressLine1: string;
    stateOrProvinceCode: string;
    phoneNumber?: string;
}

export interface Source {
    address: Address;
    sourceType: string;
}

export interface ShipmentBoxes {
    boxes: Box[];
    pagination: Pagination;
}

export interface Box {
    quantity: number;
    packageId: string;
    weight: Weight;
    items: Item[];
    dimensions: Dimensions;
    contentInformationSource: string;
    boxId?: string;
}

export interface Dimensions {
    unitOfMeasurement: string;
    length: number;
    width: number;
    height: number;
}

export interface Item {
    labelOwner: string;
    msku: string;
    quantity: number;
    fnsku: string;
    asin: string;
    prepInstructions: any[];
}

export interface Weight {
    unit: string;
    value: number;
}

export interface Pagination {
}

export interface ShipmentItems {
    pagination: Pagination;
    items: Item[];
}

export interface ShipmentPallets {
    pagination: Pagination;
    pallets: Pallet[];
}

export interface Pallet {
    weight: Weight
    quantity: number
    packageId: string
    dimensions: Dimensions
    stackability: string
}

export interface Weight {
    unit: string
    value: number
}

export interface Dimensions {
    width: number
    height: number
    length: number
    unitOfMeasurement: string
}

// TRANSPORTATION OPTIONS

export interface TransportationOptions { [placementOptionId: string]: { [shipmentId: string]: TransportationOption[] } }

export interface TransportationOptionShipment { [shipmentId: string]: TransportationOption[] }

export interface TransportationOption {
    carrier: Carrier;
    quote?: Quote;
    preconditions: string[];
    shipmentId: string;
    shippingMode: ShippingMode;
    transportationOptionId: string;
    shippingSolution: ShippingSolution;
}

export interface Carrier {
    name: string;
    alphaCode?: string;
}

export interface Quote {
    cost: Cost;
}

export interface Cost {
    amount: number;
    code: string;
}

export enum ShippingMode {
    FreightLTL = "FREIGHT_LTL",
    GroundSmallParcel = "GROUND_SMALL_PARCEL",
}

export enum ShippingSolution {
    AmazonPartneredCarrier = "AMAZON_PARTNERED_CARRIER",
    UseYourOwnCarrier = "USE_YOUR_OWN_CARRIER",
}

// GENERATED TRANSPORTATION OPTIONS

export interface ShipmentTransportationConfiguration {
    shipmentId: string
    readyToShipWindow: ReadyToShipWindow
    contactInformation: ContactInformation
    freightInformation?: FreightInformation
    pallets?: GenerateTransportationPallet[]
}

export interface ReadyToShipWindow {
    start: string
}

export interface ContactInformation {
    phoneNumber: string
    email: string
    name: string
}

export interface GenerateTransportationPallet {
    dimensions: Dimensions
    quantity: number
    stackability: string
    weight: Weight
}

export interface Dimensions {
    height: number
    length: number
    unitOfMeasurement: string
    width: number
}

export interface Weight {
    unit: string
    value: number
}

export interface FreightInformation {
    declaredValue: DeclaredValue
    freightClass: string
}

export interface DeclaredValue {
    amount: number
    code: string
}

// DELIVERY WINDOWS

export interface DeliveryWindowsOptions { [placementOptionId: string]: { [shipmentId: string]: DeliveryWindowOption[] } }

export interface DeliveryWindowsResponse {
    error: boolean
    deliveryWindows: DeliveryWindows
    message: string
}

export interface DeliveryWindows {
    placementOptionId: string
    shipmentId: string
    deliveryWindowOptions: DeliveryWindowOption[]
}

export interface DeliveryWindowOption {
    availabilityType: string
    endDate: string
    validUntil: string
    deliveryWindowOptionId: string
    startDate: string
}

// CONFIRMED SHIPMENTS

export interface ConfirmedShipments {
    shipment: ConfirmedShipment
    shipmentId: string
    shipmentBoxes: ShipmentBoxes
    shipmentItems: ShipmentItems
    shipmentPallets: ShipmentPallets
}

export interface ConfirmedShipment {
    name: string
    source: Source
    status: string
    shipmentId: string
    destination: Destination
    trackingDetails: TrackingDetails
    amazonReferenceId: string
    placementOptionId: string
    contactInformation: ContactInformation
    shipmentConfirmationId: string
    selectedTransportationOptionId: string
}

export interface TrackingDetails {
    ltlTrackingDetail: LtlTrackingDetail
    spdTrackingDetail: SpdTrackingDetail
}

export interface LtlTrackingDetail {
    billOfLadingNumber: string
}

export interface SpdTrackingDetail {
    spdTrackingItems: SpdTrackingItem[]
}

export interface SpdTrackingItem {
    boxId: string
    trackingId: string
}

// GET LABELS

export interface GetLabelsResponse {
    error: boolean
    labels: Labels
    message: string
}

export interface Labels {
    payload: Payload
}

export interface Payload {
    DownloadURL: string
}

// FULFILLMENT GENERAL STATES

export interface WaitingReponses {
    inventoryToSend: boolean
    shipping: boolean
    shippingExpired: boolean
    transportationOptions: boolean
    boxLabels: boolean
    printingLabel: boolean
    CarrierPalletInfo: boolean
    trackingDetails: boolean
}