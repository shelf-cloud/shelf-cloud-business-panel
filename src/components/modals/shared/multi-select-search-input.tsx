'use client'

import * as React from 'react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@shadcn/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/ui/popover'
import { Check, ChevronsUpDown, XCircle } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

import { MultiSelectTag } from './multi-select-tag'

export type MultiSelectItem = {
  value: string
  label: string
  color?: string
  icon?: React.ElementType
}

type CustomAction = {
  label: string
  onSelect: () => void
  icon?: React.ElementType
}

type MultiSelectSearchInputProps = {
  items: MultiSelectItem[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  placeholder?: string
  emptyMessage?: string
  maxDisplayItems?: number
  customActions?: CustomAction[]
  searchPlaceholder?: string
  triggerClassName?: string
  popoverClassName?: string
}

const MultiSelectSearchInput = ({
  items,
  selected,
  onSelectedChange,
  placeholder = 'Select items...',
  emptyMessage = 'No item found.',
  maxDisplayItems = 2,
  customActions,
  searchPlaceholder = 'Search items...',
  triggerClassName,
  popoverClassName,
}: MultiSelectSearchInputProps) => {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = (itemValue: string) => {
    const newSelected = selected.includes(itemValue) ? selected.filter((value) => value !== itemValue) : [...selected, itemValue]
    onSelectedChange(newSelected)
    setInputValue('')
  }

  const handleRemove = (itemValue: string) => {
    onSelectedChange(selected.filter((value) => value !== itemValue))
  }

  const handleClearAll = (event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectedChange([])
    setInputValue('')
  }

  const selectedItems = selected.map((value) => items.find((item) => item.value === value)).filter(Boolean) as MultiSelectItem[]
  const displayItems = selectedItems.slice(0, maxDisplayItems)
  const overflowCount = selectedItems.length - maxDisplayItems

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role='combobox'
          aria-controls='skuMultiSelect'
          aria-expanded={open}
          tabIndex={0}
          className={cn(
            'tw:flex tw:min-h-8 tw:w-full tw:cursor-pointer tw:items-center tw:justify-between tw:rounded-md tw:border tw:border-border tw:bg-white tw:px-3 tw:py-1.5 tw:text-sm tw:shadow-xs tw:outline-none tw:transition-colors tw:focus-visible:shadow-[0_0_0_3px_var(--ring)]',
            triggerClassName
          )}>
          <div className='tw:flex tw:flex-grow tw:flex-wrap tw:gap-1'>
            {selectedItems.length > 0 ? (
              <>
                {displayItems.map((item) => (
                  <MultiSelectTag key={item.value} label={item.label} onRemove={() => handleRemove(item.value)} color={item.color} icon={item.icon} />
                ))}
                {overflowCount > 0 && <MultiSelectTag label={`+${overflowCount} more`} onRemove={() => undefined} />}
              </>
            ) : (
              <span className='tw:text-sm tw:font-normal tw:text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <div className='tw:flex tw:items-center tw:gap-1'>
            {selected.length > 0 && (
              <button
                type='button'
                className='tw:inline-flex tw:size-6 tw:shrink-0 tw:appearance-none tw:items-center tw:justify-center tw:rounded-full tw:border-0 tw:bg-transparent tw:p-0 tw:text-muted-foreground tw:outline-none tw:ring-0 tw:hover:bg-muted tw:hover:text-foreground tw:focus-visible:shadow-[0_0_0_2px_var(--ring)]'
                onClick={handleClearAll}
                aria-label='Clear all selections'>
                <XCircle className='tw:size-4' />
              </button>
            )}
            <ChevronsUpDown className='tw:size-4 tw:shrink-0 tw:text-muted-foreground tw:opacity-70' />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className={cn(
          'tw:z-[1060] tw:w-[var(--radix-popover-trigger-width)] tw:overflow-hidden tw:rounded-md tw:border tw:border-border tw:bg-white tw:p-0 tw:shadow-lg',
          popoverClassName
        )}>
        <Command className='tw:bg-white tw:text-foreground tw:[&_[data-slot=command-input-wrapper]]:h-9 tw:[&_[data-slot=command-input-wrapper]]:border-b tw:[&_[data-slot=command-input-wrapper]]:border-border tw:[&_[data-slot=command-input-wrapper]]:px-3 tw:[&_[data-slot=command-input-wrapper]_svg]:size-4 tw:[&_[data-slot=command-input-wrapper]_svg]:text-muted-foreground tw:[&_[data-slot=command-input]]:!h-9 tw:[&_[data-slot=command-input]]:!border-0 tw:[&_[data-slot=command-input]]:!bg-transparent tw:[&_[data-slot=command-input]]:!p-0 tw:[&_[data-slot=command-input]]:!text-sm tw:[&_[data-slot=command-input]]:!shadow-none tw:[&_[data-slot=command-input]]:!outline-none tw:[&_[data-slot=command-input]]:placeholder:text-muted-foreground tw:[&_[data-slot=command-input]]:focus:!border-0 tw:[&_[data-slot=command-input]]:focus:!shadow-none tw:[&_[data-slot=command-input]]:focus:!outline-none'>
          <CommandInput placeholder={searchPlaceholder} value={inputValue} onValueChange={setInputValue} />
          <CommandList className='tw:max-h-64'>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className='tw:p-1'>
              {items.map((item) => (
                <CommandItem
                  key={`item-${item.value}-${item.label}`}
                  value={item.label}
                  className='tw:h-8 tw:cursor-pointer tw:px-2 tw:py-1 tw:text-sm'
                  onSelect={() => handleSelect(item.value)}>
                  <Check className={cn('tw:mr-2 tw:h-4 tw:w-4', selected.includes(item.value) ? 'tw:opacity-100' : 'tw:opacity-0')} />
                  <span className='tw:truncate'>{item.label}</span>
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
  )
}

export default MultiSelectSearchInput
