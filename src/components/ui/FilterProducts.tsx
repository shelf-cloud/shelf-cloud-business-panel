import { useEffect, useRef, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import type { ProductStatusFilter } from '@hooks/products/productFilters'

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
  const FilterProductsContainer = useRef<HTMLDivElement | null>(null)

  const updateProductFilters = (nextFilters: Partial<ProductFilterQuery>) => {
    setProductFilters(nextFilters)
  }

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (FilterProductsContainer.current && !FilterProductsContainer.current.contains(event.target as Node)) {
        setOpenDatesMenu(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  return (
    <div
      ref={FilterProductsContainer}
      className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
      <div className='dropdown'>
        <button
          className='btn btn-light dropdown-toggle'
          style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
          type='button'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
          <div className='d-flex flex-column justify-content-start gap-2'>
            <span className='fw-semibold fs-7'>Brand:</span>
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

            <span className='fw-semibold fs-7'>Suppliers:</span>
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
            <span className='fw-semibold fs-7'>Categories:</span>
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
            <span className='fw-semibold fs-7'>Condition:</span>
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
            <span className='fw-semibold fs-7'>Status:</span>
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
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                setProductFilters({ brand: null, supplier: null, category: null, condition: null, status: null })
                setOpenDatesMenu(false)
              }}
              className='fw-normal mt-2 text-muted fs-7'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterProducts
