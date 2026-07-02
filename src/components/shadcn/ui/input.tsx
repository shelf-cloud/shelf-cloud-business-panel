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
        "h-9 w-full min-w-0 rounded-md px-3 py-1 text-base selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
        shadcnControlSurface,
        shadcnControlStates,
        className
      )}
      {...props}
    />
  )
}

export { Input }
