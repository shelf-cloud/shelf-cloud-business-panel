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
            'flex min-h-8 w-full cursor-pointer items-center justify-between rounded-md border border-border bg-white px-3 py-1.5 text-sm shadow-xs outline-none transition-colors focus-visible:shadow-[0_0_0_3px_var(--ring)]',
            triggerClassName
          )}>
          <div className='flex flex-grow flex-wrap gap-1'>
            {selectedItems.length > 0 ? (
              <>
                {displayItems.map((item) => (
                  <MultiSelectTag key={item.value} label={item.label} onRemove={() => handleRemove(item.value)} color={item.color} icon={item.icon} />
                ))}
                {overflowCount > 0 && <MultiSelectTag label={`+${overflowCount} more`} onRemove={() => undefined} />}
              </>
            ) : (
              <span className='text-sm font-normal text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            {selected.length > 0 && (
              <button
                type='button'
                className='inline-flex size-6 shrink-0 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground outline-none ring-0 hover:bg-muted hover:text-foreground focus-visible:shadow-[0_0_0_2px_var(--ring)]'
                onClick={handleClearAll}
                aria-label='Clear all selections'>
                <XCircle className='size-4' />
              </button>
            )}
            <ChevronsUpDown className='size-4 shrink-0 text-muted-foreground opacity-70' />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className={cn(
          'z-[1060] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-white p-0 shadow-lg',
          popoverClassName
        )}>
        <Command className='bg-white text-foreground [&_[data-slot=command-input-wrapper]]:h-9 [&_[data-slot=command-input-wrapper]]:border-b [&_[data-slot=command-input-wrapper]]:border-border [&_[data-slot=command-input-wrapper]]:px-3 [&_[data-slot=command-input-wrapper]_svg]:size-4 [&_[data-slot=command-input-wrapper]_svg]:text-muted-foreground [&_[data-slot=command-input]]:!h-9 [&_[data-slot=command-input]]:!border-0 [&_[data-slot=command-input]]:!bg-transparent [&_[data-slot=command-input]]:!p-0 [&_[data-slot=command-input]]:!text-sm [&_[data-slot=command-input]]:!shadow-none [&_[data-slot=command-input]]:!outline-none [&_[data-slot=command-input]]:placeholder:text-muted-foreground [&_[data-slot=command-input]]:focus:!border-0 [&_[data-slot=command-input]]:focus:!shadow-none [&_[data-slot=command-input]]:focus:!outline-none'>
          <CommandInput placeholder={searchPlaceholder} value={inputValue} onValueChange={setInputValue} />
          <CommandList className='max-h-64'>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className='p-1'>
              {items.map((item) => (
                <CommandItem
                  key={`item-${item.value}-${item.label}`}
                  value={item.label}
                  className='h-8 cursor-pointer px-2 py-1 text-sm'
                  onSelect={() => handleSelect(item.value)}>
                  <Check className={cn('mr-2 h-4 w-4', selected.includes(item.value) ? 'opacity-100' : 'opacity-0')} />
                  <span className='truncate'>{item.label}</span>
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
  )
}

export default MultiSelectSearchInput
