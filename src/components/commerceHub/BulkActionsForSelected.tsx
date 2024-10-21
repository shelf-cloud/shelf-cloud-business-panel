import SimpleSelect from '@components/Common/SimpleSelect'
import React, { useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'
type Props = {
  selectedRows: any[]
  clearSelected: () => void
  statusOptions: { value: string; label: string }[]
  changeSelectedStatus: (status: string) => void
}

const BulkActionsForSelected = ({ selectedRows, clearSelected, statusOptions, changeSelectedStatus }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterCommerceHubInvoicesContainer = useRef<HTMLDivElement | null>(null)
  const [selectedStatus, setselectedStatus] = useState({ value: '', label: 'Select Status' })

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterCommerceHubInvoicesContainer.current) {
          if (!FilterCommerceHubInvoicesContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  const handleApplyNewStatus = () => {
    changeSelectedStatus(selectedStatus.value)
  }

  return (
    <ButtonGroup>
      <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)}>
        <DropdownToggle caret className='fs-7'>
          <span className='fw-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
        </DropdownToggle>
        <DropdownMenu style={{ backgroundColor: 'white', minWidth: '260px', border: '1px solid #E1E3E5' }}>
          <div className={'px-4 py-3'}>
            <div className='d-flex flex-column justify-content-start gap-2'>
              <span className='fs-7 fw-normal'>Set Status:</span>
              <div className='d-flex flex-row justify-content-start gap-1'>
                <div className='flex-1'>
                  <SimpleSelect
                    selected={selectedStatus}
                    handleSelect={(option) => {
                      setselectedStatus(option)
                    }}
                    options={[{ value: '', label: 'Select Status' }, ...statusOptions]}
                  />
                </div>
                <Button disabled={selectedStatus.value === ''} size='sm' onClick={handleApplyNewStatus}>
                  Apply
                </Button>
              </div>
              <span
                style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                onClick={() => {
                  clearSelected()
                  setselectedStatus({ value: '', label: 'Select Status' })
                  setOpenDatesMenu(false)
                }}
                className='text-muted mt-2 fs-7'>
                Clear All
              </span>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}

export default BulkActionsForSelected
