import { useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import type { ProductStatusFilter } from '@hooks/products/productFilters'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

type ProductFilterQuery = {
  brand: string
  supplier: string
  category: string
  condition: string
  status: ProductStatusFilter
}

type SetProductFilters = (nextFilters: Partial<{ [Key in keyof ProductFilterQuery]: ProductFilterQuery[Key] | null }>) => void | Promise<URLSearchParams>

type Props = {
  brands: string[]
  suppliers: string[]
  categories: string[]
  brand: string
  supplier: string
  category: string
  condition: string
  status: ProductStatusFilter
  setProductFilters: SetProductFilters
}

const FilterProducts = ({ brands, suppliers, categories, brand, supplier, category, condition, status, setProductFilters }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)

  const updateProductFilters = (nextFilters: Partial<ProductFilterQuery>) => {
    setProductFilters(nextFilters)
  }

  return (
    <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
      <ButtonGroup>
        <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
          <DropdownToggle
            className='tw:inline-flex tw:h-9 tw:items-center tw:gap-2 tw:rounded-md tw:border tw:border-[#E1E3E5] tw:bg-white tw:px-3 tw:text-sm tw:font-semibold tw:text-foreground tw:whitespace-nowrap'
            color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className='tw:px-4 tw:py-3'>
              <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
                <span className='tw:font-semibold tw:text-[11.2px]'>Brand:</span>
                <SimpleSelect
                  selected={{ label: brand, value: brand }}
                  options={[{ label: 'All', value: 'All' }, ...brands?.map((brand) => ({ label: brand, value: brand }))]}
                  handleSelect={(option) => {
                    setOpenDatesMenu(false)
                    updateProductFilters({ brand: String(option?.value || 'All') })
                  }}
                  customStyle='sm'
                  placeholder={'Select Brand'}
                />

                <span className='tw:font-semibold tw:text-[11.2px]'>Suppliers:</span>
                <SimpleSelect
                  selected={{ label: supplier, value: supplier }}
                  options={[{ label: 'All', value: 'All' }, ...suppliers?.map((supplier) => ({ label: supplier, value: supplier }))]}
                  handleSelect={(option) => {
                    setOpenDatesMenu(false)
                    updateProductFilters({ supplier: String(option?.value || 'All') })
                  }}
                  customStyle='sm'
                  placeholder={'Select Supplier'}
                />
                <span className='tw:font-semibold tw:text-[11.2px]'>Categories:</span>
                <SimpleSelect
                  selected={{ label: category, value: category }}
                  options={[{ label: 'All', value: 'All' }, ...categories?.map((category) => ({ label: category, value: category }))]}
                  handleSelect={(option) => {
                    setOpenDatesMenu(false)
                    updateProductFilters({ category: String(option?.value || 'All') })
                  }}
                  customStyle='sm'
                  placeholder={'Select Category'}
                />
                <span className='tw:font-semibold tw:text-[11.2px]'>Condition:</span>
                <SimpleSelect
                  selected={{ label: condition, value: condition }}
                  options={[
                    { label: 'All', value: 'All' },
                    { label: 'New', value: 'New' },
                    { label: 'Used', value: 'Used' },
                  ]}
                  handleSelect={(option) => {
                    setOpenDatesMenu(false)
                    updateProductFilters({ condition: String(option?.value || 'All') })
                  }}
                  customStyle='sm'
                  placeholder={'Select Condition'}
                />
                <span className='tw:font-semibold tw:text-[11.2px]'>Status:</span>
                <SimpleSelect
                  selected={{ label: status, value: status }}
                  options={[
                    { label: 'All', value: 'All' },
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' },
                  ]}
                  handleSelect={(option) => {
                    setOpenDatesMenu(false)
                    updateProductFilters({ status: (option?.value || 'All') as ProductStatusFilter })
                  }}
                  customStyle='sm'
                  placeholder={'Select Status'}
                />
                <button
                  type='button'
                  style={{ width: '100%', textAlign: 'right' }}
                  onClick={() => {
                    setProductFilters({ brand: null, supplier: null, category: null, condition: null, status: null })
                    setOpenDatesMenu(false)
                  }}
                  className='tw:p-0 tw:border-0 tw:bg-transparent tw:no-underline tw:text-[color:var(--bs-secondary-color)] tw:mt-2 tw:text-sm'>
                  Clear All
                </button>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </div>
  )
}

export default FilterProducts
