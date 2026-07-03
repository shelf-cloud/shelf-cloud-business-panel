 
import { useMemo, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { ChevronDownIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

type Props = {
  searchStatus: SelectSingleValueType
  setSearchStatus: (selectedOption: SelectSingleValueType) => void
  searchWarehouse: SelectSingleValueType
  setSearchWarehouse: (selectedOption: SelectSingleValueType) => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'received', label: 'Received' },
]

const FilterReceivings = ({ searchStatus, setSearchStatus, searchWarehouse, setSearchWarehouse }: Props) => {
  const { warehouses } = useWarehouses()
  const [isFiltersOpen, setOpenFilters] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  const warehousesOptions = useMemo(
    () => warehouses.filter((warehouse) => warehouse.isActive && !warehouse.id3PL).map((warehouse) => ({ value: warehouse.warehouseId, label: warehouse.name })),
    [warehouses]
  )

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
            <div className='px-6 py-4'>
              <div className='flex flex-col justify-start gap-2'>
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
                  inputLabel='Warehouse'
                  inputName='warehouse-filter'
                  placeholder='All'
                  selected={searchWarehouse}
                  handleSelect={(option) => {
                    setSearchWarehouse(option)
                    setOpenFilters(false)
                  }}
                  options={warehousesOptions}
                />

                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    setSearchStatus({ value: '', label: 'All' })
                    setSearchWarehouse({ value: '', label: 'All' })
                    setOpenFilters(false)
                  }}
                  className='p-0 border-0 no-underline text-[color:var(--bs-secondary-color)] mt-2 text-[11.2px]'>
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

export default FilterReceivings
