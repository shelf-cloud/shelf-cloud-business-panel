import React from 'react'

type Props = {
  onhand: number
  available: number
  reserved: number
  receiving: number
}

const Inventory_Product_Details = ({onhand, available, reserved, receiving}: Props) => {
  return (
    <div className='px-3 py-1 border-bottom w-100'>
      <p className='fs-4 text-primary fw-semibold'>Inventory</p>
      <table className='table table-sm'>
        <thead>
          <tr className='text-center'>
            <th>Warehouse</th>
            <th>On Hand</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Receiving</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className='fw-semibold'>ShelfCloud</td>
            <td>{onhand}</td>
            <td className='text-success'>{available}</td>
            <td className='text-danger'>{reserved}</td>
            <td>{receiving}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Inventory_Product_Details
