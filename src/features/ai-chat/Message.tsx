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
    <div className={cn('flex min-w-0 gap-2', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant && (
        <div className='mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary'>
          <BotMessageSquare className='size-4' />
        </div>
      )}
      <div
        className={cn(
          'min-w-0 max-w-[88%] overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm select-text',
          isAssistant ? 'border border-border bg-background text-foreground' : 'bg-primary text-primary-foreground'
        )}>
        <div
          className={cn(
            'min-w-0 max-w-full whitespace-pre-wrap break-words text-xs! select-text [overflow-wrap:anywhere]',
            '[&_*]:max-w-full [&_a]:break-all [&_code]:whitespace-pre-wrap [&_code]:break-words [&_li]:pl-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
          )}
          dangerouslySetInnerHTML={{ __html: snarkdown(text) }}
        />
        <div className='mt-0 flex justify-end select-none'>
          <CopyTextToClipboard
            text={text}
            label='message'
            className={cn('text-xs! transition-opacity opacity-70 hover:opacity-100', isAssistant ? 'text-muted-foreground' : 'text-primary-foreground!')}
            title='Copy message'
          />
        </div>
      </div>
      {!isAssistant && (
        <div className='mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground'>
          <UserRound className='size-4' />
        </div>
      )}
    </div>
  )
}

export default Message
