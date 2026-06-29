import * as React from 'react'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Modal> family compatibility wrappers, rendering shadcn
 * Dialog internally. Keeps the reactstrap controlled API:
 *   <Modal isOpen toggle size> <ModalHeader toggle> <ModalBody> <ModalFooter>
 *
 * reactstrap `toggle` maps to Radix `onOpenChange` (close-only). The shadcn
 * DialogContent renders its own close (X), so ModalHeader's `toggle` X is
 * dropped. `aria-describedby={undefined}` silences Radix's missing-description
 * warning for modals that have no description.
 */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | string

const sizeClass: Record<string, string> = {
  sm: 'tw:sm:!max-w-sm',
  md: 'tw:sm:!max-w-lg',
  lg: 'tw:sm:!max-w-3xl',
  xl: 'tw:sm:!max-w-5xl',
}

export type ModalProps = {
  isOpen?: boolean
  toggle?: () => void
  size?: ModalSize
  centered?: boolean
  scrollable?: boolean
  fade?: boolean
  backdrop?: boolean | 'static'
  keyboard?: boolean
  className?: string
  id?: string
  children?: React.ReactNode
}

function Modal({ isOpen, toggle, size = 'md', scrollable: _scrollable, fade: _fade, centered: _centered, backdrop, keyboard, className, id, children }: ModalProps) {
  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={(open) => {
        if (!open) toggle?.()
      }}>
      <DialogContent
        id={id}
        aria-describedby={undefined}
        className={cn('tw:max-h-[90vh] tw:overflow-y-auto', sizeClass[size] ?? sizeClass.md, className)}
        onInteractOutside={backdrop === 'static' ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={keyboard === false ? (e) => e.preventDefault() : undefined}>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export type ModalSectionProps = React.ComponentProps<'div'> & {
  toggle?: () => void
  tag?: React.ElementType
}

function ModalHeader({ children, className, toggle: _toggle, tag: _tag, ...props }: ModalSectionProps) {
  return (
    <DialogHeader className={cn('tw:pr-6', className)} {...props}>
      <DialogTitle>{children}</DialogTitle>
    </DialogHeader>
  )
}

function ModalBody({ className, toggle: _toggle, tag: _tag, ...props }: ModalSectionProps) {
  return <div data-slot='modal-body' className={cn(className)} {...props} />
}

function ModalFooter({ className, toggle: _toggle, tag: _tag, ...props }: ModalSectionProps) {
  return <DialogFooter className={cn('tw:items-center', className)} {...props} />
}

export { Modal, ModalHeader, ModalBody, ModalFooter }
