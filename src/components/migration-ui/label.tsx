import * as React from 'react'

import { Label as ShadcnLabel } from '@shadcn/ui/label'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Label> compatibility wrapper.
 *
 * Renders the shadcn label. Accepts both `htmlFor` (majority) and reactstrap's
 * `for`, plus the `check` prop (form-check label) which only tweaks layout.
 */
export type LabelProps = React.ComponentProps<typeof ShadcnLabel> & {
  /** reactstrap alias for htmlFor. */
  for?: string
  /** reactstrap form-check label flag. */
  check?: boolean
  tag?: React.ElementType
}

function Label({ className, htmlFor, for: forProp, check, tag: _tag, ...props }: LabelProps) {
  return (
    <ShadcnLabel
      htmlFor={htmlFor ?? forProp}
      className={cn(check && 'font-normal', className)}
      {...props}
    />
  )
}

export { Label }
