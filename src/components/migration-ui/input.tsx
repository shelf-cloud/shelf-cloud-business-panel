import * as React from 'react'

import { Input as ShadcnInput } from '@shadcn/ui/input'
import { Textarea as ShadcnTextarea } from '@shadcn/ui/textarea'

import { shadcnControlStates, shadcnControlSurface } from '@/lib/shadcn/presets'
import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Input> compatibility wrapper.
 *
 * reactstrap's Input is polymorphic via `type`. This mirrors the app-observed
 * cases:
 *   text-like (text/number/email/password/date/file/...) -> shadcn Input
 *   textarea                                               -> shadcn Textarea
 *   select                                                 -> native styled <select> (keeps option children + onChange)
 *   checkbox / radio                                       -> native input (keeps Formik bindings)
 *
 * Bootstrap props mapped: `invalid` -> aria-invalid, `bsSize` -> size classes.
 * `valid` is accepted for parity but has no visual effect. `innerRef` is
 * supported as a reactstrap-style ref alias.
 */
type Size = 'sm' | 'lg'

type CommonProps = {
  invalid?: boolean
  valid?: boolean
  bsSize?: Size
  innerRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
}

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  Pick<React.ComponentProps<'textarea'>, 'rows' | 'cols'> &
  CommonProps & {
    type?: string
  }

const sizeClass = (bsSize?: Size) =>
  bsSize === 'sm' ? 'tw:h-8 tw:text-xs' : bsSize === 'lg' ? 'tw:h-10' : undefined

function Input({ type = 'text', className, invalid, valid: _valid, bsSize, innerRef, ...props }: InputProps) {
  const ariaInvalid = invalid || undefined

  if (type === 'textarea') {
    return (
      <ShadcnTextarea
        aria-invalid={ariaInvalid}
        className={cn(className)}
        {...(props as React.ComponentProps<'textarea'>)}
      />
    )
  }

  if (type === 'select') {
    return (
      <select
        ref={innerRef as React.Ref<HTMLSelectElement>}
        aria-invalid={ariaInvalid}
        className={cn(
          'tw:h-9 tw:w-full tw:min-w-0 tw:rounded-md tw:px-3 tw:py-1 tw:text-base tw:md:text-sm',
          shadcnControlSurface,
          shadcnControlStates,
          sizeClass(bsSize),
          className
        )}
        {...(props as React.ComponentProps<'select'>)}
      />
    )
  }

  if (type === 'checkbox' || type === 'radio') {
    return (
      <input
        ref={innerRef as React.Ref<HTMLInputElement>}
        type={type}
        aria-invalid={ariaInvalid}
        className={cn(
          'tw:size-4 tw:shrink-0 tw:border tw:border-input-border tw:accent-primary',
          type === 'checkbox' ? 'tw:rounded-sm' : 'tw:rounded-full',
          className
        )}
        {...props}
      />
    )
  }

  return (
    <ShadcnInput
      type={type}
      aria-invalid={ariaInvalid}
      className={cn(sizeClass(bsSize), className)}
      {...props}
    />
  )
}

export { Input }
