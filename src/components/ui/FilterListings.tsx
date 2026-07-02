
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Input } from '@/components/migration-ui'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

type Props = {
  showHidden: string
  condition: string
  mapped: string
}

const FilterListings = ({ showHidden, condition, mapped }: Props) => {
  const router = useRouter()
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
                <span className='tw:font-semibold'>Condition:</span>
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:px-3 tw:py-0 tw:rounded-md'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <Input
                    type='select'
                    className='tw:border-0 tw:text-[13px] tw:w-full'
                    id='type'
                    name='type'
                    value={condition}
                    onChange={(e) => {
                      setOpenDatesMenu(false)
                      router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=${e.target.value}&mapped=${mapped}`)
                    }}>
                    <option value='All'>All</option>
                    <option value='New'>New</option>
                    <option value='Used'>Used</option>
                  </Input>
                </div>
                <span className='tw:font-semibold'>Mapped:</span>
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:px-3 tw:py-0 tw:rounded-md'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <Input
                    type='select'
                    className='tw:border-0 tw:text-[13px] tw:w-full'
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
                </div>
                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=All&mapped=All`)
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

export default FilterListings
