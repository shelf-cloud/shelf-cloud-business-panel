import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import {
  shadcnControlStates,
  shadcnInteractiveReset,
} from "@/lib/shadcn/presets"
import { cn } from "@/lib/shadcn/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "tw:peer tw:size-4 tw:shrink-0 tw:rounded-[4px] tw:border-input tw:bg-input tw:shadow-xs tw:transition-shadow tw:data-[state=checked]:border-primary tw:data-[state=checked]:bg-primary tw:data-[state=checked]:text-primary-foreground tw:dark:bg-input/30 tw:dark:data-[state=checked]:bg-primary",
        shadcnInteractiveReset,
        shadcnControlStates,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="tw:grid tw:place-content-center tw:text-current tw:transition-none"
      >
        <CheckIcon className="tw:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
