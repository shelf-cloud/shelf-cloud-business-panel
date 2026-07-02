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
        <DropdownToggle caret className='tw:text-[11.2px]' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
          <div className={'tw:px-6 tw:py-4'}>
            <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
              <span className='tw:text-[11.2px] tw:font-normal'>Filter By Status:</span>
              <SimpleSelect
                selected={filters.status}
                handleSelect={(option) => {
                  setfilters((prev: FBAFiltersType) => ({ ...prev, status: option }))
                  setOpenDatesMenu(false)
                }}
                options={[{ value: 'all', label: 'All' }, ...STATUSOPTIONS]}
              />
              <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show Only Missing Qty</Label>
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
                className='tw:p-0 tw:border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:mt-2 tw:text-[11.2px]'>
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
