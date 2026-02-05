 
import { useEffect, useMemo, useRef, useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

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

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByOthersContainer.current) {
          if (!filterByOthersContainer.current.contains(e.target)) {
            setOpenFilters(false)
          }
        }
      })
    }
  }, [])

  return (
    <>
      <ButtonGroup>
        <Dropdown isOpen={isFiltersOpen} toggle={() => setOpenFilters(!isFiltersOpen)}>
          <DropdownToggle caret className='fs-7' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className={'px-4 py-3'}>
              <div className='d-flex flex-column justify-content-start gap-2'>
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

                <span
                  style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                  onClick={() => {
                    setSearchStatus({ value: '', label: 'All' })
                    setSearchWarehouse({ value: '', label: 'All' })
                    setOpenFilters(false)
                  }}
                  className='text-muted mt-2 fs-7'>
                  Clear All
                </span>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </>
  )
}

export default FilterReceivings
