
import { useState } from 'react'

import { Input } from '@/components/migration-ui'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

type Props = {
  orderStatus: string
  setOrderStatus: (orderStatus: string) => void
}

const FilterFBAOrders = ({ orderStatus, setOrderStatus }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)

  return (
    <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
      <ButtonGroup>
        <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
          <DropdownToggle
            className='tw:inline-flex tw:h-9 tw:items-center tw:gap-2 tw:rounded-md tw:border tw:border-[#E1E3E5] tw:bg-white tw:px-3 tw:text-sm tw:font-semibold tw:text-foreground tw:whitespace-nowrap'
            color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className='tw:px-4 tw:py-3'>
              <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
                <span className='tw:font-semibold'>Order Status:</span>
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:px-3 tw:py-0 tw:rounded-md'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <Input
                    type='select'
                    className='tw:border-0 tw:text-[13px] tw:w-full'
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
                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    setOrderStatus('All')
                    setOpenDatesMenu(false)
                  }}
                  className='tw:p-0 tw:border-0 tw:bg-transparent tw:no-underline tw:text-[color:var(--bs-secondary-color)] tw:mt-2 tw:text-sm'>
                  Clear All
                </button>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </div>
  )
}

export default FilterFBAOrders
