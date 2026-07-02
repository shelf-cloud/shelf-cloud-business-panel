import { MutableRefObject } from 'react'

import { UIMessage } from 'ai'

import { ScrollArea } from '@/components/shadcn/ui/scroll-area'

import Message from './Message'
import ResponseLoading from './ResponseLoading'

type Props = {
  messages: UIMessage[]
  isStreaming: boolean
  bottomRef: MutableRefObject<HTMLDivElement | null>
}

const Conversation = ({ messages, isStreaming, bottomRef }: Props) => {
  return (
    <ScrollArea
      className='min-h-36 min-w-0 max-h-full flex-1 overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-sm!'
      style={{ scrollbarWidth: 'thin' }}>
      <div className='flex min-w-0 flex-col gap-3 p-2 select-text'>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isStreaming && (
          <div className='rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3'>
            <ResponseLoading />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

export default Conversation
