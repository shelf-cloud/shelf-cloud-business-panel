/* eslint-disable @next/next/no-img-element */
import React from 'react'

type Props = {
  image?: string
  title?: string
  description?: string
  brand?: string
  category?: string
  manufacturer?: string
}

const General_Product_Details = ({ image, title, description, brand, category, manufacturer }: Props) => {
  return (
    <div className='px-4 pt-2 pb-4 border-bottom'>
      <p className='fs-4 text-primary fw-semibold'>General</p>
      <div className='w-full d-flex justify-content-start align-items-start gap-4'>
        <div
          style={{
            width: '30%',
            height: 'auto',
            margin: '2px 0px',
            position: 'relative',
            minWidth: '150px',
            maxWidth: '200px',
          }}>
          <img
            src={
              image
                ? image
                : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
            }
            alt='product Image'
            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
          />
        </div>
        <div className='w-100'>
          <table className='table table-sm table-borderless'>
            <body className='fs-5 bg-transparent'>
              <tr>
                <td className='fw-bolder'>Name</td>
                <td>{title}</td>
              </tr>
              <tr>
                <td className='fw-bolder'>Description</td>
                <td className={description ?? 'text-muted fw-light fst-italic'}>{description ?? 'No Description'}</td>
              </tr>
              <tr>
                <td className='fw-bolder'>Brand</td>
                <td className={brand ?? 'text-muted fw-light fst-italic'}>{brand ?? 'No Brand'}</td>
              </tr>
              <tr>
                <td className='fw-bolder'>Category</td>
                <td className={category ?? 'text-muted fw-light fst-italic'}>{category ?? 'No Category'}</td>
              </tr>
              <tr>
                <td className='fw-bolder'>Manufacturer</td>
                <td className={manufacturer ?? 'text-muted fw-light fst-italic'}>{manufacturer ?? 'No Manufacturer'}</td>
              </tr>
            </body>
          </table>
        </div>
      </div>
    </div>
  )
}

export default General_Product_Details
