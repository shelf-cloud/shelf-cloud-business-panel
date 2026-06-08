'use client'

import type * as React from 'react'

import { X } from 'lucide-react'

type MultiSelectTagProps = {
  label: string
  onRemove: () => void
  color?: string
  icon?: React.ElementType
}

export function MultiSelectTag({ label, onRemove, color, icon: Icon }: MultiSelectTagProps) {
  return (
    <span className='tw:inline-flex tw:h-7 tw:max-w-full tw:items-center tw:gap-1 tw:rounded-full tw:bg-primary tw:px-2.5 tw:py-0.5 tw:text-sm tw:font-medium tw:text-primary-foreground'>
      {Icon ? <Icon className='tw:size-4' /> : color ? <div className='tw:h-2 tw:w-2 tw:rounded-full' style={{ backgroundColor: color }} /> : null}
      <span className='tw:max-w-40 tw:truncate tw:leading-none tw:text-xs'>{label}</span>
      <button
        type='button'
        className='tw:inline-flex tw:size-4 tw:appearance-none tw:items-center tw:justify-center tw:rounded-full tw:border-0 tw:bg-transparent tw:p-0 tw:text-primary-foreground/80 tw:outline-none tw:ring-0 tw:hover:bg-primary-foreground/20 tw:hover:text-primary-foreground tw:focus-visible:shadow-[0_0_0_2px_var(--primary-foreground)]'
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${label}`}>
        <X className='tw:size-3.5' />
      </button>
    </span>
  )
}
