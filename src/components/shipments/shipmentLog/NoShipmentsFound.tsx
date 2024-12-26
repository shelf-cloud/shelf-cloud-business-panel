import React from 'react'

type Props = {}

const NoShipmentsFound = ({}: Props) => {
  return (
    <div className=''>
      <div className=' text-center py-5'>
        <div className='d-flex justify-content-center mb-3'>
          <div className='bg-light rounded-circle px-3 py-2 text-center'>
            <i className='ri-inbox-line text-primary fs-1' />
          </div>
        </div>
        <h3 className='card-title'>No shipments found</h3>
        {/* <p className='card-text text-muted'>There are no active shipments at the moment.</p> */}
      </div>
    </div>
  )
}

export default NoShipmentsFound
