import * as React from "react"

import {
  shadcnControlStates,
  shadcnControlSurface,
} from "@/lib/shadcn/presets"
import { cn } from "@/lib/shadcn/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
        shadcnControlSurface,
        shadcnControlStates,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
