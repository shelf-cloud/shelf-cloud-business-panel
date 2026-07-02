 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { Dropdown, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

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
    <Dropdown isOpen={isDialogOpen} toggle={() => setIsDialogOpen(!isDialogOpen)} direction='end'>
      <DropdownToggle caret className='text-[11.2px]' size='sm' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
        File
      </DropdownToggle>
      <DropdownMenu container={'body'} style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
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
      </DropdownMenu>
    </Dropdown>
  )
}

export default AssignCommerceHubFileType
