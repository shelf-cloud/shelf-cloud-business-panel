import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/shadcn/utils'

const buttonVariants = cva(
  'tw:inline-flex tw:appearance-none tw:items-center tw:justify-center tw:gap-2 tw:whitespace-nowrap tw:rounded-md tw:border tw:border-transparent tw:text-sm tw:font-medium tw:transition-[color,box-shadow,background-color,border-color] tw:duration-200 tw:outline-none tw:ring-0 tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:focus-visible:shadow-[0_0_0_3px_var(--ring)] [&_svg]:tw:pointer-events-none [&_svg:not([class*="tw:size-"])]:tw:size-4 tw:shrink-0',
  {
    variants: {
      variant: {
        default: 'tw:bg-primary tw:!text-primary-foreground tw:shadow-xs tw:hover:bg-primary/90',
        secondary: 'tw:bg-secondary tw:!text-secondary-foreground tw:shadow-xs tw:hover:bg-secondary/90',
        muted: 'tw:border tw:border-light tw:bg-muted tw:!text-foreground tw:shadow-xs tw:hover:border-light/80 tw:hover:bg-muted/80 tw:hover:!text-foreground',
        outline: 'tw:border tw:border-border tw:bg-background tw:!text-foreground tw:hover:bg-accent tw:hover:!text-accent-foreground',
        light: 'tw:border tw:border-border tw:bg-white tw:!text-foreground tw:hover:bg-accent tw:hover:!text-accent-foreground',
        ghost: 'tw:!text-foreground tw:hover:bg-accent tw:hover:!text-accent-foreground',
        link: 'tw:!text-primary tw:underline-offset-4 tw:hover:underline',
        destructive: 'tw:bg-destructive tw:!text-destructive-foreground tw:shadow-xs tw:hover:bg-destructive/90',
      },
      size: {
        default: 'tw:h-9 tw:px-4 tw:py-2 tw:!rounded-md',
        sm: 'tw:h-8 tw:!rounded-md tw:px-3 tw:text-xs',
        lg: 'tw:h-10 tw:!rounded-md tw:px-8',
        icon: 'tw:size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} type={type} {...props} />
})

Button.displayName = 'Button'

export { Button, buttonVariants }
