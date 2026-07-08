import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'
import { useForm } from 'react-hook-form'

import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'

type Props = {
  filters: string
  showHidden: string
  showNotEnough: string
  ShowNoShipDate: string
  masterBoxVisibility?: string
}

type FilterFormValues = {
  filters: string
  showHidden: string
  showNotEnough: string
  ShowNoShipDate: string
  masterBoxVisibility?: string
}

const FilterListings = ({ filters, showHidden, showNotEnough, ShowNoShipDate, masterBoxVisibility }: Props) => {
  const router = useRouter()
  const [OpenFilters, setOpenFilters] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  const initialValues: FilterFormValues = {
    filters: filters,
    showHidden: showHidden,
    showNotEnough: showNotEnough,
    ShowNoShipDate: ShowNoShipDate,
    masterBoxVisibility: masterBoxVisibility,
  }

  const form = useForm<FilterFormValues>({
    defaultValues: initialValues,
  })
  const { watch, setValue } = form
  const values = watch()

  useClickOutside(filterByOthersContainer, () => setOpenFilters(false))

  const handleApplyFilters = (showHidden: string, showNotEnough: string, ShowNoShipDate: string, masterBoxVisibility: string) => {
    let filterString = `/amazon-sellers/fulfillment/sendToAmazon?filters=true`
    if (showHidden || showHidden !== '') filterString += `&showHidden=${showHidden}`
    if (showNotEnough || showNotEnough !== '') filterString += `&showNotEnough=${showNotEnough}`
    if (ShowNoShipDate || ShowNoShipDate !== '') filterString += `&ShowNoShipDate=${ShowNoShipDate}`
    if (masterBoxVisibility || masterBoxVisibility !== '') filterString += `&masterBoxVisibility=${masterBoxVisibility}`
    router.push(filterString, undefined, { shallow: true })
  }

  const handleSubmit = async (values: any) => {
    handleApplyFilters(values.showHidden, values.showNotEnough, values.ShowNoShipDate, values.masterBoxVisibility)
    setOpenFilters(false)
  }

  const handleClearFilters = () => {
    form.reset({
      filters: values.filters,
      showHidden: '',
      showNotEnough: '',
      ShowNoShipDate: '',
      masterBoxVisibility: '',
    })
    router.push(`/amazon-sellers/fulfillment/sendToAmazon`, undefined, { shallow: true })
    setOpenFilters(false)
  }

  return (
    <div
      ref={filterByOthersContainer}
      className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <div className='relative'>
        <Button
          variant={filters === 'true' ? 'info' : 'light'}
          className='text-[11.2px]'
          type='button'
          aria-expanded='false'
          onClick={() => setOpenFilters(!OpenFilters)}>
          Filters
        </Button>
        <div className={'absolute z-10 mt-1 px-6 py-4 bg-white border rounded-md shadow ' + (OpenFilters ? 'block' : 'hidden')}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className='flex flex-col justify-start gap-4'>
              <div className='flex flex-row justify-start items-end gap-2'>
                <Label className='font-normal text-[11.2px] w-3/4'>Show hidden products</Label>
                <Switch
                  id='showHidden'
                  name='showHidden'
                  checked={values.showHidden === 'true' ? true : false}
                  onChange={(e) => {
                    setValue('showHidden', `${e.target.checked}`)
                  }}
                  onBlur={() => {}}
                />
              </div>
              {masterBoxVisibility && (
                <div className='flex flex-row justify-start items-end gap-2'>
                  <Label className='font-normal text-[11.2px] w-3/4'>Show hidden visibility in Master Boxes</Label>
                  <Switch
                    id='masterBoxVisibility'
                    name='masterBoxVisibility'
                    checked={values.masterBoxVisibility === 'true' ? true : false}
                    onChange={(e) => {
                      setValue('masterBoxVisibility', `${e.target.checked}`)
                    }}
                    onBlur={() => {}}
                  />
                </div>
              )}
              <div className='flex flex-row justify-start items-end gap-2'>
                <Label className='font-normal text-[11.2px] w-3/4'>Show With Not Enough Qty</Label>
                <Switch
                  id='showNotEnough'
                  name='showNotEnough'
                  checked={values.showNotEnough === 'true' ? true : false}
                  onChange={(e) => {
                    setValue('showNotEnough', `${e.target.checked}`)
                  }}
                  onBlur={() => {}}
                />
              </div>
              <div className='flex flex-row justify-start items-end gap-2'>
                <Label className='font-normal text-[11.2px] w-3/4'>Show With No Recommended Ship Date</Label>
                <Switch
                  id='ShowNoShipDate'
                  name='ShowNoShipDate'
                  checked={values.ShowNoShipDate === 'true' ? true : false}
                  onChange={(e) => {
                    setValue('ShowNoShipDate', `${e.target.checked}`)
                  }}
                  onBlur={() => {}}
                />
              </div>
            </div>
            <div className='w-full flex justify-between items-center mt-6'>
              <button
                type='button'
                onClick={() => handleClearFilters()}
                className='p-0 border-0 bg-transparent no-underline font-normal m-0 text-[11.2px] text-muted-foreground'>
                Clear All
              </button>
              <Button type='submit' size='sm'>
                Apply
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FilterListings
