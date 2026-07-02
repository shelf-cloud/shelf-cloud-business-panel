
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
    <div className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <ButtonGroup>
        <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
          <DropdownToggle
            className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'
            color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className='px-4 py-3'>
              <div className='flex flex-col justify-start gap-2'>
                <span className='font-semibold'>Condition:</span>
                <div
                  className='flex flex-row items-center justify-between gap-2 w-auto px-3 py-0 rounded-md'
                  style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
                  <Input
                    type='select'
                    className='border-0 text-[13px] w-full'
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
                <span className='font-semibold'>Mapped:</span>
                <div
                  className='flex flex-row items-center justify-between gap-2 w-auto px-3 py-0 rounded-md'
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
                </div>
                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=All&mapped=All`)
                    setOpenDatesMenu(false)
                  }}
                  className='p-0 border-0 bg-transparent no-underline text-[color:var(--bs-secondary-color)] mt-2 text-sm'>
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
