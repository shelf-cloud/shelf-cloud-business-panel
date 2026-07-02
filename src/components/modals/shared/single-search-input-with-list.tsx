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
    selectText: 'text-xs',
  },
  sm: {
    selectText: 'text-sm',
  },
  base: {
    selectText: 'text-base',
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
        <div className='w-full space-y-1'>
          <PopoverTrigger id={id} asChild>
            <div className='flex w-full items-center justify-between gap-2 rounded-md border border-border bg-popover p-0 px-2'>
              <SearchIcon className='size-4 text-muted-foreground' />
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
                className='m-0 border-0 p-0 text-base shadow-none focus-visible:border-none focus-visible:ring-0'
              />
              <div className='flex items-center gap-2'>
                {inputValue && <XCircle className='size-4 opacity-50' onClick={handleClearAll} aria-label='Clear selection' />}
                <ChevronsUpDown className='size-4 opacity-50' />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            align='start'
            className='z-[1060] max-h-60 w-[var(--radix-popover-trigger-width)] overflow-y-auto p-2'
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              inputRef.current?.focus()
            }}>
            {filteredItems.length === 0 ? (
              <div className='p-2 text-sm text-muted-foreground'>{emptyMessage}</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = inputValue === item.value
                return (
                  <div
                    key={item.value}
                    className={cn('flex cursor-pointer items-center justify-between px-2 py-1', isSelected ? 'bg-muted' : '')}
                    onClick={() => handleSelect(item.value)}>
                    <div className='flex flex-1 flex-row items-center justify-start gap-2'>
                      {item.imageUrl && (
                        <div className='relative my-0.5 h-[30px] w-[30px] min-w-[30px]'>
                          <img
                            loading='lazy'
                            id={`productImage-${item.value}`}
                            src={
                              item.imageUrl ||
                              'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                            }
                            alt='Product'
                            className='h-full w-full object-contain object-center'
                          />
                        </div>
                      )}
                      <div className='flex-1'>
                        <p className='m-0 text-sm font-semibold'>{item.label}</p>
                        {item.description && (
                          <p className='m-0 line-clamp-1 max-w-11/12 break-words text-xs text-muted-foreground whitespace-normal'>{item.description}</p>
                        )}
                      </div>
                    </div>
                    <Check className={cn('ml-auto size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
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
