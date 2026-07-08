import { useRouter } from 'next/router'
import { memo } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import InputNumberFilter from '@components/ui/filters/InputNumberFilter'
import InputPercentageFilter from '@components/ui/filters/InputPercentageFilter'
import { COMPARE_NUMBER_OPERATORS } from '@components/ui/filters/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import { z } from 'zod'

export type MKP_FiltersType = {
  units1monthmin: string
  units1monthmax: string
  units1yearmin: string
  units1yearmax: string
  margin: string
  marginoperator: string
  showOnlyOnWatch: boolean
  supplier: string
  brand: string
  category: string
}

const optionalNonNegative = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((val) => val === undefined || val === '' || Number(val) >= 0, message)

const validationSchema = z
  .object({
    units1monthmin: optionalNonNegative('Must be greater than 0'),
    units1monthmax: optionalNonNegative('Must be greater than 0'),
    units1yearmin: optionalNonNegative('Must be greater than 0'),
    units1yearmax: optionalNonNegative('Must be greater than 0'),
    margin: z.union([z.string(), z.number()]),
    marginoperator: z.string(),
    showOnlyOnWatch: z.union([z.boolean(), z.literal('')]),
    supplier: z.string(),
    brand: z.string(),
    category: z.string(),
  })
  .superRefine((values, ctx) => {
    const marginEmpty = values.margin === undefined || values.margin === ''
    const operatorSelected = values.marginoperator !== '' && values.marginoperator !== undefined
    // margin: required and >= 0 when marginoperator is selected
    if (operatorSelected) {
      if (marginEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['margin'],
          message: 'Margin is required when margin operator is selected',
        })
      } else if (Number(values.margin) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['margin'],
          message: 'Must be greater than 0',
        })
      }
    }
    // marginoperator: required when margin >= 0 and defined
    if (!marginEmpty && Number(values.margin) >= 0 && !operatorSelected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['marginoperator'],
        message: 'Margin operator is required when margin is greater than or equal to 0',
      })
    }
  })

type FiltersFormValues = z.infer<typeof validationSchema>

type Props = {
  filters: MKP_FiltersType
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (filters: MKP_FiltersType) => void
  setFilterOpen: (value: boolean) => void
  activeTab: string
}

const MKP_Filters = ({ filters, supplierOptions, brandOptions, categoryOptions, handleApplyFilters, setFilterOpen, activeTab }: Props) => {
  const { units1monthmin, units1monthmax, units1yearmin, units1yearmax, margin, marginoperator, showOnlyOnWatch, supplier, brand, category } = filters

  const supplierOptionsList = supplierOptions.map((option) => ({ value: option, label: option }))
  const brandOptionsList = brandOptions.map((option) => ({ value: option, label: option }))
  const categoryOptionsList = categoryOptions.map((option) => ({ value: option, label: option }))

  const router = useRouter()

  const initialValues: FiltersFormValues = {
    units1monthmin: units1monthmin,
    units1monthmax: units1monthmax,
    units1yearmin: units1yearmin,
    units1yearmax: units1yearmax,
    margin: margin,
    marginoperator: marginoperator,
    showOnlyOnWatch: showOnlyOnWatch,
    supplier: supplier,
    brand: brand,
    category: category,
  }

  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  })
  const { watch, setValue, formState } = form
  const { errors } = formState
  const values = watch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.name as keyof FiltersFormValues, e.target.value)
  }

  const handleSubmit = async (values: any) => {
    handleApplyFilters({ ...values })
  }

  const handleClearFilters = () => {
    form.reset({
      units1monthmin: '',
      units1monthmax: '',
      units1yearmin: '',
      units1yearmax: '',
      margin: '',
      marginoperator: '',
      showOnlyOnWatch: '',
      supplier: '',
      brand: '',
      category: '',
    } as any)
    router.push('/marketplaces/marketplacePricing', undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 w-full md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Units Sold 1 Month
                </Label>
                <div className='flex flex-row justify-between items-end gap-1'>
                  <InputNumberFilter
                    inputName='units1monthmin'
                    value={values.units1monthmin}
                    isInvalid={errors.units1monthmin ? true : false}
                    handleChange={handleChange}
                    handleBlur={() => {}}
                    placeholder='Units Sold'
                  />
                  <span className='text-[11.2px] text-muted-foreground p-0 m-0'>min</span>
                  <InputNumberFilter
                    inputName='units1monthmax'
                    value={values.units1monthmax}
                    isInvalid={errors.units1monthmax ? true : false}
                    handleChange={handleChange}
                    handleBlur={() => {}}
                    placeholder='Units Sold'
                  />
                  <span className='text-[11.2px] text-muted-foreground p-0 m-0'>max</span>
                </div>
                {errors.units1monthmin ? <div className='text-sm text-destructive'>{errors.units1monthmin.message}</div> : null}
                {errors.units1monthmax ? <div className='text-sm text-destructive'>{errors.units1monthmax.message}</div> : null}
              </div>
            </div>
            <div className='px-3 w-full md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Units Sold 1 Year
                </Label>
                <div className='flex flex-row justify-between items-end gap-1'>
                  <InputNumberFilter
                    inputName='units1yearmin'
                    value={values.units1yearmin}
                    isInvalid={errors.units1yearmin ? true : false}
                    handleChange={handleChange}
                    handleBlur={() => {}}
                    placeholder='Units Sold'
                  />
                  <span className='text-[11.2px] text-muted-foreground p-0 m-0'>min</span>
                  <InputNumberFilter
                    inputName='units1yearmax'
                    value={values.units1yearmax}
                    isInvalid={errors.units1yearmax ? true : false}
                    handleChange={handleChange}
                    handleBlur={() => {}}
                    placeholder='Units Sold'
                  />
                  <span className='text-[11.2px] text-muted-foreground p-0 m-0'>max</span>
                </div>
                {errors.units1yearmin ? <div className='text-sm text-destructive'>{errors.units1yearmin.message}</div> : null}
                {errors.units1yearmax ? <div className='text-sm text-destructive'>{errors.units1yearmax.message}</div> : null}
              </div>
            </div>
            {activeTab === 'byMarketplace' && (
              <div className='px-3 w-full md:w-5/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='mb-2'>
                    Margin
                  </Label>
                  <div className='grid gap-2' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))' }}>
                    <SimpleSelect
                      customStyle='sm'
                      placeholder='Select'
                      selected={COMPARE_NUMBER_OPERATORS.find((option) => option.value === values.marginoperator) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectSingleValueType) => {
                        setValue('marginoperator', String(option!.value))
                      }}
                      options={COMPARE_NUMBER_OPERATORS}
                    />
                    <InputPercentageFilter
                      inputName='margin'
                      value={values.margin}
                      isInvalid={errors.margin ? true : false}
                      handleChange={handleChange}
                      handleBlur={() => {}}
                      error={errors.margin?.message}
                    />
                  </div>
                  {errors.marginoperator ? <p className='m-0 p-0 mt-1 text-[11.2px] text-danger'>{errors.marginoperator.message}</p> : null}
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-wrap -mx-3 mt-2'>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Suppliers
                </Label>
                <SimpleSelect
                  customStyle='sm'
                  selected={supplierOptionsList.find((option) => option.value === values.supplier) || { value: '', label: 'Select...' }}
                  handleSelect={(option: SelectSingleValueType) => {
                    setValue('supplier', String(option!.value))
                  }}
                  options={supplierOptionsList}
                />
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Brands
                </Label>
                <SimpleSelect
                  customStyle='sm'
                  selected={brandOptionsList.find((option) => option.value === values.brand) || { value: '', label: 'Select...' }}
                  handleSelect={(option: SelectSingleValueType) => {
                    setValue('brand', String(option!.value))
                  }}
                  options={brandOptionsList}
                />
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-2'>
                  Categories
                </Label>
                <SimpleSelect
                  customStyle='sm'
                  selected={categoryOptionsList.find((option) => option.value === values.category) || { value: '', label: 'Select...' }}
                  handleSelect={(option: SelectSingleValueType) => {
                    setValue('category', String(option!.value))
                  }}
                  options={categoryOptionsList}
                />
              </div>
            </div>
          </div>
          <div className='px-3 w-full flex flex-row flex-wrap justify-between items-center gap-4'>
            {activeTab === 'byMarketplace' ? (
              <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
                <InputCheckFilter
                  inputLabel='Show only On Watch Products'
                  inputName='showOnlyOnWatch'
                  value={values.showOnlyOnWatch || false}
                  isInvalid={errors.showOnlyOnWatch ? true : false}
                  handleChange={(checked: boolean) => {
                    setValue('showOnlyOnWatch', checked)
                  }}
                  handleBlur={() => {}}
                />
              </div>
            ) : (
              <div></div>
            )}
            <div className='px-3 w-full md:w-4/12'>
              <div className='flex flex-row justify-end items-center gap-4'>
                <Button type='button' variant='light' className='text-[11.2px]' onClick={() => handleClearFilters()}>
                  Clear
                </Button>
                <Button type='submit' className='text-[11.2px]'>
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

export default memo(MKP_Filters)
