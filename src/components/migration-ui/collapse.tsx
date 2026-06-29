import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <Collapse isOpen> compatibility wrapper.
 *
 * reactstrap Collapse is a controlled show/hide with height animation and no
 * trigger. This renders a CSS grid-rows animation (0fr/1fr) so children stay
 * mounted (forms/state preserved) and the area animates open/closed. The
 * caller's existing `isOpen` state and `className` are kept.
 */
export type CollapseProps = React.ComponentProps<'div'> & {
  isOpen?: boolean
  /** reactstrap horizontal collapse — accepted, vertical animation only. */
  horizontal?: boolean
  tag?: React.ElementType
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ isOpen, className, children, horizontal: _horizontal, tag, ...props }, ref) => {
    const Comp: React.ElementType = tag ?? 'div'
    return (
      <Comp
        ref={ref}
        data-slot='collapse'
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('tw:grid tw:transition-[grid-template-rows] tw:duration-200 tw:ease-in-out', isOpen ? 'tw:grid-rows-[1fr]' : 'tw:grid-rows-[0fr]')}
        {...props}>
        <div className={cn('tw:min-h-0 tw:overflow-hidden', className)}>{children}</div>
      </Comp>
    )
  }
)
Collapse.displayName = 'MigrationCollapse'

export { Collapse }
