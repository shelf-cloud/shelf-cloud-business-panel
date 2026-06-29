import * as React from 'react'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap tab compatibility wrappers.
 *
 *   Nav / NavItem / NavLink -> the tab strip (caller keeps active state + onClick)
 *   TabContent (activeTab)  -> context provider
 *   TabPane (tabId)         -> shows/hides based on activeTab; children stay mounted
 *
 * The caller's existing active-tab state and click handlers are preserved, so
 * tab screens migrate by import-swap. NavLink active styling is driven by the
 * className the caller already passes.
 */
const TabContext = React.createContext<string | number | undefined>(undefined)

export type NavProps = React.ComponentProps<'ul'> & {
  tabs?: boolean
  pills?: boolean
  vertical?: boolean
  justified?: boolean
  fill?: boolean
  card?: boolean
  tag?: React.ElementType
}

function Nav({ className, tabs: _tabs, pills: _pills, vertical, justified, fill, card: _card, tag, ...props }: NavProps) {
  const Comp: React.ElementType = tag ?? 'ul'
  return (
    <Comp
      role='tablist'
      className={cn('tw:flex tw:list-none tw:flex-wrap tw:gap-1 tw:p-0', vertical && 'tw:flex-col', (justified || fill) && 'tw:w-full', className)}
      {...props}
    />
  )
}

export type NavItemProps = React.ComponentProps<'li'> & { tag?: React.ElementType }

function NavItem({ className, tag, ...props }: NavItemProps) {
  const Comp: React.ElementType = tag ?? 'li'
  return <Comp className={cn(className)} {...props} />
}

export type NavLinkProps = React.ComponentProps<'a'> & {
  active?: boolean
  disabled?: boolean
  tag?: React.ElementType
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(({ className, active, disabled, tag, ...props }, ref) => {
  const Comp: React.ElementType = tag ?? 'a'
  return (
    <Comp
      ref={ref}
      role='tab'
      aria-selected={active || undefined}
      data-active={active || undefined}
      aria-disabled={disabled || undefined}
      className={cn('tw:cursor-pointer tw:px-3 tw:py-2 tw:text-sm tw:font-medium', disabled && 'tw:pointer-events-none tw:opacity-50', className)}
      {...props}
    />
  )
})
NavLink.displayName = 'MigrationNavLink'

export type TabContentProps = React.ComponentProps<'div'> & {
  activeTab?: string | number
  tag?: React.ElementType
}

function TabContent({ activeTab, className, children, tag, ...props }: TabContentProps) {
  const Comp: React.ElementType = tag ?? 'div'
  return (
    <TabContext.Provider value={activeTab}>
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    </TabContext.Provider>
  )
}

export type TabPaneProps = React.ComponentProps<'div'> & {
  tabId?: string | number
  tag?: React.ElementType
}

function TabPane({ tabId, className, children, tag, ...props }: TabPaneProps) {
  const active = React.useContext(TabContext)
  const isActive = active === tabId
  const Comp: React.ElementType = tag ?? 'div'
  return (
    <Comp role='tabpanel' hidden={!isActive} className={cn(!isActive && 'tw:hidden', className)} {...props}>
      {children}
    </Comp>
  )
}

export { Nav, NavItem, NavLink, TabContent, TabPane }
