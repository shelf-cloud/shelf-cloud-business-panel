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
 * Self-contained cva (does not layer over the shadcn buttonVariants) because
 * `cn`/tailwind-merge is not configured for the `tw:` prefix and cannot reliably
 * dedupe conflicting prefixed color classes.
 */
const buttonVariants = cva(
  'tw:inline-flex tw:appearance-none tw:items-center tw:justify-center tw:gap-2 tw:whitespace-nowrap tw:rounded-md tw:border tw:border-transparent tw:text-sm tw:font-medium tw:transition-[color,box-shadow,background-color,border-color] tw:duration-200 tw:outline-none tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:focus-visible:shadow-[0_0_0_3px_var(--ring)] [&_svg]:tw:pointer-events-none [&_svg:not([class*="tw:size-"])]:tw:size-4 tw:shrink-0',
  {
    variants: {
      color: {
        primary: 'tw:bg-primary tw:!text-primary-foreground tw:shadow-xs tw:hover:bg-primary/90',
        secondary: 'tw:bg-secondary tw:!text-secondary-foreground tw:shadow-xs tw:hover:bg-secondary/90',
        success: 'tw:bg-success tw:!text-success-foreground tw:shadow-xs tw:hover:bg-success/90',
        info: 'tw:bg-info tw:!text-info-foreground tw:shadow-xs tw:hover:bg-info/90',
        warning: 'tw:bg-warning tw:!text-warning-foreground tw:shadow-xs tw:hover:bg-warning/90',
        danger: 'tw:bg-destructive tw:!text-destructive-foreground tw:shadow-xs tw:hover:bg-destructive/90',
        dark: 'tw:bg-dark tw:!text-white tw:shadow-xs tw:hover:bg-dark/90',
        light: 'tw:border tw:border-border tw:bg-white tw:!text-foreground tw:shadow-xs tw:hover:bg-accent tw:hover:!text-accent-foreground',
        muted: 'tw:border tw:border-light tw:bg-muted tw:!text-foreground tw:shadow-xs tw:hover:border-light/80 tw:hover:bg-muted/80',
        ghost: 'tw:!text-foreground tw:hover:bg-accent tw:hover:!text-accent-foreground',
        link: 'tw:!text-primary tw:underline-offset-4 tw:hover:underline',
      },
      size: {
        default: 'tw:h-9 tw:px-4 tw:py-2',
        sm: 'tw:h-8 tw:px-3 tw:text-xs',
        lg: 'tw:h-10 tw:px-8',
        icon: 'tw:size-9',
      },
      outline: {
        true: 'tw:!bg-transparent',
        false: '',
      },
      block: {
        true: 'tw:flex tw:w-full',
        false: '',
      },
    },
    compoundVariants: [
      { outline: true, color: 'primary', class: 'tw:!border-primary tw:!text-primary tw:hover:!bg-primary tw:hover:!text-primary-foreground' },
      { outline: true, color: 'secondary', class: 'tw:!border-secondary tw:!text-secondary tw:hover:!bg-secondary tw:hover:!text-secondary-foreground' },
      { outline: true, color: 'success', class: 'tw:!border-success tw:!text-success tw:hover:!bg-success tw:hover:!text-success-foreground' },
      { outline: true, color: 'info', class: 'tw:!border-info tw:!text-info tw:hover:!bg-info tw:hover:!text-info-foreground' },
      { outline: true, color: 'warning', class: 'tw:!border-warning tw:!text-warning tw:hover:!bg-warning tw:hover:!text-warning-foreground' },
      { outline: true, color: 'danger', class: 'tw:!border-destructive tw:!text-destructive tw:hover:!bg-destructive tw:hover:!text-destructive-foreground' },
      { outline: true, color: 'dark', class: 'tw:!border-dark tw:!text-dark tw:hover:!bg-dark tw:hover:!text-white' },
      { outline: true, color: 'light', class: 'tw:!border-border tw:!text-foreground tw:hover:!bg-accent' },
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
