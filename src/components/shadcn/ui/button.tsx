import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/shadcn/utils'

const buttonVariants = cva(
  'inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-[color,box-shadow,background-color,border-color] duration-200 outline-none ring-0 disabled:pointer-events-none disabled:opacity-50 focus-visible:shadow-[0_0_0_3px_var(--ring)] [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary !text-primary-foreground shadow-xs hover:bg-primary/90',
        secondary: 'bg-secondary !text-secondary-foreground shadow-xs hover:bg-secondary/90',
        muted: 'border border-light bg-muted !text-foreground shadow-xs hover:border-light/80 hover:bg-muted/80 hover:!text-foreground',
        outline: '!border !border-border !bg-background !text-foreground hover:bg-accent hover:!text-accent-foreground',
        light: 'border border-border bg-white !text-foreground hover:bg-accent hover:!text-accent-foreground',
        ghost: '!text-foreground hover:bg-accent hover:!text-accent-foreground',
        link: '!text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive !text-destructive-foreground shadow-xs hover:bg-destructive/90',
      },
      size: {
        default: 'h-9 px-4 py-2 !rounded-md',
        sm: 'h-8 !rounded-md px-3 text-xs',
        lg: 'h-10 !rounded-md px-8',
        icon: 'size-9',
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
