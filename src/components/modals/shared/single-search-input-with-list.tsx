'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Check, ChevronsUpDown, SearchIcon, XCircle } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

/* eslint-disable @next/next/no-img-element */

export type SingleSearchWithListItem = {
  value: string
  label: string
  description?: string
  imageUrl?: string
}

export type SingleSearchWithListCustomAction = {
  label: string
  onSelect: () => void
  icon?: React.ElementType
}

type Props = {
  ref?: React.Ref<HTMLDivElement>
  label?: string
  id?: string
  items: SingleSearchWithListItem[]
  selected: string
  onSelectedChange: (newValue: string) => boolean
  onListSelected: (itemValue: string) => string
  debounceMs?: number
  placeholder?: string
  emptyMessage?: string
  triggerSize?: 'xs' | 'sm' | 'base'
  customActions?: SingleSearchWithListCustomAction[]
  containerClassName?: string
}

const selectSizes = {
  xs: {
    selectText: 'tw:text-xs',
  },
  sm: {
    selectText: 'tw:text-sm',
  },
  base: {
    selectText: 'tw:text-base',
  },
}

const SingleSearchInputWithList = ({
  ref,
  label,
  id,
  items,
  selected,
  onSelectedChange,
  onListSelected,
  debounceMs = 300,
  placeholder,
  emptyMessage = 'No item found.',
  triggerSize = 'base',
  containerClassName,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(selected)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSelectedChange = (newValue: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const close = onSelectedChange(newValue)
      if (close) setOpen(false)
    }, debounceMs)
  }

  const handleSelect = (itemValue: string) => {
    setOpen(false)
    const value = onListSelected(itemValue)
    setInputValue(value)
  }

  const handleClearAll = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    onSelectedChange('')
    setInputValue('')
    setOpen(false)
  }

  const filteredItems = useMemo(() => {
    if (inputValue === '') {
      return items
    }

    const searchLower = inputValue.toLowerCase()

    return items.filter((item) => {
      const labelLower = item.label.toLowerCase()
      const valueLower = item.value.toLowerCase()
      const descriptionLower = item.description?.toLowerCase() || ''

      return labelLower.includes(searchLower) || valueLower.includes(searchLower) || searchLower.split(' ').every((word) => descriptionLower.includes(word.toLowerCase()))
    })
  }, [items, inputValue])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setInputValue(selected)
  }, [selected])

  useEffect(() => {
    if (!selected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selected])

  return (
    <div ref={ref} className={containerClassName}>
      {label ? (
        <Label className={cn(selectSizes[triggerSize].selectText)} htmlFor={id}>
          {label}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <div className='tw:w-full tw:space-y-1'>
          <PopoverTrigger id={id} asChild>
            <div className='tw:flex tw:w-full tw:items-center tw:justify-between tw:gap-2 tw:rounded-md tw:border tw:border-border tw:bg-popover tw:p-0 tw:px-2'>
              <SearchIcon className='tw:size-4 tw:text-muted-foreground' />
              <Input
                style={{ backgroundColor: 'transparent' }}
                ref={inputRef}
                inputMode='search'
                type='text'
                placeholder={placeholder}
                value={inputValue}
                onChange={(event) => {
                  setInputValue(event.target.value)
                  scheduleSelectedChange(event.target.value)
                }}
                onKeyDown={(event) => event.stopPropagation()}
                onKeyUp={() => null}
                className='tw:m-0 tw:border-0 tw:p-0 tw:text-base tw:shadow-none tw:focus-visible:border-none tw:focus-visible:ring-0'
              />
              <div className='tw:flex tw:items-center tw:gap-2'>
                {inputValue && <XCircle className='tw:size-4 tw:opacity-50' onClick={handleClearAll} aria-label='Clear selection' />}
                <ChevronsUpDown className='tw:size-4 tw:opacity-50' />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            align='start'
            className='tw:z-[1060] tw:max-h-60 tw:w-[var(--radix-popover-trigger-width)] tw:overflow-y-auto tw:p-2'
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              inputRef.current?.focus()
            }}>
            {filteredItems.length === 0 ? (
              <div className='tw:p-2 tw:text-sm tw:text-muted-foreground'>{emptyMessage}</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = inputValue === item.value
                return (
                  <div
                    key={item.value}
                    className={cn('tw:flex tw:cursor-pointer tw:items-center tw:justify-between tw:px-2 tw:py-1', isSelected ? 'tw:bg-muted' : '')}
                    onClick={() => handleSelect(item.value)}>
                    <div className='tw:flex tw:flex-1 tw:flex-row tw:items-center tw:justify-start tw:gap-2'>
                      {item.imageUrl && (
                        <div className='tw:relative tw:my-0.5 tw:h-[30px] tw:w-[30px] tw:min-w-[30px]'>
                          <img
                            loading='lazy'
                            id={`productImage-${item.value}`}
                            src={
                              item.imageUrl ||
                              'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                            }
                            alt='Product'
                            className='tw:h-full tw:w-full tw:object-contain tw:object-center'
                          />
                        </div>
                      )}
                      <div className='tw:flex-1'>
                        <p className='tw:m-0 tw:text-sm tw:font-semibold'>{item.label}</p>
                        {item.description && (
                          <p className='tw:m-0 tw:line-clamp-1 tw:max-w-11/12 tw:break-words tw:text-xs tw:text-muted-foreground tw:whitespace-normal'>{item.description}</p>
                        )}
                      </div>
                    </div>
                    <Check className={cn('tw:ml-auto tw:size-4', isSelected ? 'tw:opacity-100' : 'tw:opacity-0')} />
                  </div>
                )
              })
            )}
          </PopoverContent>
        </div>
      </Popover>
    </div>
  )
}

export default SingleSearchInputWithList
