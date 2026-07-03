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
        'flex w-full items-stretch',
        '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px',
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
      className={cn('inline-flex items-center rounded-md border border-input-border bg-muted px-3 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupText }
