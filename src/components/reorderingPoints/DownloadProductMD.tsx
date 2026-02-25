import { useCallback, useMemo } from 'react'

import type { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { DropdownItem } from 'reactstrap'

type Props = {
  product: ReorderingPointsProduct
}

const DownloadProductMD = ({ product }: Props) => {
  const markdown = useMemo(() => {
    const systemPrompt = [
      `You are an Inventory Replenishment Analyst agent. Your job is to forecast demand and recommend the single best reorder quantity for a product, using multiple forecasting approaches and inventory policy logic, while respecting channel/inventory constraints.`,
      ``,
      `MAIN OBJECTIVE`,
      `Given the provided Product Reordering Data (cost, lead time, stock targets, inventories by location/pipeline, and sales history), output:`,
      `1) a brief analysis (very short), and`,
      `2) the recommended Quantity to Order (an integer, units).`,
      ``,
      `CORE RULES (DO THESE INTERNALLY)`,
      `1) Forecast demand using MULTIPLE METHODS, then choose the best (or a robust ensemble):`,
      `   - Classic methods: simple/weighted moving averages using 30/60/90/120/180/365-day totals.`,
      `   - Regression/trend: fit a trend on time (use normalized monthly demand).`,
      `   - Seasonality: detect month-of-year effects from monthly history; apply seasonal indices when supported by data.`,
      `   - Robust/intermittent fallback: use median-based rate and/or Croston/TSB-style logic if demand is sparse or highly irregular.`,
      `   - You must compare methods using backtesting on available history (use error metrics like MAPE/MASE and bias) and prefer the most stable, least biased option. If data is insufficient, use a conservative weighted blend favoring 90–180 day behavior.`,
      ``,
      `2) Stockout/availability adjustment:`,
      `   - Monthly “units sold” must be normalized by “days with stock” to estimate true demand:`,
      `     normalized_monthly_demand = units_sold / max(days_with_stock, 1) * days_in_month`,
      `   - Downweight or exclude months with very low availability (e.g., <10 in-stock days), and treat them as censored demand signals.`,
      ``,
      `3) Channel & inventory constraints (MUST RESPECT):`,
      `   - Warehouse demand must be covered by Warehouse inventory only.`,
      `   - FBA demand must be covered by FBA inventory only.`,
      `   - Warehouse can receive from: Warehouse Inbound + In Production (pipeline) + new order.`,
      `   - FBA can receive from Warehouse transfers, but FBA inventory cannot be used to fulfill Warehouse demand.`,
      `   - If the goal is an overall reorder quantity (new production/purchase), it arrives to Warehouse; plan Warehouse stock to also support planned transfers to FBA needed to hit FBA coverage targets.`,
      ``,
      `4) Planning horizon / targets:`,
      `   - Use Lead Time (days) plus the provided post-lead-time stock targets:`,
      `     - Warehouse target coverage after lead time (days)`,
      `     - FBA target coverage after lead time (days)`,
      `   - Internally compute:`,
      `     - expected demand during lead time (separately for Warehouse and FBA if data supports it),`,
      `     - expected demand for the post-lead-time coverage window,`,
      `     - safety stock based on demand variability and a conservative service level (use a default like 95% if none is provided).`,
      `   - Recommended order quantity must ensure targets are met at/after receipt, net of projected depletion and existing/pipeline inventory.`,
      ``,
      `5) Inventory projection:`,
      `   - Project depletion from “now” through lead time using the chosen demand model(s).`,
      `   - Include all pipeline that arrives to Warehouse within the lead time window as available at receipt; if no ETA detail is provided for pipeline, assume Inbound and In Production arrive at the end of lead time (conservative).`,
      `   - Never double-count inventory across locations.`,
      ``,
      `6) Output constraints:`,
      `   - Order quantity must be an integer number of units.`,
      `   - If the computed quantity is negative, output 0.`,
      `   - If optional constraints are provided (MOQ, case pack, budget cap), round up to MOQ/case pack and respect caps.`,
      ``,
      `RESTRICTIONS (HARD)`,
      `- Do NOT explain steps, formulas, intermediate calculations, model parameters, or show tables.`,
      `- Do NOT output more than the required two lines.`,
      `- Do NOT include bullet lists, headings, code, or extra commentary beyond the brief analysis.`,
      `- Do NOT ask clarifying questions; make reasonable conservative assumptions when needed and proceed.`,
      ``,
      `REQUIRED OUTPUT FORMAT (EXACTLY TWO LINES)`,
      `Analysis: <1–2 short sentences summarizing demand pattern + which approach won at a high level (no steps)>`,
      `Quantity to order: <integer>`,
      ``,
    ].join('\n')

    const monthlyForecast = Object.entries(product.monthlyForecast || {})
      .map(([year, months]) => {
        const monthLines = Object.entries(months)
          .map(([month, values]) => {
            return `- ${year}-${month}: Warehouse ${values.unitsSoldSC} units, ${values.daysWithStockSC} days with stock; FBA ${values.unitsSoldFBA} units, ${values.daysWithStockFBA} days with stock`
          })
          .join('\n')
        return monthLines
      })
      .filter(Boolean)
      .join('\n')

    const totalUnitsSold = Object.entries(product.totalUnitsSold || {})
      .map(([range, value]) => `- ${range}ays: ${value}`)
      .join('\n')

    return [
      systemPrompt,
      `# Product Reordering Data`,
      ``,
      `## Product`,
      `- Title: ${product.title}`,
      `- SKU: ${product.sku}`,
      `- ASIN: ${product.asin}`,
      ``,
      `## Reordering Inputs`,
      `- Seller Cost: ${product.sellerCost}`,
      `- Lead Time (days): ${product.leadTime}`,
      `- Days of Stock after Lead Time in Warehouse: ${product.daysOfStockSC}`,
      `- Days of Stock after Lead Time in FBA: ${product.daysOfStockFBA}`,
      ``,
      `## Inventory`,
      `- Warehouse Qty: ${product.warehouseQty}`,
      `- Warehouse Inbound Qty: ${product.receiving}`,
      `- In Production Qty: ${product.productionQty}`,
      `- FBA Qty: ${product.fbaQty + product.awdQty}`,
      `- FBA Inbound Qty: ${product.fbaInboundQty + product.awdInboundQty}`,
      ``,
      `- Total Inventory: ${product.warehouseQty + product.productionQty + product.receiving + product.fbaQty + product.fbaInboundQty + product.awdQty + product.awdInboundQty}`,
      ``,
      `Important: Warehouse can only receive from warehouse inbound and production. FBA is separate and cannot be used to fulfill warehouse demand. FBA can receive from Warehouse Qty and FBA Inbound Qty.`,
      ``,
      `## Total Units Sold`,
      totalUnitsSold || '- None',
      ``,
      `## Previous Monthly Sales and Days of Stock`,
      monthlyForecast || '- None',
      ``,
    ].join('\n')
  }, [product])

  const fileName = `${product.sku}-reordering-points.md`
  const handleDownloadFile = useCallback(() => {
    if (typeof window === 'undefined') return

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [fileName, markdown])

  return (
    <DropdownItem className='edit-item-btn' onClick={handleDownloadFile}>
      <i className='ri-download-2-line align-middle me-2 fs-5 text-black'></i>
      <span className='fs-7 fw-normal text-dark'>Download Markdown</span>
    </DropdownItem>
  )
}

export default DownloadProductMD
