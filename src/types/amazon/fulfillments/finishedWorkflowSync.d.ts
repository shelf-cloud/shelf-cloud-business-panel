export type FinishedWorkflowSyncChange = 'unchanged' | 'removed' | 'quantity_changed' | 'added'

export interface FinishedWorkflowSyncItem {
  msku: string
  asin: string
  fnsku: string
  change: FinishedWorkflowSyncChange
  shelfCloudQuantity: number | null
  amazonQuantity: number | null
  mappingRequired: boolean
  listingId: number | null
  listingFnsku: string
  shelfCloudSku: string | null
}

export interface FinishedWorkflowSyncPreview {
  error: boolean
  message: string
  syncToken: string
  items: FinishedWorkflowSyncItem[]
}
