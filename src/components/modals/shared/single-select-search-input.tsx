'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@shadcn/ui/command'
import { Label } from '@shadcn/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Check, ChevronsUpDown, XCircle } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

export type SingleSelectItem = {
  value: string
  label: string
  description?: string
  color?: string
  icon?: React.ElementType
}

type CustomAction = {
  label: string
  onSelect: () => void
  icon?: React.ElementType
}

type SingleSelectProps = {
  ref?: React.Ref<HTMLDivElement>
  label?: string
  id?: string
  items: SingleSelectItem[]
  selected: string
  onSelectedChange: (option: string) => void
  placeholder?: string
  emptyMessage?: string
  triggerSize?: 'xs' | 'sm' | 'base'
  customActions?: CustomAction[]
  containerClassName?: string
  triggerClassName?: string
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

export function SingleSelectSearchInput({
  ref,
  label,
  id,
  items,
  selected,
  onSelectedChange,
  placeholder = 'Select items...',
  emptyMessage = 'No item found.',
  customActions,
  triggerSize = 'base',
  containerClassName = '',
  triggerClassName = '',
}: SingleSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSelect = (itemValue: string) => {
    onSelectedChange(itemValue)
    setInputValue('')
    setOpen(false)
  }

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectedChange('')
    setInputValue('')
  }

  const filterFunction = (value: string, search: string) => {
    const item = items.find((option) => option.label === value)
    if (!item) return 0

    const searchLower = search.toLowerCase()
    const labelLower = item.label.toLowerCase()
    const valueLower = item.value.toLowerCase()
    const descriptionLower = item.description?.toLowerCase() || ''

    return labelLower.includes(searchLower) || valueLower.includes(searchLower) || descriptionLower.includes(searchLower) ? 1 : 0
  }

  const selectedLabel = useMemo(() => items.find((item) => item.value === selected)?.label || '', [items, selected])

  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open && !selected && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open, selected])

  return (
    <div className={containerClassName}>
      {label ? (
        <Label className={cn(selectSizes[triggerSize].selectText)} htmlFor={id}>
          {label}
        </Label>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger id={id} asChild>
          <div
            ref={ref}
            role='combobox'
            aria-controls='singleSelect'
            aria-expanded={open}
            tabIndex={0}
            className={cn(
              'flex w-full min-w-[200px] cursor-pointer items-center justify-between rounded-md border border-border bg-transparent px-3 py-2',
              triggerClassName
            )}>
            <span className={cn(selectSizes[triggerSize].selectText, selected ? 'font-normal' : 'text-muted-foreground')}>{selected ? selectedLabel : placeholder}</span>
            <div className='flex items-center gap-2'>
              {selected && <XCircle className='size-4 opacity-50' onClick={handleClearAll} aria-label='Clear selection' />}
              <ChevronsUpDown className='size-4 opacity-50' />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align='start' className='z-[1060] w-[var(--radix-popover-trigger-width)] p-0'>
          <Command filter={filterFunction}>
            <CommandInput ref={inputRef} autoFocus placeholder='Search...' value={inputValue} onValueChange={setInputValue} className='text-base' />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem key={item.value} value={item.label} onSelect={() => handleSelect(item.value)}>
                    <div className='flex w-full flex-row items-center justify-between gap-1'>
                      <div className='flex flex-1 flex-col items-start justify-start gap-0'>
                        <p className='m-0'>{item.label}</p>
                        {item.description && (
                          <p className='m-0 line-clamp-1 w-11/12 break-words text-xs text-muted-foreground whitespace-normal'>{item.description}</p>
                        )}
                      </div>
                      <Check className={cn('ml-auto', selected === item.value ? 'opacity-100' : 'opacity-0')} />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {customActions && customActions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    {customActions.map((action, index) => {
                      const ActionIcon = action.icon
                      return (
                        <CommandItem
                          key={`custom-action-${index}`}
                          value={action.label}
                          onSelect={() => {
                            action.onSelect()
                            setOpen(false)
                          }}>
                          {ActionIcon && <ActionIcon className='mr-2 h-4 w-4' />}
                          {action.label}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
