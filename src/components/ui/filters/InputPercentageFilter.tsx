import { FormFeedback, Input, InputGroup, InputGroupText } from 'reactstrap'

type Props = {
  inputName: string
  value: number | string
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

const InputPercentageFilter = ({ inputName, value, isInvalid, error, handleChange, handleBlur }: Props) => {
  return (
    <InputGroup size='sm'>
      <Input type='number' className='form-control fs-6 m-0' bsSize='sm' style={{ padding: '0.2rem 0.9rem' }} placeholder='Min' id={inputName} name={inputName} min={0} onChange={handleChange} onBlur={handleBlur} value={value} invalid={isInvalid} />
      <InputGroupText className='fs-5 py-0'>%</InputGroupText>
      {isInvalid ? <FormFeedback type='invalid'>{error}</FormFeedback> : null}
    </InputGroup>
  )
}

export default InputPercentageFilter
