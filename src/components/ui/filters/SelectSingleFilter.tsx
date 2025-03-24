import React from 'react'
import { FormGroup, Label } from 'reactstrap'
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'

type Props = {
  inputLabel: string
  inputName: string
  placeholder: string
  selected: SelectOptionType
  options: SelectOptionType[]
  handleSelect: (option: SelectOptionType) => void
  error?: boolean
}

const SelectSingleFilter = ({ inputLabel, inputName, placeholder, options, selected, handleSelect }: Props) => {
  return (
    <FormGroup id={inputName} className='createOrder_inputs'>
      <Label htmlFor='lastNameinput' className='form-label'>
        {inputLabel}
      </Label>
      <SimpleSelect selected={selected} options={options} handleSelect={handleSelect} customStyle='sm' placeholder={placeholder} />
    </FormGroup>
  )
}

export default SelectSingleFilter
