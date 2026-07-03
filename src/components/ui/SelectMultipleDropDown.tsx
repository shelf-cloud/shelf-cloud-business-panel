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
    <div ref={selectMultiple} className='relative mb-4'>
      <div
        className='flex w-full items-center p-0 bg-transparent rounded-md border border-[#E1E3E5]'
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='flex-1 px-3 py-[0.3rem] text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selectedParsed.length === 0 ? (
            <span className='text-muted-foreground'>Select</span>
          ) : (
            selectedParsed
              .map((value) => selectionInfo[value]?.label)
              .filter(Boolean)
              .join(', ')
          )}
        </span>
        <span className='flex items-center justify-center px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down text-[16.25px]' />
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </div>
      <div className={'absolute z-10 mt-1 w-full py-3 px-4 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            {Object.entries(selectionInfo)?.map(([value, option]) => (
              <p
                key={value}
                className={'m-0 mb-2 ' + (selectedParsed.includes(value) ? 'font-bold' : '')}
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
            className='mt-2 mb-0 text-muted-foreground text-right'
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
