import * as React from 'react'

import { Spinner as ShadcnSpinner } from '@shadcn/ui/spinner'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Spinner> compatibility wrapper.
 *
 * Keeps the reactstrap surface the app uses: `color`, `size`, `className`.
 * Renders the shadcn animated icon spinner internally. The reactstrap `type`
 * ("border"/"grow") prop is accepted but ignored — the shadcn spinner is a
 * single visual.
 */
const colorClass: Record<string, string> = {
  primary: 'tw:text-primary',
  secondary: 'tw:text-secondary',
  success: 'tw:text-success',
  info: 'tw:text-info',
  warning: 'tw:text-warning',
  danger: 'tw:text-destructive',
  light: 'tw:text-white',
  white: 'tw:text-white',
  dark: 'tw:text-dark',
  muted: 'tw:text-muted-foreground',
}

export type SpinnerProps = Omit<React.ComponentProps<'svg'>, 'color'> & {
  color?: string
  /** reactstrap size: "sm" renders smaller; anything else is the default size. */
  size?: 'sm' | string
  /** reactstrap type ("border" | "grow") — accepted for API parity, no visual effect. */
  type?: string
  /** reactstrap animation ("border" | "grow") — accepted for API parity, no visual effect. */
  animation?: string
}

function Spinner({ className, color, size, type: _type, animation: _animation, ...props }: SpinnerProps) {
  return (
    <ShadcnSpinner
      className={cn(size === 'sm' ? 'tw:size-4' : 'tw:size-6', color ? colorClass[color] : undefined, className)}
      {...props}
    />
  )
}

export { Spinner }
