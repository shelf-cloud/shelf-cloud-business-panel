import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { useSuppliers } from '@hooks/suppliers/useSuppliers'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { useSWRConfig } from 'swr'

type Props = {
  orderNumberStart: string
}
type Supplier = {
  suppliersId: number
  name: string
}

const addPoManuallySchema = z.object({
  orderNumber: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, { message: `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces` })
    .max(50, { message: 'Order Number is to Long' })
    .min(1, { message: 'Required Order Number' }),
  destinationSC: z.object({
    value: z.string().min(1, { message: 'Destination Required' }),
    label: z.string(),
  }),
  supplier: z
    .union([z.string(), z.number()])
    .refine((value) => value !== '' && value !== undefined && value !== null, { message: 'Required Supplier' }),
  date: z.string().min(1, { message: 'Required Date' }),
})

type AddPoManuallyValues = z.infer<typeof addPoManuallySchema>

const Add_Po_Manually = ({ orderNumberStart }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setShowCreatePoManually }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const { suppliers } = useSuppliers()
  const { warehouses, isLoading } = useWarehouses()

  const validation = useForm<AddPoManuallyValues>({
    resolver: zodResolver(addPoManuallySchema),
    defaultValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      destinationSC: { value: '', label: 'Select ...' },
      supplier: '',
      date: '',
    },
  })

  const onSubmit = async (values: AddPoManuallyValues) => {
    setLoading(true)

    const hasSplitting = false
    const selectedWarehouse = warehouses.find((w) => w.warehouseId === parseInt(values.destinationSC.value))

    const response = await axios.post(`/api/purchaseOrders/addPoManually?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      ...values,
      destinationSC: hasSplitting ? 0 : warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
      warehouseId: hasSplitting ? 0 : parseInt(values.destinationSC.value),
      name3PL: hasSplitting ? null : selectedWarehouse?.name3PL,
    })

    if (!response.data.error) {
      mutate('/api/getuser')
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      setShowCreatePoManually(false)
    } else {
      toast.error('There were some errors creating Purchase Order.')
    }
    setLoading(false)
  }

  const values = validation.watch()
  const { errors, touchedFields } = validation.formState

  return (
    <Dialog open={!!state.showCreatePoManually} onOpenChange={(open) => { if (!open) setShowCreatePoManually(!state.showCreatePoManually) }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='addPoFromFile'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>
            Create New Purchase Order
          </DialogTitle>
        </DialogHeader>
        <div>
        <form onSubmit={validation.handleSubmit(onSubmit)}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 md:w-1/2'>
              <div className='mb-1'>
                <Label htmlFor='firstNameinput' className='mb-2'>
                  *Purchase Order Number
                </Label>
                <InputGroup>
                  <InputGroupText className='font-semibold text-[16.25px] m-0 px-2 py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </InputGroupText>
                  <Input
                    type='text'
                    className='text-[13px] h-8 text-xs'
                    id='orderNumber'
                    aria-invalid={(touchedFields.orderNumber && errors.orderNumber ? true : false) || undefined}
                    {...validation.register('orderNumber')}
                  />
                </InputGroup>
                {touchedFields.orderNumber && errors.orderNumber ? <div className='text-sm text-destructive'>{errors.orderNumber.message}</div> : null}
              </div>
              <SelectSingleFilter
                inputLabel={'*Supplier'}
                inputName={'supplier'}
                placeholder={'Select ...'}
                selected={{ value: values.supplier, label: suppliers?.find((supplier: Supplier) => supplier.suppliersId == parseInt(String(values.supplier)))?.name || 'Select...' }}
                options={suppliers?.map((supplier: Supplier) => ({ value: supplier.suppliersId, label: supplier.name })) || [{ value: '', label: '' }]}
                handleSelect={(option: SelectSingleValueType) => {
                  validation.setValue('supplier', option!.value as any, { shouldValidate: true, shouldTouch: true })
                }}
                error={errors.supplier?.message}
              />
            </div>
            <div className='px-3 md:w-1/2 py-1'>
              <div className='mb-2'>
                <Label className='mb-2 text-[11.2px]'>*Destination</Label>
                <SimpleSelect
                  options={warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []}
                  selected={values.destinationSC}
                  handleSelect={(selected) => {
                    validation.setValue('destinationSC', selected as any, { shouldValidate: true, shouldTouch: true })
                  }}
                  placeholder={isLoading ? 'Loading...' : 'Select ...'}
                  customStyle='sm'
                />
                {errors.destinationSC && touchedFields.destinationSC ? <div className='m-0 p-0 text-danger text-[11.2px]'>*{errors.destinationSC.value?.message}</div> : null}
              </div>

              <div className='mb-1'>
                <Label htmlFor='firstNameinput' className='mb-2 text-[11.2px]'>
                  *Date
                </Label>
                <Input
                  type='date'
                  className='text-[13px] h-8 text-xs'
                  id='date'
                  aria-invalid={(touchedFields.date && errors.date ? true : false) || undefined}
                  {...validation.register('date')}
                />
                {touchedFields.date && errors.date ? <div className='text-sm text-destructive'>{errors.date.message}</div> : null}
              </div>
            </div>
          </div>

          <div className='px-3 w-full mt-6'>
            <div className='text-right'>
              <Button disabled={loading} type='submit' variant='success' className='text-[11.2px]'>
                {loading ? (
                  <span>
                    <Spinner className='text-white' /> Creating...
                  </span>
                ) : (
                  'Create PO'
                )}
              </Button>
            </div>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Add_Po_Manually
