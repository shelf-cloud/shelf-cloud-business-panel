import React from 'react'

import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'

type BasePlacement = 'top' | 'bottom' | 'right' | 'left'
type VariationPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
type AutoPlacement = 'auto' | 'auto-start' | 'auto-end'
type Placement = AutoPlacement | BasePlacement | VariationPlacement

type Props = {
  target: string
  placement?: Placement
  title?: string
  children: React.ReactNode
}

const SCTooltip = ({ target, placement = 'auto', title, children }: Props) => {
  return (
    <UncontrolledTooltip
      placement={placement}
      target={target}
      popperClassName='bg-white border border-primary/50 shadow px-1 py-2 rounded-md text-[11.2px] cursor-pointer'
      style={{ display: 'inline-table' }}
      innerClassName='text-[11.2px] bg-white p-0 relative'>
      {title && <p className='text-[13px] text-primary m-0 p-0 font-bold text-left mb-2'>{title}</p>}
      {children}
    </UncontrolledTooltip>
  )
}

export default SCTooltip
