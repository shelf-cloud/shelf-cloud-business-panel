/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  selectionInfo: {
    storeId: string
    name: string
    logo: string
  }[]
  selected: {
    storeId: string
    name: string
    logo: string
  }
  handleSelection: ({ storeId, name, logo }: { storeId: string; name: string; logo: string }) => void
  showAllMarketsOption: boolean
}

const SelectMarketplaceDropDown = ({ selectionInfo, selected, handleSelection, showAllMarketsOption }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectMarketplace = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectMarketplace, () => setOpenDatesMenu(false))

  return (
    <div ref={selectMarketplace} className='tw:relative'>
      <button
        className='tw:inline-flex tw:h-9 tw:flex-row tw:justify-start tw:items-center tw:gap-2 tw:rounded-md tw:px-3'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        {selected.storeId === '9999' || selected.storeId === '' ? (
          <i className='las la-store-alt tw:text-[16.25px] tw:m-0 tw:p-0 tw:text-primary' />
        ) : (
          <span
            className='tw:inline-block tw:shrink-0'
            style={{
              width: '16px',
              height: '16px',
              margin: '0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={selected.logo ? selected.logo : NoImageAdress}
              onError={(e) => (e.currentTarget.src = NoImageAdress)}
              alt={selected.name ? `${selected.name} logo` : 'Marketplace logo'}
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </span>
        )}
        <span className='tw:font-semibold tw:m-0 tw:p-0 tw:text-[11.2px]'>{selected?.name}</span>
      </button>
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:py-3 tw:ps-3 tw:pe-1 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')} style={{ minWidth: '280px' }}>
        <div className='tw:w-full tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-2' style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
          {showAllMarketsOption && (
            <button
              type='button'
              key={'9999'}
              className='tw:p-0 tw:border-0 tw:bg-transparent tw:no-underline tw:text-inherit tw:flex tw:flex-row tw:justify-start tw:gap-2 tw:items-center'
              onClick={() => {
                handleSelection({ storeId: '9999', name: 'All Marketplaces', logo: '' })
                setOpenDatesMenu(false)
              }}>
              <i className='las la-store-alt tw:text-[19.5px] tw:m-0 tw:p-0 tw:text-primary' />
              <span className={'tw:m-0 tw:p-0 tw:text-nowrap ' + (selected.storeId === '9999' ? 'tw:font-semibold' : '')}>All Marketplaces</span>
            </button>
          )}
          {selectionInfo?.map((option) => (
            <button
              type='button'
              key={option.storeId}
              className='tw:p-0 tw:border-0 tw:bg-transparent tw:no-underline tw:text-inherit tw:flex tw:flex-row tw:justify-start tw:gap-2 tw:items-center tw:mb-1'
              onClick={() => {
                handleSelection({ storeId: option.storeId, name: option.name, logo: option.logo })
                setOpenDatesMenu(false)
              }}>
              {option.logo !== '' && (
                <span
                  className='tw:inline-block tw:shrink-0'
                  style={{
                    width: '20px',
                    height: '20px',
                    margin: '0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={option.logo ? option.logo : NoImageAdress}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt={option.name ? `${option.name} logo` : 'Marketplace logo'}
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </span>
              )}
              <span className={'tw:m-0 tw:p-0 tw:text-nowrap ' + (String(selected.storeId) === option.storeId ? 'tw:font-bold' : '')}>{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectMarketplaceDropDown
