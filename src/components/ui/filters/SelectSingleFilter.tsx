import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { Label } from 'reactstrap'

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
    <div id={`select-container-${inputName}`} className='mb-2'>
      <Label htmlFor={inputLabel} className='form-label'>
        {inputLabel}
      </Label>
      <SimpleSelect selected={selected} options={options} handleSelect={handleSelect} customStyle='sm' placeholder={placeholder} hasError={Boolean(error)} />
      <ErrorInputLabel error={error} />
    </div>
  )
}

export default SelectSingleFilter
