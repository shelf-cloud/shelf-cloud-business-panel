// interface Image {
//     asset: {
//       url: string;
//     };
//   }

//   export interface Cuenco {
//     _id: string;
//     title: string;
//     slug: {
//       current: string;
//     };
//     price: number;
//     description: string;
//     listIngredients: string;
//     listAlergens: string;
//     tags: [];
//     categorias: [];
//     image: Image;
//     ingredientes: Ingredientes[];
//   }


export interface Business {
    id: number;
    name: string;
    db: string;
    username: string;
    shipstationId: [];
    orderCost: number;
    extraItemOrderCost: number;
    shippingPercentageCost: number;
    palletCost: number;
    labelCost: number;
    parcelBoxCost: number;
    '40HQ-FL': number;
    '40HQ-P': number;
    '20HQ-FL': number;
    '20HQ-P': number;
    receivingPallets: number;
    receivingManHour: number;
    receivingPalletCost: number;
    receivingWrapService: number;
}

export interface LogRowType {
    id: number;
    sku: string;
    date: string;
    details: string;
}

export interface ProductRowType {
    Image: string;
    Title: string;
    SKU: string;
    ASIN: string;
    FNSKU: string;
    Barcode: string;
    Quantity: {};
    unitDimensions: {};
    boxDimensions: {};
    qtyBox: number;
}
export interface Product {
    inventoryId: number;
    businessId: number;
    business: string;
    image: string;
    title: string;
    barcode: string;
    sku: string;
    asin: string;
    fnSku: string;
    quantity: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    boxQty: number;
    boxWeight: number;
    boxLength: number;
    boxWidth: number;
    boxHeight: number;
    activeState: boolean;
}