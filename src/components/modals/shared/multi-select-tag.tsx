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
    <span className='inline-flex h-7 max-w-full items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-primary-foreground'>
      {Icon ? <Icon className='size-4' /> : color ? <div className='h-2 w-2 rounded-full' style={{ backgroundColor: color }} /> : null}
      <span className='max-w-40 truncate leading-none text-xs'>{label}</span>
      <button
        type='button'
        className='inline-flex size-4 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary-foreground/80 outline-none ring-0 hover:bg-primary-foreground/20 hover:text-primary-foreground focus-visible:shadow-[0_0_0_2px_var(--primary-foreground)]'
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${label}`}>
        <X className='size-3.5' />
      </button>
    </span>
  )
}
