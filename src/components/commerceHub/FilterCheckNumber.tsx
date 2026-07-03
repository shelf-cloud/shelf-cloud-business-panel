 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { NativeSelect } from '@shadcn/ui/native-select'

type Props = {
  type: string
  setInvoiceType: (type: string) => void
}

const FilterCheckNumber = ({ type, setInvoiceType }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterCheckNumberContainer = useRef<HTMLDivElement | null>(null)

  useClickOutside(FilterCheckNumberContainer, () => setOpenDatesMenu(false))

  return (
    <div
      ref={FilterCheckNumberContainer}
      className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <div className='relative'>
        <button
          className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'
          type='button'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'absolute z-10 min-w-[280px] mt-1 bg-white border border-[#E1E3E5] rounded-md shadow px-6 py-4 ' + (openDatesMenu ? 'block' : 'hidden')}>
          <div className='flex flex-col justify-start gap-2'>
            <span className='font-semibold'>Type:</span>
            <div
              className='flex flex-row items-center justify-between gap-2 w-auto px-4 py-0 rounded-lg'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <NativeSelect
                className='border-0 text-[13px] w-full'
                id='type'
                name='type'
                value={type}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  setInvoiceType(e.target.value)
                }}>
                <option value='all'>All</option>
                <option value='invoices'>Invoice</option>
                <option value='deductions'>Deductions</option>
              </NativeSelect>
            </div>
            <button
              type='button'
              style={{ width: '100%', textAlign: 'right' }}
              onClick={() => {
                setInvoiceType('all')
                setOpenDatesMenu(false)
              }}
              className='btn btn-link p-0 border-0 no-underline text-[var(--bs-secondary-color)] mt-2 text-[11.2px]'>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterCheckNumber
