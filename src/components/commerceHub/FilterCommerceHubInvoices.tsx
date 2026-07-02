import { useMemo, useRef, useState } from 'react'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { useClickOutside } from '@hooks/useClickOutside'
import { CommerceHubStore } from '@typesTs/commercehub/invoices'
import { DebounceInput } from 'react-debounce-input'

import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle, Label, Switch } from '@/components/migration-ui'

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

  useClickOutside(FilterCommerceHubInvoicesContainer, () => setOpenDatesMenu(false))

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
        <DropdownToggle caret className='tw:text-[11.2px]' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
          Filters
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
          <div className={'tw:px-6 tw:py-4'}>
            <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
              <span className='tw:text-[11.2px] tw:font-normal'>Filter By Store:</span>
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
                  <span className='tw:text-[11.2px] tw:font-normal'>Filter By Status:</span>
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
                  <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                    <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show Only Overdue</Label>
                    <Switch
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
                      <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4 tw:mb-0'>Days Overdue:</Label>
                      <DebounceInput
                        type='number'
                        minLength={1}
                        debounceTimeout={700}
                        className='form-control form-control-sm tw:text-[13px]'
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
              <button
                type='button'
                style={{ width: '100%', textAlign: 'right' }}
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
                className='btn btn-link tw:p-0 tw:border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:mt-2 tw:text-[11.2px]'>
                Clear All
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default FilterCommerceHubInvoices
