/* eslint-disable @next/next/no-img-element */
import { Listings } from '@typings'
import React from 'react'

type Props = {
  listings: Listings[]
}

const Listings_Kit_Details = ({ listings }: Props) => {
  return (
    <div className='py-1 w-100'>
      <table className='table table-sm'>
        <thead>
          <tr className='text-center'>
            <th>Store SKU</th>
            <th>Channel</th>
            <th>Store</th>
          </tr>
        </thead>
        <tbody>
          {listings.length > 0 ? (
            listings.map((store) => (
              <tr key={store.store} className='text-center'>
                <td>{store.storeSku}</td>
                <td>
                  <img
                    loading='lazy'
                    src={
                      store.channel
                        ? store.channel
                        : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                    }
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
            <tr>
              <td>No Listings Mapped</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Listings_Kit_Details
