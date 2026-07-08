import { useContext, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

type Props = {
  inventoryId?: number
  type: string
  addEndpoint: string
  selectionInfo: string[]
  selected: string
  handleSelection: (type: string, value: string) => void
  errorMessage?: string
}

const styles = {
  noError: { backgroundColor: 'white', border: '1px solid #E1E3E5', cursor: 'pointer' },
  error: { backgroundColor: 'white', border: '1px solid #f06548', cursor: 'pointer' },
}

const Select_Kit_Details = ({ inventoryId, type, addEndpoint, selectionInfo, selected, handleSelection, errorMessage }: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedOption, setSelectedOption] = useState(selected)
  const selectKitDetails = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectKitDetails, () => setOpenDatesMenu(false))

  const schema = z.object({
    name: z
      .string()
      .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(200, 'Name is to Long')
      .min(1, `Enter ${type} Name`),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const response = await axios.post(`/api/settings/${addEndpoint}?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.message)
      form.reset()
      mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
  }

  return (
    <div ref={selectKitDetails} className='relative mb-3'>
      <button type='button' className='flex w-full items-center p-0 bg-transparent rounded-md' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='flex-1 px-3 py-[0.3rem] text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span className='flex items-center justify-center px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down text-[16.25px]' />
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      {errorMessage ? (
        <p className='text-danger p-0' style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
          {errorMessage}
        </p>
      ) : null}
      <div className={'absolute z-10 mt-1 w-full pt-3 px-4 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-2 ' + (selectedOption == `${option}` ? 'font-bold' : '')}
                onClick={() => {
                  setSelectedOption(`${option}`)
                  handleSelection(type, `${option}`)
                }}>
                {`- ${option}`}
              </button>
            ))}
          </div>
          <hr className='my-2 border-[color:var(--border)]' />
          <div className='flex flex-col justify-start'>
            <div>
              <form className='flex flex-row justify-between items-center w-full gap-3 pb-2'>
                <div className='w-full'>
                  <Input
                    type='text'
                    className='text-[13px] h-8 text-xs'
                    placeholder='Name...'
                    id='name'
                    aria-invalid={(form.formState.touchedFields.name && form.formState.errors.name ? true : false) || undefined}
                    {...form.register('name')}
                  />
                </div>
                <div className='flex flex-row justify-end items-end gap-2'>
                  <Button
                    type='button'
                    onClick={(event) => {
                      event.stopPropagation()
                      form.handleSubmit(onSubmit)()
                    }}
                    size='sm'
                    className='m-0 text-nowrap'>
                    Add New
                  </Button>
                </div>
              </form>
              {form.formState.touchedFields.name && form.formState.errors.name ? (
                <span className='text-danger m-0 p-0' style={{ fontSize: '12px' }}>
                  {form.formState.errors.name.message}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Select_Kit_Details
