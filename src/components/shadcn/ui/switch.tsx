import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import {
  shadcnControlStates,
  shadcnInteractiveReset,
} from "@/lib/shadcn/presets"
import { cn } from "@/lib/shadcn/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "tw:peer tw:group/switch tw:inline-flex tw:shrink-0 tw:items-center tw:rounded-full tw:shadow-xs tw:transition-all tw:data-[size=default]:h-[1.15rem] tw:data-[size=default]:w-8 tw:data-[size=sm]:h-3.5 tw:data-[size=sm]:w-6 tw:data-[state=checked]:bg-primary tw:data-[state=unchecked]:bg-input tw:dark:data-[state=unchecked]:bg-input/80",
        shadcnInteractiveReset,
        shadcnControlStates,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "tw:pointer-events-none tw:block tw:rounded-full tw:bg-background tw:ring-0 tw:transition-transform tw:group-data-[size=default]/switch:size-4 tw:group-data-[size=sm]/switch:size-3 tw:data-[state=checked]:translate-x-[calc(100%-2px)] tw:data-[state=unchecked]:translate-x-0 tw:dark:data-[state=checked]:bg-primary-foreground tw:dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
