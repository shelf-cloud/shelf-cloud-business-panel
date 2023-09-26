import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import React, { useContext } from 'react'

type Props = {
  sku?: string
  upc?: string
  asin?: string
  fnsku?: string
  defaultCost: number
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
}

const SKU_product_details = ({ sku, upc, asin, fnsku, defaultCost, defaultPrice, msrp, map, floor, ceilling }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='py-1 border-bottom w-100'>
      <table className='table table-sm table-borderless'>
        <thead>
          <tr className='text-center'>
            <th>SKU</th>
            <th>UPC</th>
            <th>Asin</th>
            <th>FNSKU</th>
            <th>Default Cost</th>
            <th>Default Price</th>
            <th>MSRP</th>
            <th>MAP</th>
            <th>Floor</th>
            <th>Ceilling</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td>{sku}</td>
            <td>{upc}</td>
            <td>{asin}</td>
            <td>{fnsku}</td>
            <td>{FormatCurrency(state.currentRegion, defaultCost)}</td>
            <td>{FormatCurrency(state.currentRegion, defaultPrice)}</td>
            <td>{FormatCurrency(state.currentRegion, msrp)}</td>
            <td>{FormatCurrency(state.currentRegion, map)}</td>
            <td>{FormatCurrency(state.currentRegion, floor)}</td>
            <td>{FormatCurrency(state.currentRegion, ceilling)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default SKU_product_details
