import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap form-structure compatibility wrappers.
 *
 *   Form         -> native <form>
 *   FormGroup    -> spacing wrapper (default mb-3, like reactstrap)
 *   FormFeedback -> destructive validation text (renders only when it has content)
 *
 * For new/migrated forms prefer the Formik<->shadcn Field adapter
 * (./formik-field) and the shadcn Field primitives. These wrappers exist so
 * existing reactstrap form markup can be swapped by changing the import only.
 */
export type FormProps = React.ComponentProps<'form'> & { tag?: React.ElementType }

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ className, tag: _tag, ...props }, ref) => {
  return <form ref={ref} className={cn(className)} {...props} />
})
Form.displayName = 'MigrationForm'

export type FormGroupProps = React.ComponentProps<'div'> & {
  /** reactstrap form-check layout flag. */
  check?: boolean
  /** reactstrap row layout flag. */
  row?: boolean
  tag?: React.ElementType
}

function FormGroup({ className, check, row, tag, ...props }: FormGroupProps) {
  const Comp: React.ElementType = tag ?? 'div'
  return (
    <Comp
      data-slot='form-group'
      className={cn('tw:mb-3', check && 'tw:flex tw:items-center tw:gap-2', row && 'tw:flex tw:flex-wrap', className)}
      {...props}
    />
  )
}

export type FormFeedbackProps = React.ComponentProps<'div'> & {
  /** reactstrap feedback type — accepted for parity, no effect. */
  type?: string
  /** reactstrap valid-feedback flag — accepted for parity. */
  valid?: boolean
  tag?: React.ElementType
}

function FormFeedback({ className, type: _type, valid, children, tag: _tag, ...props }: FormFeedbackProps) {
  // reactstrap renders feedback unconditionally and lets Bootstrap CSS toggle
  // visibility; here we render only when there is content (callers pass the
  // error string as children, which is empty/undefined when valid).
  if (children == null || children === '' || children === false) return null
  return (
    <div data-slot='form-feedback' className={cn('tw:text-sm', valid ? 'tw:text-success' : 'tw:text-destructive', className)} {...props}>
      {children}
    </div>
  )
}

export { Form, FormGroup, FormFeedback }
