import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Button> compatibility wrapper.
 *
 * Renders Tailwind/shadcn styling internally while keeping the reactstrap prop
 * surface the app actually uses: `color`, `size`, `outline`, `disabled`,
 * `type`, `className`, `block`, plus `tag`/`href` for link-style buttons.
 *
 * Self-contained cva (does not layer over the shadcn buttonVariants) to keep
 * every Bootstrap color (incl. success/info/warning, which shadcn's button
 * lacks) and Velzon's exact visual treatment per color/outline combo.
 */
const buttonVariants = cva(
  'inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium transition-[color,box-shadow,background-color,border-color] duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:shadow-[0_0_0_3px_var(--ring)] [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0',
  {
    variants: {
      color: {
        primary: 'bg-primary !text-primary-foreground shadow-xs hover:bg-primary/90',
        secondary: 'bg-secondary !text-secondary-foreground shadow-xs hover:bg-secondary/90',
        success: 'bg-success !text-success-foreground shadow-xs hover:bg-success/90',
        info: 'bg-info !text-info-foreground shadow-xs hover:bg-info/90',
        warning: 'bg-warning !text-warning-foreground shadow-xs hover:bg-warning/90',
        danger: 'bg-destructive !text-destructive-foreground shadow-xs hover:bg-destructive/90',
        dark: 'bg-dark !text-white shadow-xs hover:bg-dark/90',
        light: 'border border-border bg-white !text-foreground shadow-xs hover:bg-accent hover:!text-accent-foreground',
        muted: 'border border-light bg-muted !text-foreground shadow-xs hover:border-light/80 hover:bg-muted/80',
        ghost: '!text-foreground hover:bg-accent hover:!text-accent-foreground',
        link: '!text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'size-9',
      },
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
      { outline: true, color: 'primary', class: '!border-primary !text-primary hover:!bg-primary hover:!text-primary-foreground' },
      { outline: true, color: 'secondary', class: '!border-secondary !text-secondary hover:!bg-secondary hover:!text-secondary-foreground' },
      { outline: true, color: 'success', class: '!border-success !text-success hover:!bg-success hover:!text-success-foreground' },
      { outline: true, color: 'info', class: '!border-info !text-info hover:!bg-info hover:!text-info-foreground' },
      { outline: true, color: 'warning', class: '!border-warning !text-warning hover:!bg-warning hover:!text-warning-foreground' },
      { outline: true, color: 'danger', class: '!border-destructive !text-destructive hover:!bg-destructive hover:!text-destructive-foreground' },
      { outline: true, color: 'dark', class: '!border-dark !text-dark hover:!bg-dark hover:!text-white' },
      { outline: true, color: 'light', class: '!border-border !text-foreground hover:!bg-accent' },
    ],
    defaultVariants: {
      color: 'primary',
      size: 'default',
      outline: false,
      block: false,
    },
  }
)

type ButtonColor = NonNullable<VariantProps<typeof buttonVariants>['color']>
type ButtonSize = 'sm' | 'lg' | 'default' | 'icon'

export type ButtonProps = Omit<React.ComponentProps<'button'>, 'size' | 'color'> & {
  color?: ButtonColor
  /** reactstrap accepts boolean (sm) or string size; map sm/lg, default otherwise. */
  size?: ButtonSize | boolean | string
  outline?: boolean
  block?: boolean
  asChild?: boolean
  /** reactstrap polymorphic tag, e.g. tag="a". */
  tag?: React.ElementType
  href?: string
}

function normalizeSize(size: ButtonProps['size']): ButtonSize {
  if (size === 'sm' || size === 'lg' || size === 'icon') return size
  return 'default'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color = 'primary', size, outline = false, block = false, asChild = false, tag, href, type, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? Slot : href ? 'a' : tag ?? 'button'
    const isButton = Comp === 'button'

    return (
      <Comp
        ref={ref as never}
        href={href}
        className={cn(buttonVariants({ color, size: normalizeSize(size), outline, block }), className)}
        type={isButton ? (type ?? 'button') : type}
        {...props}
      />
    )
  }
)

Button.displayName = 'MigrationButton'

export { Button, buttonVariants }
