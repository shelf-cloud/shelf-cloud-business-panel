import * as React from 'react'

import { Switch as SwitchPrimitive } from 'radix-ui'

import { cn } from '@/lib/shadcn/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      data-size={size}
      className={cn(
        'tw:peer tw:group/switch tw:inline-flex tw:shrink-0 tw:cursor-pointer tw:items-center tw:!rounded-full tw:border-0 tw:align-middle tw:appearance-none tw:shadow-xs tw:transition-[background-color,box-shadow] tw:leading-none tw:outline-none tw:ring-0 tw:select-none tw:p-0.5 tw:data-[size=default]:h-5 tw:data-[size=default]:w-9 tw:data-[size=default]:[--switch-thumb-size:1rem] tw:data-[size=default]:[--switch-thumb-shift:1rem] tw:data-[size=sm]:h-4 tw:data-[size=sm]:w-7 tw:data-[size=sm]:[--switch-thumb-size:0.75rem] tw:data-[size=sm]:[--switch-thumb-shift:0.75rem] tw:focus-visible:ring-[3px] tw:focus-visible:ring-ring/50 tw:disabled:cursor-not-allowed tw:disabled:opacity-50 tw:data-[state=checked]:bg-primary tw:data-[state=unchecked]:bg-input tw:dark:data-[state=unchecked]:bg-input/80',
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'tw:pointer-events-none tw:block tw:size-[var(--switch-thumb-size)] tw:!rounded-full tw:bg-background tw:shadow-sm tw:ring-0 tw:transition-transform tw:data-[state=checked]:translate-x-[var(--switch-thumb-shift)] tw:data-[state=unchecked]:translate-x-0 tw:dark:data-[state=checked]:bg-primary-foreground tw:dark:data-[state=unchecked]:bg-foreground'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
