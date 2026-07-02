 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { Input } from '@/components/migration-ui'

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
      className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
      <div className='dropdown'>
        <button
          className='btn btn-light dropdown-toggle'
          style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
          type='button'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'dropdown-menu dropdown-menu-md tw:px-6 tw:py-4' + (openDatesMenu ? ' show' : '')}>
          <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
            <span className='tw:font-semibold'>Type:</span>
            <div
              className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:px-4 tw:py-0 tw:rounded-lg'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 tw:text-[13px] tw:w-full'
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
              </Input>
            </div>
            <button
              type='button'
              style={{ width: '100%', textAlign: 'right' }}
              onClick={() => {
                setInvoiceType('all')
                setOpenDatesMenu(false)
              }}
              className='btn btn-link tw:p-0 border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:mt-2 tw:text-[11.2px]'>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterCheckNumber
