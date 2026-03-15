'use client'

import type { ComponentProps, HTMLAttributes } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback } from '@shadcn/ui/avatar'
import { Button } from '@shadcn/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shadcn/ui/collapsible'
import { CheckIcon, CopyIcon, FileIcon, GitCommitIcon, MinusIcon, PlusIcon } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

/* eslint-disable react-hooks/set-state-in-effect */

export type CommitProps = ComponentProps<typeof Collapsible>

export const Commit = ({ className, children, ...props }: CommitProps) => (
  <Collapsible className={cn('tw:rounded-lg tw:border tw:bg-background', className)} {...props}>
    {children}
  </Collapsible>
)

export type CommitHeaderProps = ComponentProps<typeof CollapsibleTrigger>

export const CommitHeader = ({ className, children, ...props }: CommitHeaderProps) => (
  <CollapsibleTrigger asChild {...props}>
    <div className={cn('tw:group tw:flex tw:cursor-pointer tw:items-center tw:justify-between tw:gap-4 tw:p-3 tw:text-left tw:transition-colors tw:hover:opacity-80', className)}>
      {children}
    </div>
  </CollapsibleTrigger>
)

export type CommitHashProps = HTMLAttributes<HTMLSpanElement>

export const CommitHash = ({ className, children, ...props }: CommitHashProps) => (
  <span className={cn('tw:font-mono tw:text-xs', className)} {...props}>
    <GitCommitIcon className='tw:mr-1 tw:inline-block tw:size-3' />
    {children}
  </span>
)

export type CommitMessageProps = HTMLAttributes<HTMLSpanElement>

export const CommitMessage = ({ className, children, ...props }: CommitMessageProps) => (
  <span className={cn('tw:font-medium tw:text-sm', className)} {...props}>
    {children}
  </span>
)

export type CommitMetadataProps = HTMLAttributes<HTMLDivElement>

export const CommitMetadata = ({ className, children, ...props }: CommitMetadataProps) => (
  <div className={cn('tw:flex tw:items-center tw:gap-2 tw:text-muted-foreground tw:text-xs', className)} {...props}>
    {children}
  </div>
)

export type CommitSeparatorProps = HTMLAttributes<HTMLSpanElement>

export const CommitSeparator = ({ className, children, ...props }: CommitSeparatorProps) => (
  <span className={className} {...props}>
    {children ?? '•'}
  </span>
)

export type CommitInfoProps = HTMLAttributes<HTMLDivElement>

export const CommitInfo = ({ className, children, ...props }: CommitInfoProps) => (
  <div className={cn('tw:flex tw:flex-1 tw:flex-col', className)} {...props}>
    {children}
  </div>
)

export type CommitAuthorProps = HTMLAttributes<HTMLDivElement>

export const CommitAuthor = ({ className, children, ...props }: CommitAuthorProps) => (
  <div className={cn('tw:flex tw:items-center', className)} {...props}>
    {children}
  </div>
)

export type CommitAuthorAvatarProps = ComponentProps<typeof Avatar> & {
  initials: string
}

export const CommitAuthorAvatar = ({ initials, className, ...props }: CommitAuthorAvatarProps) => (
  <Avatar className={cn('tw:size-8', className)} {...props}>
    <AvatarFallback className='tw:text-xs'>{initials}</AvatarFallback>
  </Avatar>
)

export type CommitTimestampProps = HTMLAttributes<HTMLTimeElement> & {
  date: Date
}

const relativeTimeFormat = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
})

const formatRelativeDate = (date: Date) => {
  const days = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return relativeTimeFormat.format(days, 'day')
}

export const CommitTimestamp = ({ date, className, children, ...props }: CommitTimestampProps) => {
  const [formatted, setFormatted] = useState('')

  const updateFormatted = useCallback(() => {
    setFormatted(formatRelativeDate(date))
  }, [date])

  useEffect(() => {
    updateFormatted()
  }, [updateFormatted])

  return (
    <time className={cn('tw:text-xs', className)} dateTime={date.toISOString()} {...props}>
      {children ?? formatted}
    </time>
  )
}

export type CommitActionsProps = HTMLAttributes<HTMLDivElement>

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation()
const handleActionsKeyDown = (e: React.KeyboardEvent) => e.stopPropagation()

export const CommitActions = ({ className, children, ...props }: CommitActionsProps) => (
  <div className={cn('tw:flex tw:items-center tw:gap-1', className)} onClick={handleActionsClick} onKeyDown={handleActionsKeyDown} role='group' {...props}>
    {children}
  </div>
)

export type CommitCopyButtonProps = ComponentProps<typeof Button> & {
  hash: string
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export const CommitCopyButton = ({ hash, onCopy, onError, timeout = 2000, children, className, ...props }: CommitCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number>(0)

  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'))
      return
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(hash)
        setIsCopied(true)
        onCopy?.()
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }, [hash, onCopy, onError, timeout, isCopied])

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current)
    },
    []
  )

  const Icon = isCopied ? CheckIcon : CopyIcon

  return (
    <Button className={cn('tw:size-7 tw:shrink-0', className)} onClick={copyToClipboard} size='icon' variant='ghost' {...props}>
      {children ?? <Icon size={14} />}
    </Button>
  )
}

export type CommitContentProps = ComponentProps<typeof CollapsibleContent>

export const CommitContent = ({ className, children, ...props }: CommitContentProps) => (
  <CollapsibleContent className={cn('tw:border-t tw:p-3', className)} {...props}>
    {children}
  </CollapsibleContent>
)

export type CommitFilesProps = HTMLAttributes<HTMLDivElement>

export const CommitFiles = ({ className, children, ...props }: CommitFilesProps) => (
  <div className={cn('tw:space-y-1', className)} {...props}>
    {children}
  </div>
)

export type CommitFileProps = HTMLAttributes<HTMLDivElement>

export const CommitFile = ({ className, children, ...props }: CommitFileProps) => (
  <div className={cn('tw:flex tw:items-center tw:justify-between tw:gap-2 tw:rounded tw:px-2 tw:py-1 tw:text-sm tw:hover:bg-muted/50', className)} {...props}>
    {children}
  </div>
)

export type CommitFileInfoProps = HTMLAttributes<HTMLDivElement>

export const CommitFileInfo = ({ className, children, ...props }: CommitFileInfoProps) => (
  <div className={cn('tw:flex tw:min-w-0 tw:items-center tw:gap-2', className)} {...props}>
    {children}
  </div>
)

const fileStatusStyles = {
  added: 'text-green-600 dark:text-green-400',
  deleted: 'text-red-600 dark:text-red-400',
  modified: 'text-yellow-600 dark:text-yellow-400',
  renamed: 'text-blue-600 dark:text-blue-400',
}

const fileStatusLabels = {
  added: 'A',
  deleted: 'D',
  modified: 'M',
  renamed: 'R',
}

export type CommitFileStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: 'added' | 'modified' | 'deleted' | 'renamed'
}

export const CommitFileStatus = ({ status, className, children, ...props }: CommitFileStatusProps) => (
  <span className={cn('tw:font-medium tw:font-mono tw:text-xs', fileStatusStyles[status], className)} {...props}>
    {children ?? fileStatusLabels[status]}
  </span>
)

export type CommitFileIconProps = ComponentProps<typeof FileIcon>

export const CommitFileIcon = ({ className, ...props }: CommitFileIconProps) => (
  <FileIcon className={cn('tw:size-3.5 tw:shrink-0 tw:text-muted-foreground', className)} {...props} />
)

export type CommitFilePathProps = HTMLAttributes<HTMLSpanElement>

export const CommitFilePath = ({ className, children, ...props }: CommitFilePathProps) => (
  <span className={cn('tw:truncate tw:font-mono tw:text-xs', className)} {...props}>
    {children}
  </span>
)

export type CommitFileChangesProps = HTMLAttributes<HTMLDivElement>

export const CommitFileChanges = ({ className, children, ...props }: CommitFileChangesProps) => (
  <div className={cn('tw:flex tw:shrink-0 tw:items-center tw:gap-1 tw:font-mono tw:text-xs', className)} {...props}>
    {children}
  </div>
)

export type CommitFileAdditionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number
}

export const CommitFileAdditions = ({ count, className, children, ...props }: CommitFileAdditionsProps) => {
  if (count <= 0) {
    return null
  }

  return (
    <span className={cn('tw:text-green-600 tw:dark:text-green-400', className)} {...props}>
      {children ?? (
        <>
          <PlusIcon className='tw:inline-block tw:size-3' />
          {count}
        </>
      )}
    </span>
  )
}

export type CommitFileDeletionsProps = HTMLAttributes<HTMLSpanElement> & {
  count: number
}

export const CommitFileDeletions = ({ count, className, children, ...props }: CommitFileDeletionsProps) => {
  if (count <= 0) {
    return null
  }

  return (
    <span className={cn('tw:text-red-600 tw:dark:text-red-400', className)} {...props}>
      {children ?? (
        <>
          <MinusIcon className='tw:inline-block tw:size-3' />
          {count}
        </>
      )}
    </span>
  )
}
