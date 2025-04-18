import React from 'react'
import { Label } from 'reactstrap'
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'
import ErrorInputLabel from '../forms/ErrorInputLabel'

type Props = {
  inputLabel: string
  inputName: string
  placeholder: string
  selected: SelectOptionType
  options: SelectOptionType[]
  handleSelect: (option: SelectOptionType) => void
  error?: string | undefined
}

const SelectSingleFilter = ({ inputLabel, inputName, placeholder, options, selected, handleSelect, error }: Props) => {
  return (
    <div id={`select-container-${inputName}`} className='mb-2'>
      <Label htmlFor={inputLabel} className='form-label'>
        {inputLabel}
      </Label>
      <SimpleSelect selected={selected} options={options} handleSelect={handleSelect} customStyle='sm' placeholder={placeholder} hasError={Boolean(error)}/>
      <ErrorInputLabel error={error} />
    </div>
  )
}

export default SelectSingleFilter
