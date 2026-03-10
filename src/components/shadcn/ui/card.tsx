import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('tw:rounded-xl tw:border tw:border-border tw:bg-card tw:text-card-foreground tw:shadow-sm', className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('tw:flex tw:flex-col tw:gap-1.5 tw:px-6 tw:pt-6', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('tw:text-lg tw:font-semibold tw:tracking-tight tw:text-card-foreground', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('tw:text-sm tw:text-muted-foreground', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('tw:px-6 tw:pb-6', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('tw:flex tw:items-center tw:px-6 tw:pb-6', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
