import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import { ChevronDownIcon } from 'lucide-react'
import { Button, buttonVariants } from '@shadcn/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { cn } from '@/lib/shadcn/utils'

type Props = {
  selectedRows: any[]
  clearSelected: () => void
  statusOptions: { value: string; label: string }[]
  changeSelectedStatus: (status: string) => void
}

const BulkActionsForSelected = ({ selectedRows, clearSelected, statusOptions, changeSelectedStatus }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterCommerceHubInvoicesContainer = useRef<HTMLDivElement | null>(null)
  const [selectedStatus, setselectedStatus] = useState<SelectSingleValueType>({ value: '', label: 'Select Status' })

  useClickOutside(FilterCommerceHubInvoicesContainer, () => setOpenDatesMenu(false))

  const handleApplyNewStatus = () => {
    changeSelectedStatus(String(selectedStatus!.value))
  }

  return (
    <div role='group' className='inline-flex'>
      <DropdownMenu open={openDatesMenu} onOpenChange={(open) => { if (open !== openDatesMenu) setOpenDatesMenu(!openDatesMenu) }}>
        <DropdownMenuTrigger asChild>
          <button type='button' className='text-[11.2px]'>
            <span className='font-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
            <ChevronDownIcon className='ml-1 size-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' style={{ backgroundColor: 'white', minWidth: '260px', border: '1px solid #E1E3E5' }}>
          <div className={'px-6 py-4'}>
            <div className='flex flex-col justify-start gap-2'>
              <span className='text-[11.2px] font-normal'>Set Status:</span>
              <div className='flex flex-row justify-start gap-1'>
                <div className='flex-1'>
                  <SimpleSelect
                    selected={selectedStatus}
                    handleSelect={(option) => {
                      setselectedStatus(option)
                    }}
                    options={[{ value: '', label: 'Select Status' }, ...statusOptions]}
                  />
                </div>
                <Button disabled={selectedStatus!.value === ''} size='sm' onClick={handleApplyNewStatus}>
                  Apply
                </Button>
              </div>
              <button
                type='button'
                style={{ width: '100%', textAlign: 'right' }}
                onClick={() => {
                  clearSelected()
                  setselectedStatus({ value: '', label: 'Select Status' })
                  setOpenDatesMenu(false)
                }}
                className={cn(buttonVariants({ variant: 'link' }), 'p-0 border-0 no-underline text-muted-foreground mt-2 text-[11.2px]')}>
                Clear All
              </button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default BulkActionsForSelected
