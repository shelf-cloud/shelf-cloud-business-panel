import { Input } from 'reactstrap'

type Props = {
  inputName: string
  value: number | string
  isInvalid: boolean
  placeholder: string
  error?: string
  handleChange: {
    (e: React.ChangeEvent<any>): void
    <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any> ? void : (e: string | React.ChangeEvent<any>) => void
  }
  handleBlur: {
    (e: React.FocusEvent<any>): void
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void
  }
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
}

const InputNumberForm = ({ inputName, value, isInvalid, placeholder, handleChange, handleBlur, onFocus }: Props) => {
  return (
    <Input
      type='number'
      className='form-control form-control-sm fs-6 m-0'
      bsSize='sm'
      style={{ padding: '0.2rem 0.9rem' }}
      placeholder={placeholder}
      id={inputName}
      name={inputName}
      min={0}
      onChange={handleChange}
      onBlur={handleBlur}
      value={value}
      invalid={isInvalid}
      onFocus={onFocus}
    />
  )
}

export default InputNumberForm
