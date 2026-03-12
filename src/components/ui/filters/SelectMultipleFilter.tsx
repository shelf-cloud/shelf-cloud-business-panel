import { FormGroup, Label } from 'reactstrap'

import SelectMultipleDropDown, { SelectMultipleOptions } from '../SelectMultipleDropDown'

type Props = {
  inputLabel: string
  inputName: string
  value: string
  selectionInfo: SelectMultipleOptions
  selected: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const SelectMultipleFilter = ({ inputLabel, inputName, value, selectionInfo, selected, handleSelection }: Props) => {
  return (
    <FormGroup id={inputName} className='createOrder_inputs'>
      <Label htmlFor='lastNameinput' className='form-label'>
        {inputLabel}
      </Label>
      <SelectMultipleDropDown formValue={value} selectionInfo={selectionInfo} selected={selected} handleSelection={handleSelection} />
    </FormGroup>
  )
}

export default SelectMultipleFilter
