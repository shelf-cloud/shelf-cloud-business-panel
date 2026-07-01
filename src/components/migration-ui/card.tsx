import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Card> family compatibility wrappers.
 *
 * Rendered as self-contained divs whose styling matches the Velzon Bootstrap
 * `.card` family exactly, so migrated cards look identical to the original
 * during the Bootstrap-present transition:
 *   - border: 0, radius 0.75rem (12px), flat (no shadow), white bg
 *   - flex column, min-w-0, 1.5rem bottom margin
 *   - CardBody padding 1rem, flex-1
 *   - CardHeader/CardFooter padding 1rem + light 1px --vz-border-color divider
 *
 * NOT layered over shadcn Card: its defaults (visible 1px --border, inflated
 * radius, 1.5rem padding) diverge from Velzon, and tailwind-merge is not
 * tw:-prefix aware so those defaults can't be reliably overridden via className.
 */
type CardProps = React.ComponentProps<'div'> & { tag?: React.ElementType }

function Card({ tag: Tag = 'div', className, ...props }: CardProps) {
  return (
    <Tag
      data-slot='card'
      className={cn('tw:relative tw:flex tw:min-w-0 tw:flex-col tw:mb-6 tw:rounded-[0.75rem] tw:border-0 tw:bg-card tw:text-card-foreground', className)}
      {...props}
    />
  )
}

function CardBody({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-body' className={cn('tw:flex-1 tw:p-4', className)} {...props} />
}

function CardHeader({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-header' className={cn('tw:border-b tw:border-[color:var(--vz-border-color)] tw:p-4', className)} {...props} />
}

function CardFooter({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-footer' className={cn('tw:border-t tw:border-[color:var(--vz-border-color)] tw:p-4', className)} {...props} />
}

function CardTitle({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-title' className={cn('tw:mb-2 tw:text-[1rem] tw:font-medium', className)} {...props} />
}

export { Card, CardBody, CardHeader, CardFooter, CardTitle }
