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
    <div className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <ButtonGroup>
        <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
          <DropdownToggle
            className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'
            color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className='px-4 py-3'>
              <div className='flex flex-col justify-start gap-2'>
                <span className='font-semibold text-[11.2px]'>Brand:</span>
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

                <span className='font-semibold text-[11.2px]'>Suppliers:</span>
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
                <span className='font-semibold text-[11.2px]'>Categories:</span>
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
                <span className='font-semibold text-[11.2px]'>Condition:</span>
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
                <span className='font-semibold text-[11.2px]'>Status:</span>
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
                  className='p-0 border-0 bg-transparent no-underline text-[color:var(--bs-secondary-color)] mt-2 text-sm'>
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
