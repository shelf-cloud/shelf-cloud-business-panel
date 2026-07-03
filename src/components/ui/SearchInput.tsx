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

const SearchInput = ({ searchValue, setSearchValue, background, minLength = 1, debounceTimeout = 500, placeholder = 'Search...', widths = 'w-full md:w-1/3' }: Props) => {
  return (
    <div className={widths}>
      <div
        className='w-full h-9 flex flex-row flex-nowrap justify-around items-center rounded-[4.8px] overflow-hidden'
        style={{ border: '1px solid #E1E3E5', backgroundColor: BACKGROUND_COLORS[background] }}>
        <span
          className='mdi mdi-magnify text-lg m-0 ps-2 pe-0 py-0 text-muted-foreground'
          style={{
            backgroundColor: BACKGROUND_COLORS[background],
          }}
        />
        <DebounceInput
          type='text'
          minLength={minLength}
          debounceTimeout={debounceTimeout}
          className='h-full w-full border-0 bg-transparent text-sm text-foreground outline-none'
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
          className='flex items-center justify-center'
          style={{
            cursor: 'pointer',
            backgroundColor: BACKGROUND_COLORS[background],
          }}
          onClick={() => setSearchValue('')}>
          <i className='mdi mdi-window-close text-lg m-0 px-2 py-0 text-muted-foreground' />
        </span>
      </div>
    </div>
  )
}

export default SearchInput
