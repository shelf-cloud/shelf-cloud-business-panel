import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Switch } from '@/components/ui/Switch'

import SelectDropDown from './SelectDropDown'

type Props = {
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsmin: string
  unitsmax: string
  supplier: string
  brand: string
  category: string
  showWithSales: string
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    showWithSales: string
  ) => void
  setFilterOpen: (value: boolean) => void
  destination: string
}

const numberMinSchema = z.string().refine((value) => value === '' || Number(value) >= 0, 'Must be greater than 0')

const filterProfitsSchema = z.object({
  grossRevenueMin: numberMinSchema,
  grossRevenueMax: numberMinSchema,
  netProfitMin: z.string(),
  netProfitMax: z.string(),
  unitsSoldMin: z.string(),
  unitsSoldMax: z.string(),
  supplier: z.string(),
  brand: z.string(),
  category: z.string(),
  showWithSales: z.string(),
})

type FilterProfitsForm = z.infer<typeof filterProfitsSchema>

const FilterProfits = ({
  grossmin,
  grossmax,
  profitmin,
  profitmax,
  unitsmin,
  unitsmax,
  supplier,
  brand,
  category,
  showWithSales,
  supplierOptions,
  brandOptions,
  categoryOptions,
  handleApplyFilters,
  setFilterOpen,
  destination,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()

  const validation = useForm<FilterProfitsForm>({
    resolver: zodResolver(filterProfitsSchema),
    defaultValues: {
      grossRevenueMin: grossmin,
      grossRevenueMax: grossmax,
      netProfitMin: profitmin,
      netProfitMax: profitmax,
      unitsSoldMin: unitsmin,
      unitsSoldMax: unitsmax,
      supplier: supplier,
      brand: brand,
      category: category,
      showWithSales: showWithSales,
    },
  })

  const values = validation.watch()

  const onSubmit = async (values: FilterProfitsForm) => {
    handleApplyFilters(
      values.grossRevenueMin,
      values.grossRevenueMax,
      values.netProfitMin,
      values.netProfitMax,
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
      values.brand,
      values.category,
      values.showWithSales
    )
  }

  const handleClearFilters = () => {
    validation.reset({
      grossRevenueMin: '',
      grossRevenueMax: '',
      netProfitMin: '',
      netProfitMax: '',
      unitsSoldMin: '',
      unitsSoldMax: '',
      supplier: '',
      brand: '',
      category: '',
      showWithSales: 'true',
    })
    router.push(`/marketplaces/${destination}`, undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <div>
      <form onSubmit={validation.handleSubmit(onSubmit)}>
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Gross Revenue
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                  <Input
                    type='number'
                    className='text-[13px] m-0 h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='grossRevenueMin'
                    min={0}
                    aria-invalid={Boolean(validation.formState.errors.grossRevenueMin) || undefined}
                    {...validation.register('grossRevenueMin')}
                  />
                </InputGroup>
                <InputGroup size='sm'>
                  <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                  <Input
                    type='number'
                    className='text-[13px] m-0 h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='grossRevenueMax'
                    min={values.grossRevenueMin}
                    aria-invalid={Boolean(validation.formState.errors.grossRevenueMax) || undefined}
                    {...validation.register('grossRevenueMax')}
                  />
                </InputGroup>
              </div>
            </div>
          </div>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Net Profit
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <InputGroup size='sm'>
                  <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                  <Input
                    type='number'
                    className='text-[13px] m-0 h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='netProfitMin'
                    min={0}
                    aria-invalid={Boolean(validation.formState.errors.netProfitMin) || undefined}
                    {...validation.register('netProfitMin')}
                  />
                </InputGroup>
                <InputGroup size='sm'>
                  <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                  <Input
                    type='number'
                    className='text-[13px] m-0 h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='netProfitMax'
                    min={values.grossRevenueMin}
                    aria-invalid={Boolean(validation.formState.errors.netProfitMax) || undefined}
                    {...validation.register('netProfitMax')}
                  />
                </InputGroup>
              </div>
            </div>
          </div>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Units Sold
              </Label>
              <div className='flex flex-row justify-between items-center gap-2'>
                <Input
                  type='number'
                  className='text-[13px] m-0 h-8 text-xs'
                  style={{ padding: '0.2rem 0.9rem' }}
                  placeholder='Min'
                  id='unitsSoldMin'
                  min={0}
                  aria-invalid={Boolean(validation.formState.errors.unitsSoldMin) || undefined}
                  {...validation.register('unitsSoldMin')}
                />
                <Input
                  type='number'
                  className='text-[13px] m-0 h-8 text-xs'
                  style={{ padding: '0.2rem 0.9rem' }}
                  placeholder='Max'
                  id='unitsSoldMax'
                  min={values.grossRevenueMin}
                  aria-invalid={Boolean(validation.formState.errors.unitsSoldMax) || undefined}
                  {...validation.register('unitsSoldMax')}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap -mx-3 mt-2'>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Suppliers
              </Label>
              <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={(field, value) => validation.setValue(field as any, value)} />
            </div>
          </div>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Brands
              </Label>
              <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={(field, value) => validation.setValue(field as any, value)} />
            </div>
          </div>
          <div className='px-3 md:w-3/12'>
            <div className='mb-3 createOrder_inputs'>
              <Label htmlFor='lastNameinput'>
                Categories
              </Label>
              <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={(field, value) => validation.setValue(field as any, value)} />
            </div>
          </div>
        </div>
        <div className='px-3 md:w-full flex flex-row justify-between items-center'>
          <div className='px-3 md:w-3/12'>
            <div className='flex flex-row justify-start items-center'>
              <Label>Show products with NO Sales</Label>
              <Switch
                id='showWithSales'
                name='showWithSales'
                checked={values.showWithSales === 'true' ? true : false}
                onChange={(e) => {
                  validation.setValue('showWithSales', `${e.target.checked}`)
                }}
                onBlur={() => validation.trigger('showWithSales')}
              />
            </div>
          </div>
          <div className='flex flex-row justify-end items-center gap-3'>
            <Button type='button' variant='light' className='text-[13px]' onClick={() => handleClearFilters()}>
              Clear
            </Button>
            <Button type='submit' className='text-[13px]'>
              Apply Filters
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FilterProfits
