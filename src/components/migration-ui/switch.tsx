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
    <label className={cn('relative inline-flex h-5 w-9 shrink-0 items-center', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}>
      <input ref={ref} type='checkbox' disabled={disabled} className='peer sr-only' {...props} />
      <span className='absolute inset-0 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50' />
      <span className='absolute left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4' />
    </label>
  )
})
Switch.displayName = 'MigrationSwitch'

export { Switch }
