import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Badge> compatibility wrapper.
 *
 * Keeps the reactstrap surface: `color`, `pill`, `className`. Self-contained cva
 * so every Bootstrap color (incl. success/info, which shadcn's badge lacks) is
 * covered without relying on prefix-unaware tailwind-merge.
 */
const badgeVariants = cva(
  'tw:inline-flex tw:w-fit tw:shrink-0 tw:items-center tw:justify-center tw:gap-1 tw:overflow-hidden tw:border tw:border-transparent tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:whitespace-nowrap tw:[&>svg]:size-3 tw:[&>svg]:pointer-events-none',
  {
    variants: {
      color: {
        primary: 'tw:bg-primary tw:text-primary-foreground',
        secondary: 'tw:bg-secondary tw:text-secondary-foreground',
        success: 'tw:bg-success tw:text-success-foreground',
        info: 'tw:bg-info tw:text-info-foreground',
        warning: 'tw:bg-warning tw:text-warning-foreground',
        danger: 'tw:bg-destructive tw:text-destructive-foreground',
        dark: 'tw:bg-dark tw:text-white',
        light: 'tw:bg-light tw:text-foreground',
        muted: 'tw:bg-muted tw:text-muted-foreground',
      },
      pill: {
        true: 'tw:rounded-full',
        false: 'tw:rounded-sm',
      },
    },
    defaultVariants: {
      color: 'secondary',
      pill: false,
    },
  }
)

type BadgeColor = NonNullable<VariantProps<typeof badgeVariants>['color']>

export type BadgeProps = Omit<React.ComponentProps<'span'>, 'color'> & {
  color?: BadgeColor
  pill?: boolean
  asChild?: boolean
  tag?: React.ElementType
}

function Badge({ className, color = 'secondary', pill = false, asChild = false, tag, ...props }: BadgeProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : tag ?? 'span'

  return <Comp data-slot='badge' className={cn(badgeVariants({ color, pill }), className)} {...props} />
}

export { Badge, badgeVariants }
