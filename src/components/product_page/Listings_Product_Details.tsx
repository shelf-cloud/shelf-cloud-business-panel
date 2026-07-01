/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { Listings } from '@typings'

type Props = {
  listings: Listings[]
}

const Listings_Product_Details = ({ listings }: Props) => {
  return (
    <div className='tw:py-1 tw:px-3 tw:w-full'>
      <table className='tw:w-full tw:text-[11.2px]'>
        <thead>
          <tr key={'listings-header'} className='tw:text-left'>
            <th className='tw:px-2 tw:py-1'>Store SKU</th>
            <th className='tw:px-2 tw:py-1'>Channel</th>
            <th className='tw:px-2 tw:py-1'>Store</th>
          </tr>
        </thead>
        <tbody>
          {listings.length > 0 ? (
            listings.map((store, index) => (
              <tr key={`listing-${store.store}-${index}`} className='tw:text-left tw:border-t tw:border-[color:var(--border)]'>
                <td className='tw:px-2 tw:py-1'>{store.storeSku}</td>
                <td className='tw:px-2 tw:py-1'>
                  <img
                    loading='lazy'
                    src={store.channel ? store.channel : NoImageAdress}
                    alt='product Image'
                    style={{
                      width: '20px',
                      height: '20px',
                      objectFit: 'contain',
                    }}
                  />
                </td>
                <td className='tw:px-2 tw:py-1'>{store.store}</td>
              </tr>
            ))
          ) : (
            <tr key={'no-listings'}>
              <td className='tw:px-2 tw:py-1'>No Listings Mapped</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Listings_Product_Details
