import { UIMessage } from 'ai'
import { BotMessageSquare, UserRound } from 'lucide-react'
import snarkdown from 'snarkdown'

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
    <div className={cn('tw:flex tw:min-w-0 tw:gap-2', isAssistant ? 'tw:justify-start' : 'tw:justify-end')}>
      {isAssistant && (
        <div className='tw:mt-1 tw:flex tw:size-8 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:border tw:border-primary/20 tw:bg-primary/10 tw:text-primary'>
          <BotMessageSquare className='tw:size-4' />
        </div>
      )}
      <div
        className={cn(
          'tw:min-w-0 tw:max-w-[88%] tw:overflow-hidden tw:rounded-2xl tw:px-4 tw:py-3 tw:text-sm tw:leading-6 tw:shadow-sm tw:select-text',
          isAssistant ? 'tw:border tw:border-border tw:bg-background tw:text-foreground' : 'tw:bg-primary tw:text-primary-foreground'
        )}>
        <div
          className={cn(
            'tw:min-w-0 tw:max-w-full tw:whitespace-pre-wrap tw:break-words tw:text-xs! tw:select-text tw:[overflow-wrap:anywhere]',
            'tw:[&_*]:max-w-full tw:[&_a]:break-all tw:[&_code]:whitespace-pre-wrap tw:[&_code]:break-words tw:[&_li]:pl-1 tw:[&_ol]:my-2 tw:[&_ol]:list-decimal tw:[&_ol]:pl-5 tw:[&_p]:my-2 tw:[&_pre]:overflow-x-auto tw:[&_pre]:whitespace-pre-wrap tw:[&_ul]:my-2 tw:[&_ul]:list-disc tw:[&_ul]:pl-5'
          )}
          dangerouslySetInnerHTML={{ __html: snarkdown(text) }}
        />
        <div className='tw:mt-0 tw:flex tw:justify-end tw:select-none'>
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
