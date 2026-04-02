import { AmazonFulfillmentSku } from '@typesTs/amazon/fulfillments'

export type FulfillmentValidationMode = 'individual-units' | 'master-boxes'

export type ExceededSkuMap = Record<
  string,
  {
    requestedQty: number
    availableQty: number
    contributors: string[]
  }
>

export type MissingAvailabilityMap = Record<
  string,
  {
    contributors: string[]
  }
>

const hasFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const addRequestedQty = (requestedQtyBySku: Map<string, number>, contributorsBySku: Map<string, Set<string>>, sku: string, qty: number, msku: string) => {
  if (!Number.isFinite(qty) || qty <= 0) {
    return
  }

  requestedQtyBySku.set(sku, (requestedQtyBySku.get(sku) ?? 0) + qty)

  const contributors = contributorsBySku.get(sku) ?? new Set<string>()
  contributors.add(msku)
  contributorsBySku.set(sku, contributors)
}

const setAvailableQty = (availableQtyBySku: Map<string, number>, sku: string, qty: number) => {
  if (!hasFiniteNumber(qty)) {
    return
  }

  const currentQty = availableQtyBySku.get(sku)
  availableQtyBySku.set(sku, currentQty === undefined ? qty : Math.max(currentQty, qty))
}

export const validateFulfillmentWarehouseUsage = (
  rows: AmazonFulfillmentSku[],
  mode: FulfillmentValidationMode
): { exceededSkus: ExceededSkuMap; missingAvailabilitySkus: MissingAvailabilityMap } => {
  const availableQtyBySku = new Map<string, number>()
  const requestedQtyBySku = new Map<string, number>()
  const contributorsBySku = new Map<string, Set<string>>()

  for (const row of rows) {
    if (!row.isKit) {
      setAvailableQty(availableQtyBySku, row.shelfcloud_sku, row.quantity)
    }
  }

  for (const row of rows) {
    const orderQty = Number(row.orderQty)
    if (!Number.isFinite(orderQty) || orderQty <= 0) {
      continue
    }

    const rowMultiplier = mode === 'master-boxes' ? Number(row.boxQty) : 1
    if (!Number.isFinite(rowMultiplier) || rowMultiplier <= 0) {
      continue
    }

    if (row.isKit) {
      for (const child of row.children ?? []) {
        setAvailableQty(availableQtyBySku, child.sku, child.available)
        addRequestedQty(requestedQtyBySku, contributorsBySku, child.sku, Number(child.qty) * orderQty * rowMultiplier, row.msku)
      }
      continue
    }

    addRequestedQty(requestedQtyBySku, contributorsBySku, row.shelfcloud_sku, orderQty * rowMultiplier, row.msku)
  }

  const exceededSkus: ExceededSkuMap = {}
  const missingAvailabilitySkus: MissingAvailabilityMap = {}

  for (const [sku, requestedQty] of requestedQtyBySku.entries()) {
    const availableQty = availableQtyBySku.get(sku)
    const contributors = Array.from(contributorsBySku.get(sku) ?? [])

    if (availableQty === undefined) {
      missingAvailabilitySkus[sku] = { contributors }
      continue
    }

    if (requestedQty > availableQty) {
      exceededSkus[sku] = {
        requestedQty,
        availableQty,
        contributors,
      }
    }
  }

  return {
    exceededSkus,
    missingAvailabilitySkus,
  }
}
