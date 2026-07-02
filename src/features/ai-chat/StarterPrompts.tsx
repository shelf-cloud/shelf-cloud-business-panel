import { Sparkles } from 'lucide-react'

import { Button } from '@/components/shadcn/ui/button'

type Props = {
  prompts: string[]
  disabled: boolean
  onSelect: (prompt: string) => void
}

const StarterPrompts = ({ prompts, disabled, onSelect }: Props) => {
  return (
    <div className='flex w-full min-w-0 flex-col gap-2 text-xs!'>
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant='outline'
          size='sm'
          disabled={disabled}
          className='h-auto w-full justify-start gap-2 overflow-hidden rounded-2xl! px-3 py-2 text-left whitespace-normal shadow-sm!'
          onClick={() => onSelect(prompt)}>
          <Sparkles className='size-3.5 shrink-0' />
          {prompt}
        </Button>
      ))}
    </div>
  )
}

export default StarterPrompts
