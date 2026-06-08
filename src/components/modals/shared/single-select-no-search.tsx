import { Field, FieldLabel } from '@shadcn/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'

import { cn } from '@/lib/shadcn/utils'

type Props = {
  data: { value: string; label: string }[]
  label: string
  value: string
  onChange: (value: string) => void
  isFetching?: boolean
  isRequired?: boolean
  showLabel?: boolean
  className?: string
  triggerClassName?: string
}

const SingleSelectNoSearch = ({ data, label, value, onChange, isFetching, isRequired = true, showLabel = true, className, triggerClassName }: Props) => {
  return (
    <div className={cn('tw:w-full tw:max-w-sm', className)}>
      <Field className='tw:gap-1'>
        {showLabel && <FieldLabel className='tw:text-xs'>{label}</FieldLabel>}
        <Select name='single-select-no-search' disabled={isFetching ? true : false} defaultValue='' onValueChange={onChange} value={value}>
          <SelectTrigger className={cn(!value && isRequired && 'tw:border-2 tw:border-red-500/60', 'tw:w-full tw:md:min-w-[350px]', triggerClassName)}>
            <SelectValue placeholder='Choose an option' />
          </SelectTrigger>
          <SelectContent className='tw:z-[1060]'>
            {data.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <p className='tw:m-0'>{option.label}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

export default SingleSelectNoSearch
