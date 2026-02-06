export interface ActiveWorkflowsReponse {
  error: boolean
  activeWorkFlows: { [key: string]: ActiveWorkFlow }
  message: string
}

export interface ActiveWorkFlow {
  createdAt: string
  marketplaceIds: string[]
  sourceAddress: SourceAddress
  lastUpdatedAt: string
  name: string
  inboundPlanId: string
  status: string
  items: Item[]
}

export interface Item {
  labelOwner: string
  msku: string
  quantity: number
  fnsku: string
  asin: string
  prepInstructions: PrepInstruction[]
}

export interface PrepInstruction {
  prepType: string
  prepOwner: string
}

export interface SourceAddress {
  phoneNumber: string
  city: string
  countryCode: string
  postalCode: string
  name: string
  addressLine1: string
  stateOrProvinceCode: string
}
