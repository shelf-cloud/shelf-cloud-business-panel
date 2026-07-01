import React from 'react'

import { DebounceInput } from 'react-debounce-input'

type Props = {
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  background: keyof typeof BACKGROUND_COLORS
  minLength?: number
  debounceTimeout?: number
  placeholder?: string
  widths?: string
}

const BACKGROUND_COLORS = {
  none: '#f3f3f9',
  white: '#fff',
}

const SearchInput = ({ searchValue, setSearchValue, background, minLength = 1, debounceTimeout = 500, placeholder = 'Search...', widths = 'tw:w-full tw:md:w-1/3' }: Props) => {
  return (
    <div className={widths}>
      <div
        className='tw:w-full tw:h-9 tw:flex tw:flex-row tw:flex-nowrap tw:justify-around tw:items-center tw:rounded-[4.8px] tw:overflow-hidden'
        style={{ border: '1px solid #E1E3E5', backgroundColor: BACKGROUND_COLORS[background] }}>
        <span
          className='mdi mdi-magnify tw:text-lg tw:m-0 tw:ps-2 tw:pe-0 tw:py-0 tw:text-[color:var(--bs-secondary-color)]'
          style={{
            backgroundColor: BACKGROUND_COLORS[background],
          }}
        />
        <DebounceInput
          type='text'
          minLength={minLength}
          debounceTimeout={debounceTimeout}
          className='tw:h-full tw:w-full tw:border-0 tw:bg-transparent tw:text-sm tw:text-foreground tw:outline-none'
          style={{
            backgroundColor: BACKGROUND_COLORS[background],
          }}
          placeholder={placeholder}
          id='search-options'
          value={searchValue}
          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <span
          className='tw:flex tw:items-center tw:justify-center'
          style={{
            cursor: 'pointer',
            backgroundColor: BACKGROUND_COLORS[background],
          }}
          onClick={() => setSearchValue('')}>
          <i className='mdi mdi-window-close tw:text-lg tw:m-0 tw:px-2 tw:py-0 tw:text-[color:var(--bs-secondary-color)]' />
        </span>
      </div>
    </div>
  )
}

export default SearchInput
