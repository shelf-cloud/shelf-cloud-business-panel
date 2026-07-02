import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Badge> compatibility wrapper.
 *
 * Keeps the reactstrap surface: `color`, `pill`, `className`. Self-contained cva
 * so every Bootstrap color (incl. success/info, which shadcn's badge lacks) is
 * covered.
 */
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none',
  {
    variants: {
      color: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success text-success-foreground',
        info: 'bg-info text-info-foreground',
        warning: 'bg-warning text-warning-foreground',
        danger: 'bg-destructive text-destructive-foreground',
        dark: 'bg-dark text-white',
        light: 'bg-light text-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
      pill: {
        true: 'rounded-full',
        false: 'rounded-sm',
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
