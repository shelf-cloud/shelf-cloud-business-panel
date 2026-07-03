
import { useState } from 'react'

import { ChevronDownIcon } from 'lucide-react'

import { NativeSelect } from '@shadcn/ui/native-select'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@shadcn/ui/dropdown-menu'

type Props = {
  orderStatus: string
  setOrderStatus: (orderStatus: string) => void
}

const FilterFBAOrders = ({ orderStatus, setOrderStatus }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)

  return (
    <div className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <div role='group' className='inline-flex'>
        <DropdownMenu open={openDatesMenu} onOpenChange={(open) => { if (open !== openDatesMenu) setOpenDatesMenu(!openDatesMenu) }}>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'>
              Filters
              <ChevronDownIcon className='ml-1 size-4' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className='px-4 py-3'>
              <div className='flex flex-col justify-start gap-2'>
                <span className='font-semibold'>Order Status:</span>
                <div
                  className='flex flex-row items-center justify-between gap-2 w-auto px-3 py-0 rounded-md'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <NativeSelect
                    className='border-0 text-[13px] w-full'
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
                  </NativeSelect>
                </div>
                {/* <span className='fw-semibold'>Mapped:</span>
                <div
                  className='flex flex-row items-center justify-between gap-2 w-auto px-3 py-0 rounded-[4.8px]'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <Input
                    type='select'
                    className='border-0 text-[13px] w-full'
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
                  className='p-0 border-0 bg-transparent no-underline text-muted-foreground mt-2 text-sm'>
                  Clear All
                </button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default FilterFBAOrders
