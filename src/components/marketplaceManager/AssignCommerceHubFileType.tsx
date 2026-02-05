 
import { useEffect, useRef, useState } from 'react'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

type Props = {
  selected: SelectSingleValueType
  setSelected: (selected: SelectSingleValueType) => void
  options: SelectOptionType[]
}

const AssignCommerceHubFileType = ({ selected, setSelected, options }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const AssignCommerceHubFileTypeContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (AssignCommerceHubFileTypeContainer.current) {
          if (!AssignCommerceHubFileTypeContainer.current.contains(e.target)) {
            setIsDialogOpen(false)
          }
        }
      })
    }
  }, [])

  return (
    <Dropdown isOpen={isDialogOpen} toggle={() => setIsDialogOpen(!isDialogOpen)} direction='end'>
      <DropdownToggle caret className='fs-7' size='sm' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
        File
      </DropdownToggle>
      <DropdownMenu container={'body'} style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
        <div className={'px-3 py-1'}>
          <div className='d-flex flex-column justify-content-start gap-2'>
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
