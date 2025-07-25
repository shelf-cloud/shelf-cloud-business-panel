/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { Listings } from '@typings'

type Props = {
  listings: Listings[]
}

const Listings_Kit_Details = ({ listings }: Props) => {
  return (
    <div className='py-1 w-100'>
      <table className='table table-sm'>
        <thead>
          <tr key={'listing-header'} className='text-center'>
            <th>Store SKU</th>
            <th>Channel</th>
            <th>Store</th>
          </tr>
        </thead>
        <tbody>
          {listings.length > 0 ? (
            listings.map((store, index) => (
              <tr key={`lisiting-${store.store}-${index}`} className='text-center'>
                <td>{store.storeSku}</td>
                <td>
                  <img
                    loading='lazy'
                    src={store.channel ? store.channel : NoImageAdress}
                    alt='product Image'
                    style={{
                      width: '25px',
                      height: '25px',
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

export default Listings_Kit_Details
