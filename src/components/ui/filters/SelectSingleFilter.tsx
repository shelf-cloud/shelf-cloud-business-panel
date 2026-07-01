import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'

import { Label } from '@/components/migration-ui'

import ErrorInputLabel from '../forms/ErrorInputLabel'

type Props = {
  inputLabel: string
  inputName: string
  placeholder: string
  selected: SelectSingleValueType
  options: SelectOptionType[]
  handleSelect: (option: SelectSingleValueType) => void
  error?: string | undefined
}

const SelectSingleFilter = ({ inputLabel, inputName, placeholder, options, selected, handleSelect, error }: Props) => {
  return (
    <div id={`select-container-${inputName}`} className='tw:mb-2'>
      <Label htmlFor={inputLabel} className='tw:mb-2 tw:inline-block tw:text-sm'>
        {inputLabel}
      </Label>
      <SimpleSelect selected={selected} options={options} handleSelect={handleSelect} customStyle='sm' placeholder={placeholder} hasError={Boolean(error)} />
      <ErrorInputLabel error={error} />
    </div>
  )
}

export default SelectSingleFilter
