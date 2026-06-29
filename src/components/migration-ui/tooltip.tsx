import * as React from 'react'

import { createPortal } from 'react-dom'

import { cn } from '@/lib/shadcn/utils'

/**
 * Bootstrap/reactstrap <UncontrolledTooltip target="elementId"> compatibility
 * wrapper.
 *
 * reactstrap references the trigger by element id rather than wrapping it, which
 * does not map to Radix Tooltip (trigger-wrapping). This is a faithful,
 * self-contained reimplementation: it finds the element by id, shows a
 * portal-positioned tooltip on hover/focus, and supports the `placement` the app
 * uses (top/right/bottom/left, default top). `innerClassName`/`popperClassName`
 * are merged onto the tooltip for visual parity with the previous markup.
 */
type Placement = 'top' | 'bottom' | 'left' | 'right' | string

export type UncontrolledTooltipProps = {
  target: string
  placement?: Placement
  children?: React.ReactNode
  className?: string
  innerClassName?: string
  popperClassName?: string
  style?: React.CSSProperties
}

function basePlacement(placement: Placement): 'top' | 'bottom' | 'left' | 'right' {
  const base = placement.split('-')[0]
  if (base === 'bottom' || base === 'left' || base === 'right') return base
  if (base === 'top') return 'top'
  return 'top' // auto* -> top
}

function UncontrolledTooltip({ target, placement = 'top', children, className, innerClassName, popperClassName, style }: UncontrolledTooltipProps) {
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null)
  const tipRef = React.useRef<HTMLDivElement | null>(null)

  const reposition = React.useCallback(() => {
    if (typeof document === 'undefined') return
    const el = document.getElementById(target)
    if (!el) return
    const r = el.getBoundingClientRect()
    const side = basePlacement(placement)
    const gap = 8
    let top = 0
    let left = 0
    switch (side) {
      case 'bottom':
        top = r.bottom + gap
        left = r.left + r.width / 2
        break
      case 'left':
        top = r.top + r.height / 2
        left = r.left - gap
        break
      case 'right':
        top = r.top + r.height / 2
        left = r.right + gap
        break
      default:
        top = r.top - gap
        left = r.left + r.width / 2
    }
    setCoords({ top, left })
  }, [target, placement])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const el = document.getElementById(target)
    if (!el) return
    const show = () => {
      reposition()
      setOpen(true)
    }
    const hide = () => setOpen(false)
    el.addEventListener('mouseenter', show)
    el.addEventListener('mouseleave', hide)
    el.addEventListener('focus', show)
    el.addEventListener('blur', hide)
    return () => {
      el.removeEventListener('mouseenter', show)
      el.removeEventListener('mouseleave', hide)
      el.removeEventListener('focus', show)
      el.removeEventListener('blur', hide)
    }
  }, [target, reposition])

  if (!open || !coords || typeof document === 'undefined') return null

  const side = basePlacement(placement)
  const transform =
    side === 'top'
      ? 'translate(-50%, -100%)'
      : side === 'bottom'
        ? 'translate(-50%, 0)'
        : side === 'left'
          ? 'translate(-100%, -50%)'
          : 'translate(0, -50%)'

  return createPortal(
    <div
      ref={tipRef}
      role='tooltip'
      style={{ position: 'fixed', top: coords.top, left: coords.left, transform, zIndex: 1080, ...style }}
      className={cn('tw:pointer-events-none tw:max-w-xs tw:rounded-md tw:bg-foreground tw:px-2 tw:py-1 tw:text-xs tw:text-background tw:shadow-md', popperClassName, innerClassName, className)}>
      {children}
    </div>,
    document.body
  )
}

export { UncontrolledTooltip }
