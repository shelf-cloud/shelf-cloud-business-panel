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
        "tw:flex tw:field-sizing-content tw:min-h-16 tw:w-full tw:rounded-md tw:px-3 tw:py-2 tw:text-base tw:placeholder:text-muted-foreground tw:md:text-sm tw:dark:bg-input/30",
        shadcnControlSurface,
        shadcnControlStates,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
