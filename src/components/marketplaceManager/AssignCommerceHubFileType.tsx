 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { ChevronDownIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

type Props = {
  selected: SelectSingleValueType
  setSelected: (selected: SelectSingleValueType) => void
  options: SelectOptionType[]
}

const AssignCommerceHubFileType = ({ selected, setSelected, options }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const AssignCommerceHubFileTypeContainer = useRef<HTMLDivElement | null>(null)

  useClickOutside(AssignCommerceHubFileTypeContainer, () => setIsDialogOpen(false))

  return (
    <DropdownMenu open={isDialogOpen} onOpenChange={(open) => { if (open !== isDialogOpen) setIsDialogOpen(!isDialogOpen) }}>
      <DropdownMenuTrigger asChild>
        <button type='button' className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-[11.2px] text-xs font-medium' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}>
          File
          <ChevronDownIcon className='ml-1 size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
        <div className='px-4 py-1'>
          <div className='flex flex-col justify-start gap-2'>
            <SimpleSelect
              selected={selected}
              handleSelect={(option) => {
                setSelected(option)
                setIsDialogOpen(false)
              }}
              options={options}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AssignCommerceHubFileType
