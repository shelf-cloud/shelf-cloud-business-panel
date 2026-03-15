import { Sparkles } from 'lucide-react'

import { Button } from '@/components/shadcn/ui/button'

type Props = {
  prompts: string[]
  disabled: boolean
  onSelect: (prompt: string) => void
}

const StarterPrompts = ({ prompts, disabled, onSelect }: Props) => {
  return (
    <div className='tw:flex tw:w-full tw:min-w-0 tw:flex-col tw:gap-2 tw:text-xs'>
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant='outline'
          size='sm'
          disabled={disabled}
          className='tw:h-auto tw:w-full tw:justify-start tw:gap-2 tw:overflow-hidden tw:rounded-2xl tw:px-3 tw:py-3 tw:text-left tw:whitespace-normal tw:shadow-sm!'
          onClick={() => onSelect(prompt)}>
          <Sparkles className='tw:size-3.5 tw:shrink-0' />
          {prompt}
        </Button>
      ))}
    </div>
  )
}

export default StarterPrompts
