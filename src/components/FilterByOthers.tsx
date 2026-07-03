 
import { useContext, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import AppContext from '@context/AppContext'
import { useSkus } from '@hooks/products/useSkus'
import { ChevronDownIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

import { SelectSingleValueType } from './Common/SimpleSelect'
import SelectSingleFilter from './ui/filters/SelectSingleFilter'

type Props = {
  searchType: SelectSingleValueType
  setSearchType: (selectedOption: SelectSingleValueType) => void
  searchStatus: SelectSingleValueType
  setSearchStatus: (selectedOption: SelectSingleValueType) => void
  searchMarketplace: SelectSingleValueType
  setSearchMarketplace: (selectedOption: SelectSingleValueType) => void
  searchSku: SelectSingleValueType
  setSearchSku: (selectedOption: SelectSingleValueType) => void
  carrierStatus: SelectSingleValueType
  setcarrierStatus: (selectedOption: SelectSingleValueType) => void
}

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Wholesale', label: 'Wholesale' },
  { value: 'Shipment', label: 'Shipment' },
  { value: 'FBA Shipment', label: 'FBA Shipment' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'awaiting pickup', label: 'Awaiting Pickup' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CARRIER_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  // { value: 'Label created - Shipment Ready for UPS - Ready for pickup', label: 'Awaiting Pickup' },
  { value: 'Ready for', label: 'Awaiting Pickup' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delay', label: 'Delayed' },
  { value: 'damage', label: 'Damaged' },
]

const FilterByOthers = ({
  searchType,
  setSearchType,
  searchStatus,
  setSearchStatus,
  searchMarketplace,
  setSearchMarketplace,
  searchSku,
  setSearchSku,
  carrierStatus,
  setcarrierStatus,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const [isFiltersOpen, setOpenFilters] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)
  const { skus } = useSkus()

  useClickOutside(filterByOthersContainer, () => setOpenFilters(false))

  return (
    <>
      <div role='group' className='inline-flex'>
        <DropdownMenu open={isFiltersOpen} onOpenChange={(open) => { if (open !== isFiltersOpen) setOpenFilters(!isFiltersOpen) }}>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'>
              Filters
              <ChevronDownIcon className='ml-1 size-4' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className={'px-4 py-3'}>
              <div className='flex flex-col justify-start gap-2'>
                <SelectSingleFilter
                  inputLabel='Type'
                  inputName='type-filter'
                  placeholder='All'
                  selected={searchType}
                  handleSelect={(option) => {
                    setSearchType(option)
                    setOpenFilters(false)
                  }}
                  options={TYPE_OPTIONS}
                />

                <SelectSingleFilter
                  inputLabel='Status'
                  inputName='status-filter'
                  placeholder='All'
                  selected={searchStatus}
                  handleSelect={(option) => {
                    setSearchStatus(option)
                    setOpenFilters(false)
                  }}
                  options={STATUS_OPTIONS}
                />

                <SelectSingleFilter
                  inputLabel='Carrier Status'
                  inputName='carrier-status-filter'
                  placeholder='All'
                  selected={carrierStatus}
                  handleSelect={(option) => {
                    setcarrierStatus(option)
                    setOpenFilters(false)
                  }}
                  options={CARRIER_STATUS_OPTIONS}
                />

                <SelectSingleFilter
                  inputLabel='SKU'
                  inputName='sku-filter'
                  placeholder='All'
                  selected={searchSku}
                  handleSelect={(option) => {
                    setSearchSku(option)
                    setOpenFilters(false)
                  }}
                  options={skus.map((sku) => ({ value: sku.sku, label: sku.sku, description: sku.title }))}
                />

                {state?.user?.[`${state.currentRegion}`]?.marketplacesIds && (
                  <>
                    <SelectSingleFilter
                      inputLabel='Stores'
                      inputName='stores-filter'
                      placeholder='All'
                      selected={searchMarketplace}
                      handleSelect={(option) => {
                        setSearchMarketplace(option)
                        setOpenFilters(false)
                      }}
                      options={[
                        { value: '', label: 'All Stores' },
                        ...state?.user?.[`${state.currentRegion}`]?.marketplacesIds?.sort().map((market: any) => ({ value: market.value, label: market.label })),
                      ]}
                    />
                  </>
                )}

                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    setSearchType({ value: '', label: 'All' })
                    setSearchStatus({ value: '', label: 'All' })
                    setcarrierStatus({ value: '', label: 'All' })
                    setSearchSku({ value: '', label: 'All' })
                    setSearchMarketplace({ value: '', label: 'All Stores' })
                    setOpenFilters(false)
                  }}
                  className='p-0 border-0 bg-transparent no-underline text-[color:var(--bs-secondary-color)] mt-2 text-sm'>
                  Clear All
                </button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export default FilterByOthers
