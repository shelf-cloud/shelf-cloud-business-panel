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
    selectText: 'tw:text-xs',
  },
  sm: {
    selectText: 'tw:text-sm',
  },
  base: {
    selectText: 'tw:text-base',
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
              'tw:flex tw:w-full tw:min-w-[200px] tw:cursor-pointer tw:items-center tw:justify-between tw:rounded-md tw:border tw:border-border tw:bg-transparent tw:px-3 tw:py-2',
              triggerClassName
            )}>
            <span className={cn(selectSizes[triggerSize].selectText, selected ? 'tw:font-normal' : 'tw:text-muted-foreground')}>{selected ? selectedLabel : placeholder}</span>
            <div className='tw:flex tw:items-center tw:gap-2'>
              {selected && <XCircle className='tw:size-4 tw:opacity-50' onClick={handleClearAll} aria-label='Clear selection' />}
              <ChevronsUpDown className='tw:size-4 tw:opacity-50' />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align='start' className='tw:z-[1060] tw:w-[var(--radix-popover-trigger-width)] tw:p-0'>
          <Command filter={filterFunction}>
            <CommandInput ref={inputRef} autoFocus placeholder='Search...' value={inputValue} onValueChange={setInputValue} className='tw:text-base' />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem key={item.value} value={item.label} onSelect={() => handleSelect(item.value)}>
                    <div className='tw:flex tw:w-full tw:flex-row tw:items-center tw:justify-between tw:gap-1'>
                      <div className='tw:flex tw:flex-1 tw:flex-col tw:items-start tw:justify-start tw:gap-0'>
                        <p className='tw:m-0'>{item.label}</p>
                        {item.description && (
                          <p className='tw:m-0 tw:line-clamp-1 tw:w-11/12 tw:break-words tw:text-xs tw:text-muted-foreground tw:whitespace-normal'>{item.description}</p>
                        )}
                      </div>
                      <Check className={cn('tw:ml-auto', selected === item.value ? 'tw:opacity-100' : 'tw:opacity-0')} />
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
                          {ActionIcon && <ActionIcon className='tw:mr-2 tw:h-4 tw:w-4' />}
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
