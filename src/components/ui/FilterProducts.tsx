/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'

type Props = {
  brands: string[]
  suppliers: string[]
  categories: string[]
  brand: string
  supplier: string
  category: string
  condition: string
  activeTab: boolean
}

const FilterProducts = ({ brands, suppliers, categories, brand, supplier, category, condition, activeTab }: Props) => {
  const router = useRouter()
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterProductsContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterProductsContainer.current) {
          if (!FilterProductsContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
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
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
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
                activeTab
                  ? router.replace(`/Products?brand=${option?.value}&supplier=${supplier}&category=${category}&condition=${condition}`)
                  : router.replace(`/InactiveProducts?brand=${option?.value}&supplier=${supplier}&category=${category}&condition=${condition}`)
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
                activeTab
                  ? router.replace(`/Products?brand=${brand}&supplier=${option?.value}&category=${category}&condition=${condition}`)
                  : router.replace(`/InactiveProducts?brand=${brand}&supplier=${option?.value}&category=${category}&condition=${condition}`)
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
                activeTab
                  ? router.replace(`/Products?brand=${brand}&supplier=${supplier}&category=${option?.value}&condition=${condition}`)
                  : router.replace(`/InactiveProducts?brand=${brand}&supplier=${supplier}&category=${option?.value}&condition=${condition}`)
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
                activeTab
                  ? router.replace(`/Products?brand=${brand}&supplier=${supplier}&category=${category}&condition=${option?.value}`)
                  : router.replace(`/InactiveProducts?brand=${brand}&supplier=${supplier}&category=${category}&condition=${option?.value}`)
              }}
              customStyle='sm'
              placeholder={'Select Condition'}
            />
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                activeTab
                  ? router.replace(`/Products?brand=All&supplier=All&category=All&condition=All`)
                  : router.replace(`/InactiveProducts?brand=All&supplier=All&category=All&condition=All`)
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
