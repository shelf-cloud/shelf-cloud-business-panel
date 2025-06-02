/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react'

import AppContext from '@context/AppContext'
import { useSkus } from '@hooks/products/useSkus'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

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
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CARRIER_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  // { value: 'in_transit', label: 'In Transit' },
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

                <span
                  style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                  onClick={() => {
                    setSearchType({ value: '', label: 'All' })
                    setSearchStatus({ value: '', label: 'All' })
                    setSearchSku({ value: '', label: 'All' })
                    setSearchMarketplace({ value: '', label: 'All Stores' })
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

export default FilterByOthers
