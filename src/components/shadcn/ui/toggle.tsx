"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/shadcn/utils"

const toggleVariants = cva(
  "tw:inline-flex tw:appearance-none tw:items-center tw:justify-center tw:gap-2 tw:rounded-md tw:border-0 tw:bg-transparent tw:text-sm tw:font-medium tw:whitespace-nowrap tw:transition-[color,box-shadow,border-color,background-color] tw:outline-none tw:ring-0 tw:hover:bg-muted tw:hover:text-muted-foreground tw:focus-visible:ring-[3px] tw:focus-visible:ring-ring/50 tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:data-[state=on]:bg-accent tw:data-[state=on]:text-accent-foreground tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0 tw:[&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "tw:bg-transparent",
        outline:
          "tw:border tw:border-input tw:bg-transparent tw:shadow-xs tw:focus-visible:border-ring tw:hover:bg-accent tw:hover:text-accent-foreground",
      },
      size: {
        default: "tw:h-9 tw:min-w-9 tw:px-2",
        sm: "tw:h-8 tw:min-w-8 tw:px-1.5",
        lg: "tw:h-10 tw:min-w-10 tw:px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
