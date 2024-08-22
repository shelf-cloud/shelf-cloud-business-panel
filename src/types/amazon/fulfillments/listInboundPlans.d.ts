export interface ListInboundPlanResponse {
    error: boolean;
    message?: string;
    inboundPlans: ListInboundPlan[];
}

export interface ListInboundPlan {
    id: number;
    businessUniqId: string;
    region: string;
    inboundPlanId: string;
    fulfillmentType: string
    amzFinished: boolean
    operationId: string;
    createdAt: string;
    status: string;
    destinationMarketplaces: string;
    name: string;
    sourceAddress: SourceAddress;
    contactInformation: ContactInformation;
    items: Item[];
    operationSatus: null;
    operationProblems: null;
    packingInformation: null;
    shipments: null;
    placementOptionId: null;
}

export interface ContactInformation {
    name: string;
    email: string;
    phoneNumber: string;
}

export interface Item {
    msku: string;
    quantity: number;
    prepOwner: string;
    labelOwner: string;
}

export interface SourceAddress {
    city: string;
    name: string;
    email: string;
    postalCode: string;
    companyName: string;
    countryCode: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    stateOrProvinceCode: string;
}