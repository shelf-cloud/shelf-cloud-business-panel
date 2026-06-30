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
  primary: 'tw:border-primary/30 tw:bg-primary/10 tw:text-primary',
  secondary: 'tw:border-border tw:bg-muted tw:text-foreground',
  success: 'tw:border-success/30 tw:bg-success/10 tw:text-success',
  info: 'tw:border-info/30 tw:bg-info/10 tw:text-info',
  warning: 'tw:border-warning/30 tw:bg-warning/10 tw:text-warning',
  danger: 'tw:border-destructive/30 tw:bg-destructive/10 tw:text-destructive',
  light: 'tw:border-border tw:bg-light tw:text-foreground',
  dark: 'tw:border-dark/30 tw:bg-dark/10 tw:text-dark',
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
    <Comp role='alert' className={cn('tw:relative tw:w-full tw:rounded-lg tw:border tw:px-4 tw:py-3 tw:text-sm', colorClass[color] ?? colorClass.primary, toggle && 'tw:pr-10', className)} {...props}>
      {children}
      {toggle && (
        <button type='button' aria-label='Close' onClick={toggle} className='tw:absolute tw:top-2.5 tw:right-2.5 tw:opacity-70 tw:transition-opacity tw:hover:opacity-100'>
          <XIcon className='tw:size-4' />
        </button>
      )}
    </Comp>
  )
}

export { Alert }
