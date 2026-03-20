import { UIMessage } from 'ai'
import { BotMessageSquare, UserRound } from 'lucide-react'

import CopyTextToClipboard from '@/components/ui/CopyTextToClipboard'
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
          'tw:max-w-[88%] tw:rounded-2xl tw:px-4 tw:py-3 tw:text-sm tw:leading-6 tw:shadow-sm tw:select-text',
          isAssistant ? 'tw:border tw:border-border tw:bg-background tw:text-foreground' : 'tw:bg-primary tw:text-primary-foreground'
        )}>
        <p className='tw:m-0 tw:whitespace-pre-wrap tw:wrap-break-word tw:text-xs! tw:select-text'>{text}</p>
        <div className='tw:mt-2 tw:flex tw:justify-end tw:select-none'>
          <CopyTextToClipboard
            text={text}
            label='message'
            className={cn('tw:text-xs! tw:transition-opacity tw:opacity-70 hover:tw:opacity-100', isAssistant ? 'tw:text-muted-foreground' : 'tw:text-primary-foreground!')}
            title='Copy message'
          />
        </div>
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
