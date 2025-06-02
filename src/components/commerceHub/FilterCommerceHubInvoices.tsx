/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { CommerceHubStore } from '@typesTs/commercehub/invoices'
import { DebounceInput } from 'react-debounce-input'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle, Input, Label } from 'reactstrap'

export type InvoiceCommerceHubFiltersType = {
  onlyOverdue: boolean
  showOverdue: boolean
  store: SelectSingleValueType
  status: SelectSingleValueType
  showStaus: boolean
}

type Props = {
  filters: InvoiceCommerceHubFiltersType
  setfilters: (cb: (prev: InvoiceCommerceHubFiltersType) => InvoiceCommerceHubFiltersType) => void
  stores: CommerceHubStore[]
  statusOptions?: SelectOptionType[]
  daysOverdue?: number
  setdaysOverdue?: (days: number) => void
}

const FilterCommerceHubInvoices = ({ filters, setfilters, stores, statusOptions, daysOverdue, setdaysOverdue }: Props) => {
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

  const handleDaysOverdueValue = useMemo(() => {
    if (daysOverdue === undefined || daysOverdue === 0) {
      if (filters.store!.value === 'all') return stores.reduce((max, store) => (store.payTerms > max ? store.payTerms : max), 0 as number)
      return stores.find((store) => store.value === filters.store!.value)?.payTerms || 0
    }
    return daysOverdue
  }, [daysOverdue, filters.store, stores])

  return (
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret className='fs-7' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
          <div className={'px-4 py-3'}>
            <div className='d-flex flex-column justify-content-start gap-2'>
              <span className='fs-7 fw-normal'>Filter By Store:</span>
              <SimpleSelect
                selected={filters.store}
                handleSelect={(option) => {
                  setfilters((prev: InvoiceCommerceHubFiltersType) => ({ ...prev, store: option }))
                  if (setdaysOverdue !== undefined) setdaysOverdue(0)
                  setOpenDatesMenu(false)
                }}
                options={[{ value: 'all', label: 'All' }, ...stores]}
              />
              {filters.showStaus && (
                <>
                  <span className='fs-7 fw-normal'>Filter By Status:</span>
                  <SimpleSelect
                    selected={filters.status}
                    handleSelect={(option) => {
                      setfilters((prev: InvoiceCommerceHubFiltersType) => ({ ...prev, status: option }))
                      setOpenDatesMenu(false)
                    }}
                    options={statusOptions ? [{ value: 'all', label: 'All' }, ...statusOptions] : []}
                  />
                </>
              )}
              {filters.showOverdue && (
                <>
                  <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                    <Label className='fw-normal fs-7 w-75'>Show Only Overdue</Label>
                    <Input
                      className='form-check-input code-switcher'
                      type='checkbox'
                      id='showOnlyOverdue'
                      name='showOnlyOverdue'
                      checked={filters.onlyOverdue}
                      onChange={(e) => {
                        setfilters((prev: InvoiceCommerceHubFiltersType) => ({ ...prev, onlyOverdue: e.target.checked }))
                        if (daysOverdue === undefined) {
                          setOpenDatesMenu(false)
                        }
                      }}
                    />
                  </div>
                  {filters.onlyOverdue && setdaysOverdue && (
                    <>
                      <Label className='fw-normal fs-7 w-75 mb-0'>Days Overdue:</Label>
                      <DebounceInput
                        type='number'
                        minLength={1}
                        debounceTimeout={700}
                        className='form-control form-control-sm fs-6'
                        placeholder='Days Overdue'
                        id='daysOverdue'
                        value={handleDaysOverdueValue}
                        onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                        onChange={(e) => setdaysOverdue(parseInt(e.target.value))}
                      />
                    </>
                  )}
                </>
              )}
              <span
                style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                onClick={() => {
                  setfilters(() => ({
                    onlyOverdue: false,
                    showOverdue: filters.showOverdue,
                    store: { value: 'all', label: 'All' },
                    status: { value: 'all', label: 'All' },
                    showStaus: true,
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

export default FilterCommerceHubInvoices
