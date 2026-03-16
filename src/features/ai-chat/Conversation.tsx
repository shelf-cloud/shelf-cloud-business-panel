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
      className='tw:min-h-36 tw:max-h-full tw:flex-1 tw:rounded-2xl tw:border tw:border-border tw:bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] tw:shadow-sm!'
      style={{ scrollbarWidth: 'thin' }}>
      <div className='tw:flex tw:flex-col tw:gap-3 tw:p-2'>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isStreaming && (
          <div className='tw:rounded-2xl tw:border tw:border-dashed tw:border-primary/20 tw:bg-primary/5 tw:px-4 tw:py-3'>
            <ResponseLoading />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

export default Conversation
