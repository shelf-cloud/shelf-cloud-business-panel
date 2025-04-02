/* eslint-disable react-hooks/exhaustive-deps */
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'
import React, { useEffect, useRef, useState } from 'react'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle, Input, Label } from 'reactstrap'

export type FBAFiltersType = {
  status: SelectOptionType
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

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterFBAShipmentsContainer.current) {
          if (!FilterFBAShipmentsContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret className='fs-7' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
          <div className={'px-4 py-3'}>
            <div className='d-flex flex-column justify-content-start gap-2'>
              <span className='fs-7 fw-normal'>Filter By Status:</span>
              <SimpleSelect
                selected={filters.status}
                handleSelect={(option) => {
                  setfilters((prev: FBAFiltersType) => ({ ...prev, status: option }))
                  setOpenDatesMenu(false)
                }}
                options={[{ value: 'all', label: 'All' }, ...STATUSOPTIONS]}
              />
              <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                <Label className='fw-normal fs-7 w-75'>Show Only Missing Qty</Label>
                <Input
                  className='form-check-input code-switcher'
                  type='checkbox'
                  id='showOnlyOverdue'
                  name='showOnlyOverdue'
                  checked={filters.showOnlyMissingQty}
                  onChange={(e) => setfilters((prev: FBAFiltersType) => ({ ...prev, showOnlyMissingQty: e.target.checked }))}
                />
              </div>
              <span
                style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                onClick={() => {
                  setfilters(() => ({
                    status: { value: 'all', label: 'All' },
                    showOnlyMissingQty: false,
                  }))
                  setOpenDatesMenu(false)
                }}
                className='text-muted mt-2 fs-7'>
                Clear All
              </span>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default FilterFBAShipments
