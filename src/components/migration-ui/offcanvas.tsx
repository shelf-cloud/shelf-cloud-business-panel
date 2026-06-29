import * as React from 'react'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@shadcn/ui/sheet'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Offcanvas> family compatibility wrappers, rendering
 * shadcn Sheet internally. Keeps the reactstrap API:
 *   <Offcanvas isOpen toggle direction> <OffcanvasHeader toggle> <OffcanvasBody>
 *
 * reactstrap `direction` maps to Sheet `side`: end->right, start->left.
 */
const directionToSide: Record<string, 'top' | 'right' | 'bottom' | 'left'> = {
  start: 'left',
  end: 'right',
  top: 'top',
  bottom: 'bottom',
}

export type OffcanvasProps = {
  isOpen?: boolean
  toggle?: () => void
  direction?: 'start' | 'end' | 'top' | 'bottom'
  className?: string
  id?: string
  children?: React.ReactNode
}

function Offcanvas({ isOpen, toggle, direction = 'end', className, id, children }: OffcanvasProps) {
  return (
    <Sheet
      open={!!isOpen}
      onOpenChange={(open) => {
        if (!open) toggle?.()
      }}>
      <SheetContent
        id={id}
        side={directionToSide[direction] ?? 'right'}
        aria-describedby={undefined}
        className={cn('tw:overflow-y-auto tw:sm:max-w-md', className)}>
        {children}
      </SheetContent>
    </Sheet>
  )
}

export type OffcanvasSectionProps = React.ComponentProps<'div'> & {
  toggle?: () => void
  tag?: React.ElementType
}

function OffcanvasHeader({ children, className, toggle: _toggle, tag: _tag, ...props }: OffcanvasSectionProps) {
  return (
    <SheetHeader className={cn('tw:pr-10', className)} {...props}>
      <SheetTitle>{children}</SheetTitle>
    </SheetHeader>
  )
}

function OffcanvasBody({ className, toggle: _toggle, tag: _tag, ...props }: OffcanvasSectionProps) {
  return <div data-slot='offcanvas-body' className={cn('tw:px-4 tw:pb-4', className)} {...props} />
}

export { Offcanvas, OffcanvasHeader, OffcanvasBody }
