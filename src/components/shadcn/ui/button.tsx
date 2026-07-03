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
        success: 'bg-success !text-success-foreground shadow-xs hover:bg-success/90',
        info: 'bg-info !text-info-foreground shadow-xs hover:bg-info/90',
        warning: 'bg-warning !text-warning-foreground shadow-xs hover:bg-warning/90',
        dark: 'bg-dark !text-white shadow-xs hover:bg-dark/90',
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
      // Bootstrap-style outlined color button (pairs with a color variant);
      // distinct from variant='outline' (the neutral outline button).
      outline: {
        true: '!bg-transparent',
        false: '',
      },
      block: {
        true: 'flex w-full',
        false: '',
      },
    },
    compoundVariants: [
      { outline: true, variant: 'default', class: '!border-primary !text-primary hover:!bg-primary hover:!text-primary-foreground' },
      { outline: true, variant: 'secondary', class: '!border-secondary !text-secondary hover:!bg-secondary hover:!text-secondary-foreground' },
      { outline: true, variant: 'success', class: '!border-success !text-success hover:!bg-success hover:!text-success-foreground' },
      { outline: true, variant: 'info', class: '!border-info !text-info hover:!bg-info hover:!text-info-foreground' },
      { outline: true, variant: 'warning', class: '!border-warning !text-warning hover:!bg-warning hover:!text-warning-foreground' },
      { outline: true, variant: 'destructive', class: '!border-destructive !text-destructive hover:!bg-destructive hover:!text-destructive-foreground' },
      { outline: true, variant: 'dark', class: '!border-dark !text-dark hover:!bg-dark hover:!text-white' },
      { outline: true, variant: 'light', class: '!border-border !text-foreground hover:!bg-accent' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      outline: false,
      block: false,
    },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, outline, block, asChild = false, type = 'button', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, outline, block, className }))} type={type} {...props} />
})

Button.displayName = 'Button'

export { Button, buttonVariants }
