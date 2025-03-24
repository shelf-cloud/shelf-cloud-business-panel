import React from 'react'
import { Input, Label } from 'reactstrap'

type Props = {
  inputLabel: string
  inputName: string
  value: boolean
  isInvalid: boolean
  error?: string
  handleChange: (value: boolean) => void
  handleBlur: {
    (e: React.FocusEvent<any>): void
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void
  }
}

const InputCheckFilter = ({ inputLabel, inputName, value, isInvalid, handleChange, handleBlur }: Props) => {
  return (
    <div className='form-check form-switch form-switch-right form-switch-md d-flex flex-row justify-content-start align-items-center'>
      <Label className='form-label'>{inputLabel}</Label>
      <Input
        className='form-check-input code-switcher'
        type='checkbox'
        id={inputName}
        name={inputName}
        checked={value}
        onChange={(e) => {
          handleChange(e.target.checked)
        }}
        onBlur={handleBlur}
        invalid={isInvalid}
      />
    </div>
  )
}

export default InputCheckFilter
