import React from 'react'
import { UncontrolledTooltip } from 'reactstrap'

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
      popperClassName='bg-white border border-primary border-opacity-50 shadow px-1 py-2 rounded-2 fs-7'
      style={{ display: 'inline-table' }}
      innerClassName='fs-7 bg-white p-0 position-relative'>
      {title && <p className='fs-6 text-primary m-0 p-0 fw-bold text-start mb-2'>{title}</p>}
      {children}
    </UncontrolledTooltip>
  )
}

export default SCTooltip
