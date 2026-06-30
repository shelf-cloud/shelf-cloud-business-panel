import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <InputGroup>/<InputGroupText> compatibility wrappers.
 *
 * Faithful to the Bootstrap layout (a horizontal row whose children join with
 * shared borders) rather than shadcn's addon-based input-group, so existing
 * `<InputGroup><InputGroupText/><Input/></InputGroup>` markup works by import
 * swap. The inner controls keep their own styling; corners are flattened
 * between adjacent children.
 */
export type InputGroupProps = React.ComponentProps<'div'> & {
  size?: string
  tag?: React.ElementType
}

function InputGroup({ className, size: _size, tag, ...props }: InputGroupProps) {
  const Comp: React.ElementType = tag ?? 'div'
  return (
    <Comp
      data-slot='input-group'
      role='group'
      className={cn(
        'tw:flex tw:w-full tw:items-stretch',
        'tw:[&>*:not(:first-child)]:rounded-l-none tw:[&>*:not(:last-child)]:rounded-r-none tw:[&>*:not(:first-child)]:-ml-px',
        className
      )}
      {...props}
    />
  )
}

export type InputGroupTextProps = React.ComponentProps<'span'> & {
  tag?: React.ElementType
}

function InputGroupText({ className, tag, ...props }: InputGroupTextProps) {
  const Comp: React.ElementType = tag ?? 'span'
  return (
    <Comp
      data-slot='input-group-text'
      className={cn('tw:inline-flex tw:items-center tw:rounded-md tw:border tw:border-input-border tw:bg-muted tw:px-3 tw:text-sm tw:text-muted-foreground', className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupText }
