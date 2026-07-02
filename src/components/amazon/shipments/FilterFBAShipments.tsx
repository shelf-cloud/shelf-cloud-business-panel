import { useRef, useState } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import { useClickOutside } from '@hooks/useClickOutside'

import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle, Label, Switch } from '@/components/migration-ui'

export type FBAFiltersType = {
  status: SelectSingleValueType
  showOnlyMissingQty: boolean
}

type Props = {
  filters: FBAFiltersType
  setfilters: (cb: (prev: FBAFiltersType) => FBAFiltersType) => void
}

const STATUSOPTIONS = [
  // { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'CHECKED_IN', label: 'Checked in' },
  { value: 'CLOSED', label: 'Closed' },
  // { value: 'DELETED', label: 'Deleted' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  // { value: 'MIXED', label: 'Mixed' },
  { value: 'READY_TO_SHIP', label: 'Ready to ship' },
  { value: 'RECEIVING', label: 'Receiving' },
  { value: 'SHIPPED', label: 'Shipped' },
  // { value: 'UNCONFIRMED', label: 'Unconfirmed' },
  { value: 'WORKING', label: 'Working' },
]

const FilterFBAShipments = ({ filters, setfilters }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterFBAShipmentsContainer = useRef<HTMLDivElement | null>(null)

  useClickOutside(FilterFBAShipmentsContainer, () => setOpenDatesMenu(false))

  return (
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret className='text-[11.2px]' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
          <div className={'px-6 py-4'}>
            <div className='flex flex-col justify-start gap-2'>
              <span className='text-[11.2px] font-normal'>Filter By Status:</span>
              <SimpleSelect
                selected={filters.status}
                handleSelect={(option) => {
                  setfilters((prev: FBAFiltersType) => ({ ...prev, status: option }))
                  setOpenDatesMenu(false)
                }}
                options={[{ value: 'all', label: 'All' }, ...STATUSOPTIONS]}
              />
              <div className='form-check form-switch form-switch-right form-switch-sm flex flex-row justify-start items-end'>
                <Label className='font-normal text-[11.2px] w-3/4'>Show Only Missing Qty</Label>
                <Switch
                  id='showOnlyOverdue'
                  name='showOnlyOverdue'
                  checked={filters.showOnlyMissingQty}
                  onChange={(e) => setfilters((prev: FBAFiltersType) => ({ ...prev, showOnlyMissingQty: e.target.checked }))}
                />
              </div>
              <button
                type='button'
                style={{ width: '100%', textAlign: 'right' }}
                onClick={() => {
                  setfilters(() => ({
                    status: { value: 'all', label: 'All' },
                    showOnlyMissingQty: false,
                  }))
                  setOpenDatesMenu(false)
                }}
                className='p-0 border-0 no-underline text-[var(--bs-secondary-color)] mt-2 text-[11.2px]'>
                Clear All
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default FilterFBAShipments
