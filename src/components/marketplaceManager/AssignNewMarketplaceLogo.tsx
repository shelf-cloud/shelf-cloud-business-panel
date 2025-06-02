/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'
import useSWR from 'swr'

type Channels = {
  value: string
  label: string
}

type Props = {
  selected: string
  setLogo: (selected: SelectSingleValueType) => void
}

const fetcher = async (endPoint: string) => {
  const data = await axios.get<{ channels: Channels[] }>(endPoint).then((res) => res.data)
  return data.channels
}

const AssignNewMarketplaceLogo = ({ selected, setLogo }: Props) => {
  const { state }: any = useContext(AppContext)
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const AssignNewMarketplaceLogoContainer = useRef<HTMLDivElement | null>(null)

  const { data: channels } = useSWR(
    state.user.businessId ? `/api/marketplaces/getStoreChannels?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (AssignNewMarketplaceLogoContainer.current) {
          if (!AssignNewMarketplaceLogoContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <Dropdown isOpen={openDatesMenu} toggle={() => setOpenDatesMenu(!openDatesMenu)} direction='end'>
      <DropdownToggle size='sm' caret className='fs-7' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
        Logo
      </DropdownToggle>
      <DropdownMenu container={'body'} style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
        <div className={'px-3 py-1'}>
          <div className='d-flex flex-column justify-content-start gap-2'>
            <span className='fs-7 fw-normal'>Set custom Logo:</span>
            {channels ? (
              <SimpleSelect
                selected={channels.find((option) => option.value === selected) ?? { value: '', label: 'Default Logo' }}
                handleSelect={(option) => {
                  setLogo(option)
                  setOpenDatesMenu(false)
                }}
                options={[{ value: '', label: 'Default Logo' }, ...channels]}
              />
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default AssignNewMarketplaceLogo
