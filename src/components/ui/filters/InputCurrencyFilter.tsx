import React, { useContext } from 'react'

import AppContext from '@context/AppContext'

import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'

type Props = {
  inputName: string
  value: number
  isInvalid: boolean
  error?: string
  handleChange: {
    (e: React.ChangeEvent<any>): void
    <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any> ? void : (e: string | React.ChangeEvent<any>) => void
  }
  handleBlur: {
    (e: React.FocusEvent<any>): void
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void
  }
}

const InputCurrencyFilter = ({ inputName, value, isInvalid, handleChange, handleBlur }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <InputGroup size='sm'>
      <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
      <Input
        type='number'
        className='text-[13px] m-0 h-8 text-xs'
        style={{ padding: '0.2rem 0.9rem' }}
        placeholder='Min'
        id={inputName}
        name={inputName}
        min={0}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
        aria-invalid={isInvalid || undefined}
      />
    </InputGroup>
  )
}

export default InputCurrencyFilter
