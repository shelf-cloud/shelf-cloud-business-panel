import React from 'react'

import { UncontrolledTooltip } from '@/components/migration-ui'

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
      popperClassName='tw:bg-white tw:border tw:border-primary/50 tw:shadow tw:px-1 tw:py-2 tw:rounded-md tw:text-[11.2px] tw:cursor-pointer'
      style={{ display: 'inline-table' }}
      innerClassName='tw:text-[11.2px] tw:bg-white tw:p-0 tw:relative'>
      {title && <p className='tw:text-[13px] tw:text-primary tw:m-0 tw:p-0 tw:font-bold tw:text-left tw:mb-2'>{title}</p>}
      {children}
    </UncontrolledTooltip>
  )
}

export default SCTooltip
