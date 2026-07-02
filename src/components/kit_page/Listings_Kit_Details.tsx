/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { Listings } from '@typings'

type Props = {
  listings: Listings[]
}

const Listings_Kit_Details = ({ listings }: Props) => {
  return (
    <div className='py-1 px-3 w-full'>
      <table className='w-full text-[11.2px]'>
        <thead>
          <tr key={'listing-header'} className='text-left'>
            <th className='px-2 py-1'>Store SKU</th>
            <th className='px-2 py-1'>Channel</th>
            <th className='px-2 py-1'>Store</th>
          </tr>
        </thead>
        <tbody>
          {listings.length > 0 ? (
            listings.map((store, index) => (
              <tr key={`lisiting-${store.store}-${index}`} className='text-left border-t border-[color:var(--border)]'>
                <td className='px-2 py-1'>{store.storeSku}</td>
                <td className='px-2 py-1'>
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
                <td className='px-2 py-1'>{store.store}</td>
              </tr>
            ))
          ) : (
            <tr key={'no-listings'}>
              <td className='px-2 py-1'>No Listings Mapped</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Listings_Kit_Details
