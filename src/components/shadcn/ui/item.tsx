import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/shadcn/utils"
import { Separator } from "@shadcn/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("tw:group/item-group tw:flex tw:flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("tw:my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "tw:group/item tw:flex tw:flex-wrap tw:items-center tw:rounded-md tw:border tw:border-transparent tw:text-sm tw:transition-colors tw:duration-100 tw:outline-none tw:focus-visible:border-ring tw:focus-visible:ring-[3px] tw:focus-visible:ring-ring/50 tw:[a]:transition-colors tw:[a]:hover:bg-accent/50",
  {
    variants: {
      variant: {
        default: "tw:bg-transparent",
        outline: "tw:border-border",
        muted: "tw:bg-muted/50",
      },
      size: {
        default: "tw:gap-4 tw:p-4",
        sm: "tw:gap-2.5 tw:px-4 tw:py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "tw:flex tw:shrink-0 tw:items-center tw:justify-center tw:gap-2 tw:group-has-[[data-slot=item-description]]/item:translate-y-0.5 tw:group-has-[[data-slot=item-description]]/item:self-start tw:[&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "tw:bg-transparent",
        icon: "tw:size-8 tw:rounded-sm tw:border tw:border-border tw:bg-muted tw:[&_svg:not([class*=size-])]:size-4",
        image:
          "tw:size-10 tw:overflow-hidden tw:rounded-sm tw:[&_img]:size-full tw:[&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "tw:flex tw:flex-1 tw:flex-col tw:gap-1 tw:[&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "tw:flex tw:w-fit tw:items-center tw:gap-2 tw:text-sm tw:leading-snug tw:font-medium",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "tw:line-clamp-2 tw:text-sm tw:leading-normal tw:font-normal tw:text-balance tw:text-muted-foreground",
        "tw:[&>a]:underline tw:[&>a]:underline-offset-4 tw:[&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("tw:flex tw:items-center tw:gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "tw:flex tw:basis-full tw:items-center tw:justify-between tw:gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "tw:flex tw:basis-full tw:items-center tw:justify-between tw:gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
