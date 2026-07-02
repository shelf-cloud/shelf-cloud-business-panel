 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { Input } from '@/components/migration-ui'

type Props = {
  searchStatus: string
  setSearchStatus: (searchValue: string) => void
  searchReason: string
  setSearchReason: (searchValue: string) => void
}

const FilterUnsellables = ({ searchStatus, setSearchStatus, searchReason, setSearchReason }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  useClickOutside(filterByOthersContainer, () => setOpenDatesMenu(false))

  return (
    <div
      ref={filterByOthersContainer}
      className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
      <div className='tw:relative'>
        <button
          className='tw:inline-flex tw:h-9 tw:items-center tw:gap-2 tw:rounded-md tw:border tw:border-[#E1E3E5] tw:bg-white tw:px-3 tw:text-sm tw:font-semibold tw:text-foreground tw:whitespace-nowrap'
          type='button'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'tw:absolute tw:z-10 tw:mt-1 tw:min-w-[16rem] tw:end-0 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow tw:px-6 tw:py-4 ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
          <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
            <span className='tw:font-semibold tw:text-[11.2px]'>Status:</span>
            <div
              className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:ps-1 tw:pe-0 tw:py-0 tw:rounded'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='tw:border-0 tw:text-[11.2px] tw:w-full'
                id='type'
                name='type'
                value={searchStatus}
                onChange={(e) => {
                  setSearchStatus(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Status</option>
                <option value='unsellable'>Unsellable</option>
                <option value='converted'>Converted Sellable</option>
                <option value='dispose'>Dispose</option>
              </Input>
            </div>
            <span className='tw:font-semibold tw:text-[11.2px]'>Reason:</span>
            <div
              className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:ps-1 tw:pe-0 tw:py-0 tw:rounded'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='tw:border-0 tw:text-[11.2px] tw:w-full'
                id='type'
                name='type'
                value={searchReason}
                onChange={(e) => {
                  setSearchReason(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Reasons</option>
                <option value='Damaged'>Damaged</option>
                <option value='Wrong Address'>Wrong Address</option>
                <option value='Missing Information'>Missing Information</option>
                <option value='Return'>Return</option>
                <option value='Undeliverable'>Undeliverable</option>
                <option value='Other'>Other</option>
              </Input>
            </div>
            <button
              type='button'
              style={{ width: '100%', textAlign: 'right' }}
              onClick={() => {
                // setSearchType('')
                setSearchStatus('')
                setSearchReason('')
                setOpenDatesMenu(false)
              }}
              className='tw:p-0 tw:border-0 tw:no-underline tw:text-inherit tw:font-normal tw:text-[11.2px] tw:mt-2 tw:bg-transparent'>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterUnsellables
