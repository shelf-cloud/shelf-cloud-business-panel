/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'

import { Input } from 'reactstrap'

type Props = {
  orderStatus: string
  setOrderStatus: (orderStatus: string) => void
}

const FilterFBAOrders = ({ orderStatus, setOrderStatus }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterListingsContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterListingsContainer.current) {
          if (!FilterListingsContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div
      ref={FilterListingsContainer}
      className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
      <div className='dropdown'>
        <button
          className='btn btn-light dropdown-toggle'
          style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
          type='button'
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
          <div className='d-flex flex-column justify-content-start gap-2'>
            <span className='fw-semibold'>Order Status:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={orderStatus}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  setOrderStatus(e.target.value)
                }}>
                <option value='All'>All</option>
                <option value='Pending'>Pending</option>
                <option value='Shipped'>Shipped</option>
                <option value='Canceled'>Canceled</option>
                <option value='PartiallyShipped'>PartiallyShipped</option>
                <option value='Unfulfillable'>Unfulfillable</option>
                <option value='InvoiceUnconfirmed'>InvoiceUnconfirmed</option>
                <option value='PendingAvailability'>PendingAvailability</option>
              </Input>
            </div>
            {/* <span className='fw-semibold'>Mapped:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={mapped}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=${condition}&mapped=${e.target.value}`)
                }}>
                <option value='All'>All</option>
                <option value='Mapped'>Mapped</option>
                <option value='Not Mapped'>Not Mapped</option>
              </Input>
            </div> */}
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                setOrderStatus('All')
                setOpenDatesMenu(false)
              }}
              className='fw-normal mt-2'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterFBAOrders
