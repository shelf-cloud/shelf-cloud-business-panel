/* eslint-disable react-hooks/exhaustive-deps */
import SimpleSelect from '@components/Common/SimpleSelect'
import { CommerceHubStore } from '@typesTs/commercehub/invoices'
import React, { useEffect, useRef, useState } from 'react'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle, Input, Label } from 'reactstrap'

type Filters = {
  onlyOverdue: boolean
  store: { value: string; label: string }
}

type Props = {
  filters: Filters
  stores: CommerceHubStore[]
  setfilters: (cb: (prev: Filters) => Filters) => void
}

const FilterCommerceHubInvoices = ({ filters, setfilters, stores }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterCommerceHubInvoicesContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterCommerceHubInvoicesContainer.current) {
          if (!FilterCommerceHubInvoicesContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '230px', border: '1px solid #E1E3E5' }}>
          <div className={'px-4 py-3'}>
            <div className='d-flex flex-column justify-content-start gap-2'>
              <span className='fs-7 fw-normal'>Filter By Store:</span>
              <SimpleSelect
                selected={filters.store}
                handleSelect={(option) => {
                  setfilters((prev: Filters) => ({ ...prev, store: option }))
                  setOpenDatesMenu(false)
                }}
                options={[{ value: 'all', label: 'All' }, ...stores]}
              />
              <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                <Label className='fw-normal fs-7 w-75'>Show Only Overdue</Label>
                <Input
                  className='form-check-input code-switcher'
                  type='checkbox'
                  id='showOnlyOverdue'
                  name='showOnlyOverdue'
                  checked={filters.onlyOverdue}
                  onChange={(e) => {
                    setfilters((prev: Filters) => ({ ...prev, onlyOverdue: e.target.checked }))
                    setOpenDatesMenu(false)
                  }}
                />
              </div>
              <span
                style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                onClick={() => {
                  setfilters(() => ({ onlyOverdue: false, store: { value: 'all', label: 'All' } }))
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

export default FilterCommerceHubInvoices
