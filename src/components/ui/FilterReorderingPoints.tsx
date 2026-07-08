import { useRouter } from 'next/router'
import { memo, useContext } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import AppContext from '@context/AppContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'

import SelectDropDown from './SelectDropDown'
import SelectMultipleDropDown from './SelectMultipleDropDown'

type Props = {
  urgency: string
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsrange: string
  unitsmin: string
  unitsmax: string
  supplier: string
  brand: string
  category: string
  trendTag: string
  ai_urgency: string
  showHidden: string
  // show0Days: string
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (
    urgency: string,
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsrange: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    trendTag: string,
    ai_urgency: string,
    showHidden: string
    // show0Days: string
  ) => void
  setFilterOpen: (value: boolean) => void
}

const URGENCY_STATES = {
  '3': { label: 'High Alert', icon: 'mdi mdi-alert-octagon', color: 'text-destructive' },
  '2': { label: 'Medium Alert', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  '1': { label: 'Low Alert', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  '0': { label: 'No Alert', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const AI_URGENCY_STATES = {
  high: { label: 'High', icon: 'mdi mdi-alert-octagon', color: 'text-destructive' },
  medium: { label: 'Medium', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  low: { label: 'Low', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  none: { label: 'None', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const UNITS_DAYS_RANGES = {
  '30D': { label: '30 Days', value: '30D' },
  '60D': { label: '60 Days', value: '60D' },
  '90D': { label: '90 Days', value: '90D' },
  '120D': { label: '120 Days', value: '120D' },
  '180D': { label: '180 Days', value: '180D' },
  '365D': { label: '365 Days', value: '365D' },
}

const TREND_TAGS = ['Normal', 'Low Sales', 'Seasonal']

const nonNegativeString = (message: string) =>
  z.string().refine((v) => v === '' || v === undefined || v === null || Number(v) >= 0, { message })

const filterSchema = z.object({
  urgency: z.string(),
  grossRevenueMin: nonNegativeString('Must be greater than 0'),
  grossRevenueMax: nonNegativeString('Must be greater than 0'),
  netProfitMin: z.string(),
  netProfitMax: z.string(),
  unitsRange: z.string(),
  unitsSoldMin: z.string(),
  unitsSoldMax: z.string(),
  supplier: z.string(),
  brand: z.string(),
  category: z.string(),
  trendTag: z.string(),
  ai_urgency: z.string(),
  showHidden: z.string(),
})

type FilterValues = z.infer<typeof filterSchema>

const FilterReorderingPoints = ({
  urgency,
  grossmin,
  grossmax,
  profitmin,
  profitmax,
  unitsrange,
  unitsmin,
  unitsmax,
  supplier,
  brand,
  category,
  trendTag,
  ai_urgency,
  showHidden,
  // show0Days,
  supplierOptions,
  brandOptions,
  categoryOptions,
  handleApplyFilters,
  setFilterOpen,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()

  const validation = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      urgency: urgency,
      grossRevenueMin: grossmin,
      grossRevenueMax: grossmax,
      netProfitMin: profitmin,
      netProfitMax: profitmax,
      unitsRange: unitsrange,
      unitsSoldMin: unitsmin,
      unitsSoldMax: unitsmax,
      supplier: supplier,
      brand: brand,
      category: category,
      trendTag: trendTag,
      ai_urgency: ai_urgency,
      showHidden: showHidden,
      // show0Days: show0Days,
    },
  })

  const onSubmit = async (values: FilterValues) => {
    handleApplyFilters(
      values.urgency,
      values.grossRevenueMin,
      values.grossRevenueMax,
      values.netProfitMin,
      values.netProfitMax,
      values.unitsRange,
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
      values.brand,
      values.category,
      values.trendTag,
      values.ai_urgency,
      values.showHidden
      // values.show0Days
    )
  }

  const handleClearFilters = () => {
    validation.reset({
      urgency: '[]',
      grossRevenueMin: '',
      grossRevenueMax: '',
      netProfitMin: '',
      netProfitMax: '',
      unitsRange: '',
      unitsSoldMin: '',
      unitsSoldMax: '',
      supplier: '',
      brand: '',
      category: '',
      trendTag: '',
      ai_urgency: '',
      showHidden: '',
      // show0Days: '',
    })
    router.push('/reorderingPoints', undefined, { shallow: true })
    setFilterOpen(false)
  }

  const values = validation.watch()
  const { errors, touchedFields } = validation.formState

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <form onSubmit={validation.handleSubmit(onSubmit)}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 w-full md:w-2/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Urgency
                </Label>
                <SelectMultipleDropDown formValue={'urgency'} selectionInfo={URGENCY_STATES} selected={values.urgency} handleSelection={validation.setValue as any} />
              </div>
            </div>
            <div className='px-3 w-full md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
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
                      aria-invalid={touchedFields.grossRevenueMin && errors.grossRevenueMin ? true : undefined}
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
                      aria-invalid={touchedFields.grossRevenueMax && errors.grossRevenueMax ? true : undefined}
                      {...validation.register('grossRevenueMax')}
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
            <div className='px-3 w-full md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
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
                      aria-invalid={touchedFields.netProfitMin && errors.netProfitMin ? true : undefined}
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
                      aria-invalid={touchedFields.netProfitMax && errors.netProfitMax ? true : undefined}
                      {...validation.register('netProfitMax')}
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
            <div className='px-3 w-full md:w-4/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Units Sold
                </Label>
                <div className='flex flex-row justify-between items-center gap-2'>
                  <div className='px-3 w-4/12'>
                    <SimpleSelect
                      selected={UNITS_DAYS_RANGES[values.unitsRange as keyof typeof UNITS_DAYS_RANGES]}
                      handleSelect={(option: SelectSingleValueType) => {
                        validation.setValue('unitsRange', String(option!.value), { shouldValidate: true, shouldTouch: true })
                      }}
                      customStyle='sm'
                      options={Object.values(UNITS_DAYS_RANGES)}
                    />
                  </div>
                  <Input
                    type='number'
                    className='h-8 text-xs m-0'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Min'
                    id='unitsSoldMin'
                    min={0}
                    aria-invalid={touchedFields.unitsSoldMin && errors.unitsSoldMin ? true : undefined}
                    {...validation.register('unitsSoldMin')}
                  />
                  <Input
                    type='number'
                    className='text-[13px] m-0 h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Max'
                    id='unitsSoldMax'
                    min={values.grossRevenueMin}
                    aria-invalid={touchedFields.unitsSoldMax && errors.unitsSoldMax ? true : undefined}
                    {...validation.register('unitsSoldMax')}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap -mx-3 mt-2'>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='supplier' className='mb-2'>
                  Suppliers
                </Label>
                <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={validation.setValue as any} />
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='brand' className='mb-2'>
                  Brands
                </Label>
                <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={validation.setValue as any} />
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='category' className='mb-2'>
                  Categories
                </Label>
                <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={validation.setValue as any} />
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='trendTag' className='mb-2'>
                  Trend Tag
                </Label>
                <SelectDropDown formValue={'trendTag'} selectionInfo={TREND_TAGS} selected={values.trendTag} handleSelection={validation.setValue as any} />
              </div>
            </div>
          </div>
          <div className='px-3 md:w-full flex flex-row flex-wrap justify-between items-center gap-4 mt-2'>
            <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
              <div className='px-3 w-full md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='mb-2'>
                    AI Urgency
                  </Label>
                  <SelectMultipleDropDown formValue={'ai_urgency'} selectionInfo={AI_URGENCY_STATES} selected={values.ai_urgency} handleSelection={validation.setValue as any} />
                </div>
              </div>
              <div className='flex flex-row justify-start items-center'>
                <Label className='mb-2'>Show hidden products</Label>
                <Switch
                  id='showHidden'
                  name='showHidden'
                  checked={values.showHidden === 'true' ? true : false}
                  onChange={(e) => {
                    validation.setValue('showHidden', `${e.target.checked}`, { shouldValidate: true, shouldTouch: true })
                  }}
                />
              </div>
            </div>
            <div className='px-3 w-full md:w-4/12'>
              <div className='flex flex-row justify-end items-center gap-4'>
                <Button type='button' variant='light' className='text-[13px]' onClick={() => handleClearFilters()}>
                  Clear
                </Button>
                <Button type='submit' className='text-[13px] bg-primary'>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default memo(FilterReorderingPoints)
