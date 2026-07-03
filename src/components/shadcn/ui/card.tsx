import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Card family themed to the app's Velzon look (flat, border-0, 0.75rem radius,
 * 1rem section padding, 1.5rem bottom margin, light --vz-border-color
 * header/footer dividers). This IS the app card — kept in sync with the visual
 * language the Bootstrap migration preserved. `tag` allows polymorphic
 * rendering (e.g. tag='form').
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

function CardHeader({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-header' className={cn('border-b border-[color:var(--vz-border-color)] p-4', className)} {...props} />
}

function CardTitle({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-title' className={cn('mb-2 text-[1rem] font-medium', className)} {...props} />
}

function CardDescription({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-description' className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function CardAction({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-action' className={cn('self-start justify-self-end', className)} {...props} />
}

function CardContent({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-content' className={cn('flex-1 p-4', className)} {...props} />
}

function CardFooter({ tag: Tag = 'div', className, ...props }: CardProps) {
  return <Tag data-slot='card-footer' className={cn('flex items-center border-t border-[color:var(--vz-border-color)] p-4', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
