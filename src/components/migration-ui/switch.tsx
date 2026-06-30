import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Toggle switch — drop-in replacement for the Bootstrap-switch pattern
 * `<Input type='checkbox' className='form-check-input' ... />` rendered inside a
 * `form-switch`.
 *
 * It is a label-wrapped native checkbox so existing Formik wiring works
 * unchanged: pass `checked`, `onChange` (reads `e.target.checked`), `id`,
 * `name`, `disabled` exactly as before. `className` styles the outer control.
 */
export type SwitchProps = Omit<React.ComponentProps<'input'>, 'type'>

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, disabled, ...props }, ref) => {
  return (
    <label className={cn('tw:relative tw:inline-flex tw:h-5 tw:w-9 tw:shrink-0 tw:items-center', disabled ? 'tw:cursor-not-allowed tw:opacity-50' : 'tw:cursor-pointer', className)}>
      <input ref={ref} type='checkbox' disabled={disabled} className='tw:peer tw:sr-only' {...props} />
      <span className='tw:absolute tw:inset-0 tw:rounded-full tw:bg-input tw:transition-colors tw:peer-checked:bg-primary tw:peer-focus-visible:ring-2 tw:peer-focus-visible:ring-ring/50' />
      <span className='tw:absolute tw:left-0.5 tw:size-4 tw:rounded-full tw:bg-white tw:shadow-sm tw:transition-transform tw:peer-checked:translate-x-4' />
    </label>
  )
})
Switch.displayName = 'MigrationSwitch'

export { Switch }
