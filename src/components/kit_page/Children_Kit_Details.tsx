import { ChildrenPage } from '@typings'
import React from 'react'

type Props = {
  kitChildren: ChildrenPage[]
}

const Children_Kit_Details = ({ kitChildren }: Props) => {
  return (
    <div className='py-1 w-100'>
      <div>
        <table className='table table-sm table-borderless'>
          <thead>
            <tr>
              <th className='text-center'>Child SKU</th>
              <th className='text-start'>Title</th>
              <th className='text-center'>Kit Qty</th>
              <th className='text-center'>ShelfCloud Qty</th>
            </tr>
          </thead>
          <tbody>
            {kitChildren.map((child) => (
              <tr key={child.sku}>
                <td className='text-center'>{child.sku}</td>
                <td className='text-start'>{child.title}</td>
                <td className='text-center'>{child.qty}</td>
                <td className='text-center'>{child.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Children_Kit_Details
