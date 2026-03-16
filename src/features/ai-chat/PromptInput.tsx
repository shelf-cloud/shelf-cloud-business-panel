import { FormEvent, KeyboardEvent } from 'react'

import { SendHorizonal, StopCircleIcon } from 'lucide-react'

import { Button } from '@/components/shadcn/ui/button'
import { Textarea } from '@/components/shadcn/ui/textarea'

type Props = {
  value: string
  disabled: boolean
  isStreaming: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
}

const PromptInput = ({ value, disabled, isStreaming, onChange, onSubmit, onStop }: Props) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className='tw:space-y-2'>
      <div className='tw:flex tw:items-end tw:gap-2'>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          className='tw:min-h-14 tw:h-auto tw:flex-1 tw:resize-none tw:rounded-2xl tw:border-border/80'
          placeholder='Ask why this forecast was produced, what assumptions mattered most, or test a hypothetical scenario.'
          aria-label='Forecast chat prompt'
        />
        <div className='tw:flex tw:shrink-0 tw:items-center tw:gap-2'>
          {isStreaming && (
            <Button size={'icon'} className='tw:rounded-full!' type='button' variant='outline' onClick={onStop}>
              <StopCircleIcon className='tw:size-5' />
            </Button>
          )}
          <Button size={'icon'} className='tw:rounded-full!' type='submit' disabled={disabled || value.trim().length === 0}>
            <SendHorizonal className='tw:size-5' />
          </Button>
        </div>
      </div>
      <p className='tw:m-0! tw:text-xs tw:text-muted-foreground'>Press Enter to send. Use Shift+Enter for a new line.</p>
    </form>
  )
}

export default PromptInput
