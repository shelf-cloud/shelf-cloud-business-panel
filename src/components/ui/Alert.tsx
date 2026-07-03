import * as React from 'react'

import { XIcon } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Alert> compatibility wrapper.
 *
 * Keeps the reactstrap surface: `color`, `isOpen` (default true), `toggle`
 * (dismissible), `fade`, `className`. Colors map to token-based tints so alerts
 * match the theme without Bootstrap.
 */
const colorClass: Record<string, string> = {
  primary: 'border-primary/30 bg-primary/10 text-primary',
  secondary: 'border-border bg-muted text-foreground',
  success: 'border-success/30 bg-success/10 text-success',
  info: 'border-info/30 bg-info/10 text-info',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
  light: 'border-border bg-light text-foreground',
  dark: 'border-dark/30 bg-dark/10 text-dark',
}

export type AlertProps = Omit<React.ComponentProps<'div'>, 'color'> & {
  color?: string
  isOpen?: boolean
  toggle?: () => void
  fade?: boolean
  tag?: React.ElementType
}

function Alert({ color = 'primary', isOpen = true, toggle, fade: _fade, className, children, tag, ...props }: AlertProps) {
  if (!isOpen) return null
  const Comp: React.ElementType = tag ?? 'div'
  return (
    <Comp role='alert' className={cn('relative w-full rounded-lg border px-4 py-3 text-sm', colorClass[color] ?? colorClass.primary, toggle && 'pr-10', className)} {...props}>
      {children}
      {toggle && (
        <button type='button' aria-label='Close' onClick={toggle} className='absolute top-2.5 right-2.5 opacity-70 transition-opacity hover:opacity-100'>
          <XIcon className='size-4' />
        </button>
      )}
    </Comp>
  )
}

export { Alert }
