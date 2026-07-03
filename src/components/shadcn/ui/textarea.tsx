import * as React from "react"

import {
  shadcnControlStates,
  shadcnControlSurface,
} from "@/lib/shadcn/presets"
import { cn } from "@/lib/shadcn/utils"

// forwardRef required on React 18: some callers attach refs (innerRef conversions).
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
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
})
Textarea.displayName = 'Textarea'

export { Textarea }
