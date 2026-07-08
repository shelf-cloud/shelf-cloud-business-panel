import { useRouter } from 'next/router'
import { memo } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMarketplaceListingsQueries } from '@hooks/products/useMarketplaceListingsQuery'
import { useForm } from 'react-hook-form'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import { z } from 'zod'

type Props = {
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  setFilterOpen: (value: boolean) => void
}

const filtersSchema = z.object({
  showMKHidden: z.boolean().optional(),
  showMapped: z.boolean().optional(),
  showDiscontinued: z.boolean().optional(),
  supplier: z.any(),
  brand: z.any(),
  category: z.any(),
})

type FiltersForm = z.infer<typeof filtersSchema>

const MKL_Filters = ({ supplierOptions, brandOptions, categoryOptions, setFilterOpen }: Props) => {
  const { listingsFilter, setListingsFilter } = useMarketplaceListingsQueries()
  const { showMKHidden, showMapped, showDiscontinued, supplier, brand, category } = listingsFilter
  const supplierOptionsList = supplierOptions.map((option) => ({ value: option, label: option }))
  const brandOptionsList = brandOptions.map((option) => ({ value: option, label: option }))
  const categoryOptionsList = categoryOptions.map((option) => ({ value: option, label: option }))

  const router = useRouter()

  const initialValues = {
    showMKHidden: showMKHidden,
    showMapped: showMapped,
    showDiscontinued: showDiscontinued,
    supplier: supplier,
    brand: brand,
    category: category,
  }

  const form = useForm<FiltersForm>({
    resolver: zodResolver(filtersSchema),
    defaultValues: initialValues,
  })
  const { watch, setValue } = form
  const values = watch()

  const handleSubmit = async (values: any) => {
    setListingsFilter({
      marketplace: router.query.marketplace ? (router.query.marketplace as string) : '',
      filters: 'true',
      showMKHidden: values.showMKHidden,
      showMapped: values.showMapped,
      showDiscontinued: values.showDiscontinued,
      supplier: values.supplier,
      brand: values.brand,
      category: values.category,
    })
    setFilterOpen(false)
  }

  const handleClearFilters = () => {
    setListingsFilter({
      marketplace: router.query.marketplace ? (router.query.marketplace as string) : '',
      filters: 'false',
      showMKHidden: false,
      showMapped: false,
      showDiscontinued: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
    form.reset({
      showMKHidden: false,
      showMapped: false,
      showDiscontinued: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
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
                    setValue('supplier', option!.value)
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
                    setValue('brand', option!.value)
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
                    setValue('category', option!.value)
                  }}
                  options={categoryOptionsList}
                />
              </div>
            </div>
          </div>
          <div className='px-3 w-full flex flex-row flex-wrap justify-between items-center gap-4'>
            <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
              <InputCheckFilter
                inputLabel='Show Mapped'
                inputName='showMapped'
                value={values.showMapped || false}
                isInvalid={form.formState.errors.showMapped ? true : false}
                handleChange={(checked: boolean) => {
                  setValue('showMapped', checked)
                }}
                handleBlur={() => {}}
              />
              <InputCheckFilter
                inputLabel='Show Marketplace Hidden'
                inputName='showMKHidden'
                value={values.showMKHidden || false}
                isInvalid={form.formState.errors.showMKHidden ? true : false}
                handleChange={(checked: boolean) => {
                  setValue('showMKHidden', checked)
                }}
                handleBlur={() => {}}
              />
              <InputCheckFilter
                inputLabel='Show Discontinued'
                inputName='showDiscontinued'
                value={values.showDiscontinued || false}
                isInvalid={form.formState.errors.showDiscontinued ? true : false}
                handleChange={(checked: boolean) => {
                  setValue('showDiscontinued', checked)
                }}
                handleBlur={() => {}}
              />
            </div>

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

export default memo(MKL_Filters)
