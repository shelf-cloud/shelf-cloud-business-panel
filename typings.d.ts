export interface Summary {
  binsUSed: number
  skus: number
  totalInventoryQty: number
  currentBalance: number
  mostInventory: ProductSummary[]
  totalCharges: TotalChagres
  invoices: InvoiceList[]
}

export interface ProductSummary {
  inventoryId: number
  title: string
  sku: string
  image: string
  totalQty: number
}

export interface TotalChagres {
  totalpickpackCharge: number
  totalshippingCharge: number
  totallabeling: number
  totalreceivingService: number
  totalreceivingPallets: number
  totalreceivingWrapService: number
  totalmanHour: number
  totalextraCharge: number
}

export interface InvoiceList {
  idOfInvoice?: number
  invoiceNumber: string
  createdDate?: string
  expireDate: string
  paid: boolean
  payLink: string
  totalCharge: number
}

export interface InvoiceDetails {
  businessName: string
  businessNif: string
  businessAddress: string
  createdDate: string
  expireDate: string
  invoiceNumber: string
  totalCharge: number
  paid: boolean
  payLink: string
}

export interface OrderDetails {
  orderId: number;
  closedDate: string;
  orderNumber: string;
  orderType: string;
  totalCharge: number
}

export interface InvoiceFullDetails {
  invoice: InvoiceDetails;
  orders: OrderDetails[];
}

export interface Business {
  id: number
  name: string
  db: string
  username: string
  shipstationId: []
  orderCost: number
  extraItemOrderCost: number
  shippingPercentageCost: number
  palletCost: number
  labelCost: number
  parcelBoxCost: number
  '40HQ-FL': number
  '40HQ-P': number
  '20HQ-FL': number
  '20HQ-P': number
  receivingPallets: number
  receivingManHour: number
  receivingPalletCost: number
  receivingWrapService: number
}

export interface LogRowType {
  id: number
  sku: string
  date: string
  details: string
}

export interface ProductRowType {
  Image: string
  Title: string
  SKU: string
  ASIN?: string
  FNSKU?: string
  Barcode?: string
  Quantity: {
    inventoryId: number
    businessId: number
    sku: string
    quantity: number
  }
  unitDimensions?: {
    weight: number
    length: number
    width: number
    height: number
  }
  boxDimensions?: {
    weight: number
    length: number
    width: number
    height: number
  }
  qtyBox: number
}
export interface Product {
  inventoryId: number
  businessId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  note: string
  asin: string
  fnSku: string
  quantity: number
  reserved: number
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
  activeState: boolean
}

// PRODUCT DETAILS PAGE

export interface LatestOrders {
  orderId: number
  date: string
  orderNumber: string
  qty: number
  isReceiving: boolean
}

export interface ProductBins {
  binName: string
  quantity: number
  binBalance: number
}

export interface Listings {
  storeSku: string
  channel: string
  store: string
}

export interface Identifier {
  type: string
  value: string
}

export interface ProductDetails {
  inventoryId: number
  businessId: number
  isKit: boolean
  business: string
  image: string
  title: string
  // general
  description: string
  brand: string
  category: string
  // old details
  barcode: string
  sku: string
  note: string
  asin: string
  fnsku: string
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
  activeState: boolean
  // sku
  defaultCost: number
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
  // supplier
  supplier: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA: number
  // summary
  currentStorageBalance: number
  binsUsed: number
  inventoryValue: number
  // inventory
  onhand: number
  buffer: number
  available: number
  reserved: number
  receiving: number
  latestOrders: LatestOrders[]
  bins: ProductBins[]
  listings: Listings[]
  itemCondition: "New" | "Like New" | "Used"
  identifiers: Identifier[]
  brands: string[]
  categories: string[]
  suppliers: string[]
}

// STORAGE PRODUCTS
export interface StorageBin {
  binName: string
  idBin: number
  quantity: number
  binBalance: number
  countEntry: boolean
}
export interface StorageRowProduct {
  inventoryId: number
  businessId: number
  business: string
  image: string
  title: string
  sku: string
  bins: StorageBin[]
  currentBalance: number
  totalBins: number
  totalQuantity: number
}

// SHIPMENTS
export interface OrderItem {
  sku: string
  name: string
  boxQty: number
  quantity: number
  businessId: number
}

interface ChargesFees {
  orderCost?: number
  extraItemOrderCost?: number
  shippingPercentageCost?: number
  palletCost?: number
  labelCost?: number
  parcelBoxCost?: number
  '40HQ-FL'?: number
  '40HQ-P'?: number
  '20HQ-FL'?: number
  '20HQ-P'?: number
  receivingPallets?: number
  receivingManHour?: number
  receivingPalletCost?: number
  receivingWrapService?: number
  minQtyForIndividualUnitsOrder?: number
  individualUnitCost?: number
}

interface Plan {
  items: {
    sku: string,
    name: string,
    image: string,
    cartons: {
      boxId: number,
      qtyInBox: number
    }[],
    qtyToShip: number
  }[],
  cartons: {
    box: {
      width: number,
      height: number,
      length: number,
      weight: number
    },
    skus: {
      sku: string,
      qtyInBox: number
    }[],
    boxId: number
  }[]
}
interface IndividualUnitsPlan {
  plan: Plan
  state: string
}

export interface OrderRowType {
  carrierIcon: string
  trackingLink: string
  id: number
  businessId: string
  orderId: string
  orderNumber: string
  orderDate: string
  closedDate: string
  orderStatus: string
  orderType: string
  trackingNumber: string
  pickpackCharge: number
  shippingCharge: number
  labeling: number
  receivingService: number
  receivingPallets: number
  receivingWrapService: number
  manHour: number
  extraCharge: number
  chargesFees: ChargesFees
  shipName: string
  shipStreet: string
  shipCity: string
  shipState: string
  shipZipcode: string
  shipCountry: string
  orderTotal: number
  orderPaid: number
  orderShipping: number
  carrierService: string
  carrierUsed: string
  carrierType: string
  carrierShipping: number
  onixShipping: number
  storeId: string
  channelName: string
  channelLogo: string
  orderItems: []
  totalItems: number
  numberPallets: number
  numberBoxes: number
  shrinkWrap: number
  manHours: number
  manualChanges: boolean
  manualChangesShipping: boolean
  invoiced: boolean
  proofOfShipped: string
  totalCharge: number
  totalReceivedItems?: number
  isThird: boolean
  thirdInfo: string
  labelsName: string
  palletLabelsName?: string
  hasReturn: boolean
  extraComment: string
  individualUnitsPlan?: IndividualUnitsPlan
  isIndividualUnits?: boolean
  totalIndividualUnits?: number
}

export interface ShipmentOrderItem {
  name: string
  sku: string
  unitPrice: number
  quantity: number
  qtyReceived?: number
}

// WHOLESALE ORDERS

export interface WholesaleProduct {
  inventoryId: number
  businessId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
  quantity: number
  reserved: number
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
  activeState: boolean
  maxOrderQty: number
  isKit?: boolean
  children?: {
    available: number
    idInventory: number
    maxKits: number
    qty: number
    sku: number
    title: string
  }[]
}
export interface wholesaleProductRow {
  image: string
  title: string
  sku: string
  barcode?: string
  asin?: string
  fnSku?: string
  quantity: {
    quantity: number
    inventoryId: number
    businessId: number
    sku: string
  }
  qtyBox?: number
  orderQty: string
  totalToShip?: number
  maxOrderQty?: number
  isKit?: boolean
  children?: {
    available: number
    idInventory: number
    maxKits: number
    qty: number
    sku: number
    title: string
  }[]
}

export interface WholeSaleOrderProduct {
  businessId: number
  sku: string
  name: string
  quantity: number
  boxQty: number
  totalBoxes: number
}
export interface WholeSaleOrder {
  businessId: number
  orderId: string
  orderNumber: string
  orderDate: string
  orderStatus: string
  orderType: string
  pickpackCharge: number
  labeling: number
  carrierService: string
  carrierType: string
  orderItems: WholeSaleOrderProduct[]
  totalItems: number
  numberPallets: number
  numberBoxes: number
}


// KITS ORDERS

export interface Children {
  available: number
  idInventory: number
  qty: number
  sku: string
  title: string
}

export interface KitRow {
  kitId: number
  businessId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
  quantity: number
  weight: number
  length: number
  width: number
  height: number
  activeState: boolean
  children: Children[]
  note?: string
}