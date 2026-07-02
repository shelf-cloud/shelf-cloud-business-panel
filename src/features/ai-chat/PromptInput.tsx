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
    <form onSubmit={handleSubmit} className='space-y-2'>
      <div className='flex items-end gap-2'>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          className='min-h-14 h-auto flex-1 resize-none rounded-2xl border-border/80'
          placeholder='Ask why this forecast was produced, what assumptions mattered most, or test a hypothetical scenario.'
          aria-label='Forecast chat prompt'
        />
        <div className='flex shrink-0 items-center gap-2'>
          {isStreaming && (
            <Button size={'icon'} className='rounded-full!' type='button' variant='outline' onClick={onStop}>
              <StopCircleIcon className='size-5' />
            </Button>
          )}
          <Button size={'icon'} className='rounded-full!' type='submit' disabled={disabled || value.trim().length === 0}>
            <SendHorizonal className='size-5' />
          </Button>
        </div>
      </div>
      <p className='m-0! text-xs text-muted-foreground'>Press Enter to send. Use Shift+Enter for a new line.</p>
    </form>
  )
}

export default PromptInput
