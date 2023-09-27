import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import React, { useContext } from 'react'

type Props = {
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA?: number
}

const Supplier_Product_Details = ({ sellerCost, inboundShippingCost, otherCosts, productionTime, transitTime, shippingToFBA }: Props) => {
  const { state }: any = useContext(AppContext)
  const landedCost = (sellerCost + inboundShippingCost + otherCosts) ?? 0
  const totalLeadTime = (productionTime + transitTime)
  return (
    <div className='py-1 border-bottom w-100'>
      <table className='table table-sm table-borderless'>
        <thead>
          <tr className='text-center'>
            <th>Seller Cost</th>
            <th>Inbound Shipping Cost</th>
            <th>Other Costs</th>
            <th>Landed Cost</th>
            <th>{`Production Time (Days)`}</th>
            <th>{`Transit Time (Days)`}</th>
            <th>{`Total Lead Time (Days)`}</th>
            <th>Shipping To FBA Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className={sellerCost ? '' : 'text-muted fw-light fst-italic'}>
              {sellerCost ? FormatCurrency(state.currentRegion, sellerCost) : 'No Cost'}
            </td>
            <td className={inboundShippingCost ? '' : 'text-muted fw-light fst-italic'}>
              {inboundShippingCost ? FormatCurrency(state.currentRegion, inboundShippingCost) : 'No Cost'}
            </td>
            <td className={otherCosts ? '' : 'text-muted fw-light fst-italic'}>
              {otherCosts ? FormatCurrency(state.currentRegion, otherCosts) : 'No Cost'}
            </td>
            <td className={landedCost ? '' : 'text-muted fw-light fst-italic'}>
              {landedCost ? FormatCurrency(state.currentRegion, landedCost) : 'No Cost'}
            </td>
            <td className={productionTime ? '' : 'text-muted fw-light fst-italic'}>{`${productionTime ?? 'No'} Days`}</td>
            <td className={transitTime ? '' : 'text-muted fw-light fst-italic'}>{`${transitTime ?? 'No'} Days`}</td>
            <td className={totalLeadTime ? '' : 'text-muted fw-light fst-italic'}>{`${totalLeadTime ?? 'No'} Days`}</td>
            <td className={shippingToFBA ? '' : 'text-muted fw-light fst-italic'}>
              {shippingToFBA ? FormatCurrency(state.currentRegion, shippingToFBA) : 'No Cost'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Supplier_Product_Details
