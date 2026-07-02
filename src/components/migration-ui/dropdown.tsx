import * as React from 'react'

import {
  DropdownMenu as RadixDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap dropdown compatibility wrappers, rendering shadcn
 * (Radix) DropdownMenu internally. Mapping:
 *   UncontrolledDropdown / UncontrolledButtonDropdown -> DropdownMenu root (uncontrolled)
 *   Dropdown (isOpen/toggle)                          -> DropdownMenu root (controlled)
 *   DropdownToggle                                    -> DropdownMenuTrigger (asChild button/tag)
 *   DropdownMenu                                      -> DropdownMenuContent (align end if dropdown-menu-end)
 *   DropdownItem                                      -> DropdownMenuItem / Label (header) / Separator (divider)
 */
export type DropdownRootProps = {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** controlled open state (reactstrap Dropdown). */
  isOpen?: boolean
  /** controlled toggle (reactstrap Dropdown). */
  toggle?: () => void
  direction?: string
  tag?: React.ElementType
  group?: boolean
}

function DropdownRoot({ children, className, style, isOpen, toggle, group }: DropdownRootProps) {
  const controlled = typeof isOpen === 'boolean'
  return (
    <RadixDropdownMenu
      {...(controlled
        ? {
            open: isOpen,
            onOpenChange: (open: boolean) => {
              if (open !== isOpen) toggle?.()
            },
          }
        : {})}>
      <div className={cn('relative inline-block', group && 'inline-flex', className)} style={style}>
        {children}
      </div>
    </RadixDropdownMenu>
  )
}

function UncontrolledDropdown(props: DropdownRootProps) {
  return <DropdownRoot {...props} />
}

function Dropdown(props: DropdownRootProps) {
  return <DropdownRoot {...props} />
}

function UncontrolledButtonDropdown(props: DropdownRootProps) {
  return <DropdownRoot group {...props} />
}

export type DropdownToggleProps = React.ComponentProps<'button'> & {
  caret?: boolean
  color?: string
  nav?: boolean
  /** reactstrap split-button flag — accepted for parity, renders a single trigger. */
  split?: boolean
  size?: string
  tag?: React.ElementType
}

const DropdownToggle = React.forwardRef<HTMLButtonElement, DropdownToggleProps>(
  ({ children, className, caret, color: _color, nav: _nav, split: _split, size: _size, tag, type, ...props }, ref) => {
    const Comp: React.ElementType = tag ?? 'button'
    const isButton = Comp === 'button'
    return (
      <DropdownMenuTrigger asChild>
        <Comp ref={ref} type={isButton ? (type ?? 'button') : type} className={cn(className)} {...props}>
          {children}
          {caret && <ChevronDownIcon className='ml-1 size-4' />}
        </Comp>
      </DropdownMenuTrigger>
    )
  }
)
DropdownToggle.displayName = 'MigrationDropdownToggle'

export type DropdownMenuProps = React.ComponentProps<typeof DropdownMenuContent> & {
  /** reactstrap right-aligned menu. */
  end?: boolean
  /** reactstrap portal container — accepted, Radix portals by default. */
  container?: unknown
}

function DropdownMenu({ children, className, end, container: _container, align, ...props }: DropdownMenuProps) {
  const resolvedAlign = align ?? (end || className?.includes('dropdown-menu-end') ? 'end' : 'start')
  return (
    <DropdownMenuContent align={resolvedAlign} className={className} {...props}>
      {children}
    </DropdownMenuContent>
  )
}

export type DropdownItemProps = React.ComponentProps<typeof DropdownMenuItem> & {
  divider?: boolean
  header?: boolean
  /** reactstrap close-on-click flag — accepted, Radix closes by default. */
  toggle?: boolean
  tag?: React.ElementType
}

function DropdownItem({ children, className, divider, header, toggle: _toggle, tag: _tag, ...props }: DropdownItemProps) {
  if (divider) return <DropdownMenuSeparator className={className} />
  if (header)
    return (
      <DropdownMenuLabel className={className}>{children}</DropdownMenuLabel>
    )
  return (
    <DropdownMenuItem className={className} {...props}>
      {children}
    </DropdownMenuItem>
  )
}

export type ButtonGroupProps = React.ComponentProps<'div'> & { tag?: React.ElementType; size?: string; vertical?: boolean }

function ButtonGroup({ className, tag, size: _size, vertical, ...props }: ButtonGroupProps) {
  const Comp: React.ElementType = tag ?? 'div'
  return <Comp role='group' className={cn('inline-flex', vertical && 'flex-col', className)} {...props} />
}

export { UncontrolledDropdown, Dropdown, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, ButtonGroup }
