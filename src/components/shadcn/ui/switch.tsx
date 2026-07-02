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
        'peer group/switch inline-flex shrink-0 cursor-pointer items-center !rounded-full border-0 align-middle appearance-none shadow-xs transition-[background-color,box-shadow] leading-none outline-none ring-0 select-none p-0.5 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=default]:[--switch-thumb-size:1rem] data-[size=default]:[--switch-thumb-shift:1rem] data-[size=sm]:h-4 data-[size=sm]:w-7 data-[size=sm]:[--switch-thumb-size:0.75rem] data-[size=sm]:[--switch-thumb-shift:0.75rem] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className={cn(
          'pointer-events-none block size-[var(--switch-thumb-size)] !rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[var(--switch-thumb-shift)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
