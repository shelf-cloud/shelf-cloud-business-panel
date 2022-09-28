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