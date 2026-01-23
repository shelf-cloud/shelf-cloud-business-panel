/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { Listings } from '@typings'

type Props = {
  listings: Listings[]
}

const Listings_Product_Details = ({ listings }: Props) => {
  return (
    <div className='py-1 px-3 w-100'>
      <table className='table table-sm'>
        <thead>
          <tr key={'listings-header'} className='text-left'>
            <th>Store SKU</th>
            <th>Channel</th>
            <th>Store</th>
          </tr>
        </thead>
        <tbody className='fs-7'>
          {listings.length > 0 ? (
            listings.map((store, index) => (
              <tr key={`listing-${store.store}-${index}`} className='text-left'>
                <td>{store.storeSku}</td>
                <td>
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
                <td>{store.store}</td>
              </tr>
            ))
          ) : (
            <tr key={'no-listings'}>
              <td>No Listings Mapped</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Listings_Product_Details
