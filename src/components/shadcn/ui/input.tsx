import * as React from "react"

import {
  shadcnControlStates,
  shadcnControlSurface,
} from "@/lib/shadcn/presets"
import { cn } from "@/lib/shadcn/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "tw:h-9 tw:w-full tw:min-w-0 tw:rounded-md tw:px-3 tw:py-1 tw:text-base tw:selection:bg-primary tw:selection:text-primary-foreground tw:file:inline-flex tw:file:h-7 tw:file:border-0 tw:file:bg-transparent tw:file:text-sm tw:file:font-medium tw:file:text-foreground tw:placeholder:text-muted-foreground tw:md:text-sm tw:dark:bg-input/30",
        shadcnControlSurface,
        shadcnControlStates,
        className
      )}
      {...props}
    />
  )
}

export { Input }
