/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'reactstrap'

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
            <span className='fw-semibold'>Brand:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={brand}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  activeTab ? router.replace(`/Products?brand=${e.target.value}&supplier=${supplier}&category=${category}&condition=${condition}`) : router.replace(`/InactiveProducts?brand=${e.target.value}&supplier=${supplier}&category=${category}&condition=${condition}`)
                }}>
                <option value='All'>All</option>
                {brands?.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Input>
            </div>
            <span className='fw-semibold'>Suppliers:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={supplier}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  activeTab ? router.replace(`/Products?brand=${brand}&supplier=${e.target.value}&category=${category}&condition=${condition}`) : router.replace(`/InactiveProducts?brand=${brand}&supplier=${e.target.value}&category=${category}&condition=${condition}`)
                }}>
                <option value='All'>All</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </Input>
            </div>
            <span className='fw-semibold'>Categories:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={category}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  activeTab ? router.replace(`/Products?brand=${brand}&supplier=${supplier}&category=${e.target.value}&condition=${condition}`) : router.replace(`/InactiveProducts?brand=${brand}&supplier=${supplier}&category=${e.target.value}&condition=${condition}`)
                }}>
                <option value='All'>All</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Input>
            </div>
            <span className='fw-semibold'>Condition:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={condition}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  activeTab ? router.replace(`/Products?brand=${brand}&supplier=${supplier}&category=${category}&condition=${e.target.value}`) : router.replace(`/InactiveProducts?brand=${brand}&supplier=${supplier}&category=${category}&condition=${e.target.value}`)
                }}>
                <option value='All'>All</option>
                <option value='New'>New</option>
                <option value='Used'>Used</option>
              </Input>
            </div>
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                activeTab ? router.replace(`/Products?brand=All&supplier=All&category=All&condition=All`) : router.replace(`/InactiveProducts?brand=All&supplier=All&category=All&condition=All`)
                setOpenDatesMenu(false)
              }}
              className='fw-normal mt-2'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterProducts
