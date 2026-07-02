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
 * radius, 1.5rem padding) diverge from Velzon and would require overriding on
 * every instance.
 */
type CardProps = React.ComponentProps<'div'> & { tag?: React.ElementType }

function Card({ tag: Tag = 'div', className, ...props }: CardProps) {
  return (
    <Tag
      data-slot='card'
      className={cn('relative flex min-w-0 flex-col mb-6 rounded-[0.75rem] border-0 bg-card text-card-foreground', className)}
      {...props}
    />
  )
}

function CardBody({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-body' className={cn('flex-1 p-4', className)} {...props} />
}

function CardHeader({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-header' className={cn('border-b border-[color:var(--vz-border-color)] p-4', className)} {...props} />
}

function CardFooter({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-footer' className={cn('border-t border-[color:var(--vz-border-color)] p-4', className)} {...props} />
}

function CardTitle({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-title' className={cn('mb-2 text-[1rem] font-medium', className)} {...props} />
}

export { Card, CardBody, CardHeader, CardFooter, CardTitle }
