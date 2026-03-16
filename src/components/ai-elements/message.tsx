'use client'

import type { ComponentProps, HTMLAttributes, ReactElement } from 'react'
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Button } from '@shadcn/ui/button'
import { ButtonGroup, ButtonGroupText } from '@shadcn/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'
import type { UIMessage } from 'ai'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Streamdown } from 'streamdown'

import { cn } from '@/lib/shadcn/utils'

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
}

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn('tw:group tw:flex tw:w-full tw:max-w-[95%] tw:flex-col tw:gap-2', from === 'user' ? 'tw:is-user tw:ml-auto tw:justify-end' : 'tw:is-assistant', className)}
    {...props}
  />
)

export type MessageContentProps = HTMLAttributes<HTMLDivElement>

export const MessageContent = ({ children, className, ...props }: MessageContentProps) => (
  <div
    className={cn(
      'tw:is-user:dark tw:flex tw:w-fit tw:min-w-0 tw:max-w-full tw:flex-col tw:gap-2 tw:overflow-hidden tw:text-sm',
      'tw:group-[.is-user]:ml-auto tw:group-[.is-user]:rounded-lg tw:group-[.is-user]:bg-secondary tw:group-[.is-user]:px-4 tw:group-[.is-user]:py-3 tw:group-[.is-user]:text-foreground',
      'tw:group-[.is-assistant]:text-foreground',
      className
    )}
    {...props}>
    {children}
  </div>
)

export type MessageActionsProps = ComponentProps<'div'>

export const MessageActions = ({ className, children, ...props }: MessageActionsProps) => (
  <div className={cn('tw:flex tw:items-center tw:gap-1', className)} {...props}>
    {children}
  </div>
)

export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string
  label?: string
}

export const MessageAction = ({ tooltip, children, label, variant = 'ghost', size = 'sm', ...props }: MessageActionProps) => {
  const button = (
    <Button size={size} type='button' variant={variant} {...props}>
      {children}
      <span className='tw:sr-only'>{label || tooltip}</span>
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

interface MessageBranchContextType {
  currentBranch: number
  totalBranches: number
  goToPrevious: () => void
  goToNext: () => void
  branches: ReactElement[]
  setBranches: (branches: ReactElement[]) => void
}

const MessageBranchContext = createContext<MessageBranchContextType | null>(null)

const useMessageBranch = () => {
  const context = useContext(MessageBranchContext)

  if (!context) {
    throw new Error('MessageBranch components must be used within MessageBranch')
  }

  return context
}

export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number
  onBranchChange?: (branchIndex: number) => void
}

export const MessageBranch = ({ defaultBranch = 0, onBranchChange, className, ...props }: MessageBranchProps) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch)
  const [branches, setBranches] = useState<ReactElement[]>([])

  const handleBranchChange = useCallback(
    (newBranch: number) => {
      setCurrentBranch(newBranch)
      onBranchChange?.(newBranch)
    },
    [onBranchChange]
  )

  const goToPrevious = useCallback(() => {
    const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1
    handleBranchChange(newBranch)
  }, [currentBranch, branches.length, handleBranchChange])

  const goToNext = useCallback(() => {
    const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0
    handleBranchChange(newBranch)
  }, [currentBranch, branches.length, handleBranchChange])

  const contextValue = useMemo<MessageBranchContextType>(
    () => ({
      branches,
      currentBranch,
      goToNext,
      goToPrevious,
      setBranches,
      totalBranches: branches.length,
    }),
    [branches, currentBranch, goToNext, goToPrevious]
  )

  return (
    <MessageBranchContext.Provider value={contextValue}>
      <div className={cn('tw:grid tw:w-full tw:gap-2 tw:[&>div]:pb-0', className)} {...props} />
    </MessageBranchContext.Provider>
  )
}

export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>

export const MessageBranchContent = ({ children, ...props }: MessageBranchContentProps) => {
  const { currentBranch, setBranches, branches } = useMessageBranch()
  const childrenArray = useMemo(() => (Array.isArray(children) ? children : [children]), [children])

  // Use useEffect to update branches when they change
  useEffect(() => {
    if (branches.length !== childrenArray.length) {
      setBranches(childrenArray)
    }
  }, [childrenArray, branches, setBranches])

  return childrenArray.map((branch, index) => (
    <div className={cn('tw:grid tw:gap-2 tw:overflow-hidden tw:[&>div]:pb-0', index === currentBranch ? 'tw:block' : 'tw:hidden')} key={branch.key} {...props}>
      {branch}
    </div>
  ))
}

export type MessageBranchSelectorProps = ComponentProps<typeof ButtonGroup>

export const MessageBranchSelector = ({ className, ...props }: MessageBranchSelectorProps) => {
  const { totalBranches } = useMessageBranch()

  // Don't render if there's only one branch
  if (totalBranches <= 1) {
    return null
  }

  return <ButtonGroup className={cn('tw:[&>*:not(:first-child)]:rounded-l-md tw:[&>*:not(:last-child)]:rounded-r-md', className)} orientation='horizontal' {...props} />
}

export type MessageBranchPreviousProps = ComponentProps<typeof Button>

export const MessageBranchPrevious = ({ children, ...props }: MessageBranchPreviousProps) => {
  const { goToPrevious, totalBranches } = useMessageBranch()

  return (
    <Button aria-label='Previous branch' disabled={totalBranches <= 1} onClick={goToPrevious} size='sm' type='button' variant='ghost' {...props}>
      {children ?? <ChevronLeftIcon size={14} />}
    </Button>
  )
}

export type MessageBranchNextProps = ComponentProps<typeof Button>

export const MessageBranchNext = ({ children, ...props }: MessageBranchNextProps) => {
  const { goToNext, totalBranches } = useMessageBranch()

  return (
    <Button aria-label='Next branch' disabled={totalBranches <= 1} onClick={goToNext} size='sm' type='button' variant='ghost' {...props}>
      {children ?? <ChevronRightIcon size={14} />}
    </Button>
  )
}

export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>

export const MessageBranchPage = ({ className, ...props }: MessageBranchPageProps) => {
  const { currentBranch, totalBranches } = useMessageBranch()

  return (
    <ButtonGroupText className={cn('tw:border-none tw:bg-transparent tw:text-muted-foreground tw:shadow-none', className)} {...props}>
      {currentBranch + 1} of {totalBranches}
    </ButtonGroupText>
  )
}

export type MessageResponseProps = ComponentProps<typeof Streamdown>

const streamdownPlugins = { cjk, code, math, mermaid }

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown className={cn('tw:size-full tw:[&>*:first-child]:mt-0 tw:[&>*:last-child]:mb-0', className)} plugins={streamdownPlugins} {...props} />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating
)

MessageResponse.displayName = 'MessageResponse'

export type MessageToolbarProps = ComponentProps<'div'>

export const MessageToolbar = ({ className, children, ...props }: MessageToolbarProps) => (
  <div className={cn('tw:mt-4 tw:flex tw:w-full tw:items-center tw:justify-between tw:gap-4', className)} {...props}>
    {children}
  </div>
)
