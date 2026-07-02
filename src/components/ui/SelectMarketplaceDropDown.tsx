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
    <div ref={selectMarketplace} className='relative'>
      <button
        className='inline-flex h-9 flex-row justify-start items-center gap-2 rounded-md px-3'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        {selected.storeId === '9999' || selected.storeId === '' ? (
          <i className='las la-store-alt text-[16.25px] m-0 p-0 text-primary' />
        ) : (
          <span
            className='inline-block shrink-0'
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
        <span className='font-semibold m-0 p-0 text-[11.2px]'>{selected?.name}</span>
      </button>
      <div className={'absolute z-10 mt-1 w-full py-3 ps-3 pe-1 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')} style={{ minWidth: '280px' }}>
        <div className='w-full flex flex-col justify-start items-start gap-2' style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
          {showAllMarketsOption && (
            <button
              type='button'
              key={'9999'}
              className='p-0 border-0 bg-transparent no-underline text-inherit flex flex-row justify-start gap-2 items-center'
              onClick={() => {
                handleSelection({ storeId: '9999', name: 'All Marketplaces', logo: '' })
                setOpenDatesMenu(false)
              }}>
              <i className='las la-store-alt text-[19.5px] m-0 p-0 text-primary' />
              <span className={'m-0 p-0 text-nowrap ' + (selected.storeId === '9999' ? 'font-semibold' : '')}>All Marketplaces</span>
            </button>
          )}
          {selectionInfo?.map((option) => (
            <button
              type='button'
              key={option.storeId}
              className='p-0 border-0 bg-transparent no-underline text-inherit flex flex-row justify-start gap-2 items-center mb-1'
              onClick={() => {
                handleSelection({ storeId: option.storeId, name: option.name, logo: option.logo })
                setOpenDatesMenu(false)
              }}>
              {option.logo !== '' && (
                <span
                  className='inline-block shrink-0'
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
              <span className={'m-0 p-0 text-nowrap ' + (String(selected.storeId) === option.storeId ? 'font-bold' : '')}>{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectMarketplaceDropDown
