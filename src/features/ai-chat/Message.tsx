import { UIMessage } from 'ai'
import { BotMessageSquare, UserRound } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

import { getMessageText } from './helpers'

type Props = {
  message: UIMessage
}

const Message = ({ message }: Props) => {
  const isAssistant = message.role === 'assistant'
  const text = getMessageText(message)

  if (!text.trim()) {
    return null
  }

  return (
    <div className={cn('tw:flex tw:gap-3', isAssistant ? 'tw:justify-start' : 'tw:justify-end')}>
      {isAssistant && (
        <div className='tw:mt-1 tw:flex tw:size-8 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-primary/20 tw:bg-primary/10 tw:text-primary'>
          <BotMessageSquare className='tw:size-4' />
        </div>
      )}
      <div
        className={cn(
          'tw:max-w-[88%] tw:rounded-2xl tw:px-4 tw:py-3 tw:text-sm tw:leading-6 tw:shadow-sm',
          isAssistant ? 'tw:border tw:border-border tw:bg-background tw:text-foreground' : 'tw:bg-primary tw:text-primary-foreground'
        )}>
        <p className='tw:m-0 tw:whitespace-pre-wrap tw:wrap-break-word tw:text-xs!'>{text}</p>
      </div>
      {!isAssistant && (
        <div className='tw:mt-1 tw:flex tw:size-8 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-border tw:bg-muted tw:text-muted-foreground'>
          <UserRound className='tw:size-4' />
        </div>
      )}
    </div>
  )
}

export default Message
