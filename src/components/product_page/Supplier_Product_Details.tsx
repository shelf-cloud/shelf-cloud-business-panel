import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import React, { useContext } from 'react'

type Props = {
  supplier?: string
  sellerCost?: number
  overSeasShippingCost?: number
  landedCost?: number
  productionTime?: number
  transitTime?: number
  leadTime?: number
}

const Supplier_Product_Details = ({ supplier, sellerCost, overSeasShippingCost, landedCost, productionTime, transitTime, leadTime }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='py-1 border-bottom w-100'>
      <table className='table table-sm table-borderless'>
        <thead>
          <tr className='text-center'>
            <th>Supplier</th>
            <th>Seller Cost</th>
            <th>Over Seas Shipping Cost</th>
            <th>Landed Cost</th>
            <th>{`Production Time (Days)`}</th>
            <th>{`Transit Time (Days)`}</th>
            <th>{`Lead Time (Days)`}</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className={supplier ?? 'text-muted fw-light fst-italic'}>{supplier ?? 'No Supplier'}</td>
            <td className={sellerCost ? '' : 'text-muted fw-light fst-italic'}>
              {sellerCost ? FormatCurrency(state.currentRegion, sellerCost) : 'No Cost'}
            </td>
            <td className={overSeasShippingCost ? '' : 'text-muted fw-light fst-italic'}>
              {overSeasShippingCost ? FormatCurrency(state.currentRegion, overSeasShippingCost) : 'No Cost'}
            </td>
            <td className={landedCost ? '' : 'text-muted fw-light fst-italic'}>
              {landedCost ? FormatCurrency(state.currentRegion, landedCost) : 'No Cost'}
            </td>
            <td className={productionTime ? '' : 'text-muted fw-light fst-italic'}>{`${productionTime ?? 'No'} Days`}</td>
            <td className={transitTime ? '' : 'text-muted fw-light fst-italic'}>{`${transitTime ?? 'No'} Days`}</td>
            <td className={leadTime ? '' : 'text-muted fw-light fst-italic'}>{`${leadTime ?? 'No'} Days`}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Supplier_Product_Details
