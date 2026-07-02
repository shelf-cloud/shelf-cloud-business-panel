import { useEffect, useMemo, useRef, useState } from 'react'

export type SelectMultipleOption = {
  label: string
  icon: string
  color: string
}

export type SelectMultipleOptions = Record<string, SelectMultipleOption>

type Props = {
  formValue: string
  selectionInfo: SelectMultipleOptions
  selected?: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const parseSelectedValues = (selected?: string): string[] => {
  if (!selected) {
    return []
  }

  try {
    const parsedValue = JSON.parse(selected)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map((value) => String(value))
  } catch {
    return []
  }
}

const serializeSelectedValues = (values: string[]) => JSON.stringify(values.map((value) => (/^-?\d+$/.test(value) ? Number(value) : value)))

const SelectMultipleDropDown = ({ formValue, selectionInfo, selected, handleSelection }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectMultiple = useRef<HTMLDivElement | null>(null)

  const selectedParsed = useMemo(() => parseSelectedValues(selected), [selected])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectMultiple.current && !selectMultiple.current.contains(event.target as Node)) {
        setOpenDatesMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div ref={selectMultiple} className='tw:relative tw:mb-4'>
      <div
        className='tw:flex tw:w-full tw:items-center tw:p-0 tw:bg-transparent tw:rounded-md tw:border tw:border-[#E1E3E5]'
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='tw:flex-1 tw:px-3 tw:py-[0.3rem] tw:text-[13px] tw:text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selectedParsed.length === 0 ? (
            <span className='tw:text-[color:var(--bs-secondary-color)]'>Select</span>
          ) : (
            selectedParsed
              .map((value) => selectionInfo[value]?.label)
              .filter(Boolean)
              .join(', ')
          )}
        </span>
        <span className='tw:flex tw:items-center tw:justify-center tw:px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down tw:text-[16.25px]' />
          <span className='tw:sr-only'>Toggle Dropdown</span>
        </span>
      </div>
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:py-3 tw:px-4 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            {Object.entries(selectionInfo)?.map(([value, option]) => (
              <p
                key={value}
                className={'tw:m-0 tw:mb-2 ' + (selectedParsed.includes(value) ? 'tw:font-bold' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const newSelected = selectedParsed.includes(value) ? selectedParsed.filter((item) => item !== value) : [...selectedParsed, value]
                  handleSelection(formValue, serializeSelectedValues(newSelected))
                }}>
                {option.icon && <i className={`${option.icon} ${option.color}`} />}
                {`${option.label}`}
              </p>
            ))}
          </div>
          <p
            className='tw:mt-2 tw:mb-0 tw:text-[color:var(--bs-secondary-color)] tw:text-right'
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleSelection(formValue, '[]')
              setOpenDatesMenu(false)
            }}>
            Clear
          </p>
        </div>
      </div>
    </div>
  )
}

export default SelectMultipleDropDown
