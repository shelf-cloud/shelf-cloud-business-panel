 
import { useContext, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import SimpleSelectWithImage, { SelectSingleValueType } from '@components/Common/SimpleSelectWithImage'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { ChevronDownIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import useSWR from 'swr'

type Channels = {
  value: string
  label: string
}

type Props = {
  selected: string
  defaultLogo: string
  setLogo: (selected: SelectSingleValueType) => void
}

const fetcher = async (endPoint: string) => {
  const data = await axios.get<{ channels: Channels[] }>(endPoint).then((res) => res.data)
  return data.channels
}

const AssignNewMarketplaceLogo = ({ selected, defaultLogo, setLogo }: Props) => {
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

  useClickOutside(AssignNewMarketplaceLogoContainer, () => setOpenDatesMenu(false))

  return (
    <DropdownMenu open={openDatesMenu} onOpenChange={(open) => { if (open !== openDatesMenu) setOpenDatesMenu(!openDatesMenu) }}>
      <DropdownMenuTrigger asChild>
        <button type='button' className='text-[11.2px]' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}>
          Logo
          <ChevronDownIcon className='ml-1 size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
        <div className='px-4 py-1'>
          <div className='flex flex-col justify-start gap-2'>
            <span className='text-[11.2px] font-normal'>Set custom Logo:</span>
            {channels ? (
              <SimpleSelectWithImage
                selected={channels.find((option) => option.value === selected) ?? { value: '', label: 'Default Logo' }}
                handleSelect={(option) => {
                  setLogo(option)
                  setOpenDatesMenu(false)
                }}
                options={[{ value: '', label: 'Default Logo', imageUrl: defaultLogo }, ...channels]}
              />
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AssignNewMarketplaceLogo
