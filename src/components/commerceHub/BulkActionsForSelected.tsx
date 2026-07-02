import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import { Button, ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

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
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret className='tw:text-[11.2px]'>
          <span className='tw:font-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '260px', border: '1px solid #E1E3E5' }}>
          <div className={'tw:px-6 tw:py-4'}>
            <div className='tw:flex tw:flex-col tw:justify-start tw:gap-2'>
              <span className='tw:text-[11.2px] tw:font-normal'>Set Status:</span>
              <div className='tw:flex tw:flex-row tw:justify-start tw:gap-1'>
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
                className='btn btn-link tw:p-0 tw:border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:mt-2 tw:text-[11.2px]'>
                Clear All
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default BulkActionsForSelected
