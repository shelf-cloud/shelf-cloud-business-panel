/* eslint-disable react-hooks/exhaustive-deps */
import router from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import { LABELS_SHIPMENT_TYPES } from '@components/orders/wholesale/constants'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { wholesaleProductRow } from '@typings'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import moment from 'moment'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Textarea } from '@shadcn/ui/textarea'

const singleBoxesOrderSchema = z
  .object({
    orderNumber: z.string().min(1, 'Please enter Order Number').max(100, 'Title is to Long'),
    type: z.enum(['LTL', 'Parcel Boxes'], 'Please Choose a Type'),
    numberOfPallets: z.number(),
    isThird: z.string().min(1, 'Select a Shipment Payment Type'),
    thirdInfo: z.string(),
    hasProducts: z.number(),
  })
  .superRefine((values, ctx) => {
    if (values.type === 'LTL' && !(values.numberOfPallets >= 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numberOfPallets'],
        message: 'Must be greater than or equal to 1',
      })
    }
    if (values.isThird === 'true' && !values.thirdInfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['thirdInfo'],
        message: 'Must enter Third Party Information',
      })
    }
    if (values.hasProducts < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hasProducts'],
        message: 'To create an order, you must add at least one product',
      })
    }
  })

type SingleBoxesOrderFormValues = z.infer<typeof singleBoxesOrderSchema>

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const SingleBoxesOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { state, setSingleBoxesOrderModal } = useContext(AppContext)

  const [loading, setloading] = useState(false)

  const TotalMasterBoxes = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.orderQty), 0)

  const totalQuantityToShip = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SingleBoxesOrderFormValues>({
    resolver: zodResolver(singleBoxesOrderSchema),
    defaultValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      type: 'Parcel Boxes',
      numberOfPallets: 1,
      isThird: '',
      thirdInfo: '',
      hasProducts: orderProducts.length,
    },
  })

  const type = watch('type')
  const isThird = watch('isThird')
  const hasProducts = watch('hasProducts')

  useEffect(() => {
    return () => {
      reset()
    }
  }, [state.wholesaleOrderProducts])

  const onSubmit = async (values: SingleBoxesOrderFormValues) => {
    setloading(true)

    const loadingToast = toast.loading('Creating Order...')

    const { data } = await axios.post(`/api/orders/createWholesaleOrderIndividualUnits?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      shippingProducts: orderProducts.map((product) => {
        return {
          sku: product.sku,
          qty: product.totalToShip,
          storeId: product.quantity.businessId,
          qtyPicked: 0,
          pickedHistory: [],
        }
      }),
      groovePackerProducts: orderProducts.map((product) => {
        return {
          sku: product.sku,
          qty: product.totalToShip,
          storeId: product.quantity.businessId,
          qtyScanned: 0,
          history: [
            {
              sku: product.sku,
              status: 'Awaiting',
              user: state.user.name,
              date: moment().format('YYYY-MM-DD h:mm:ss'),
            },
          ],
        }
      }),
      orderInfo: {
        orderNumber: values.orderNumber,
        carrierService: values.type,
        isPallets: values.type == 'LTL' ? true : false,
        numberOfPallets: values.type == 'LTL' ? values.numberOfPallets : 0,
        isthird: values.isThird == 'true' ? true : false,
        thirdInfo: values.isThird == 'true' ? values.thirdInfo : '',
        labelsName: '',
        palletLabels: '',
        orderProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            name: product.title,
            boxQty: product.qtyBox,
            quantity: product.totalToShip,
            businessId: product.quantity.businessId,
            isKit: product.isKit,
            children: product.children?.map((child) => {
              return {
                inventoryId: child.idInventory,
                sku: child.sku,
                name: child.title,
                title: child.title,
                qtyUsed: child.qty,
                quantity: child.qty * product.totalToShip!,
                businessId: product.quantity.businessId,
              }
            }),
          }
        }),
      },
    })

    if (!data.error) {
      setSingleBoxesOrderModal(false)
      toast.update(loadingToast, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      reset()
      router.push('/Shipments')
    } else {
      toast.update(loadingToast, {
        render: data.message ?? 'Error creating Purchase Order',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setloading(false)
  }

  const handleAddProduct = handleSubmit(onSubmit)

  return (
    <Dialog
      open={!!state.showSingleBoxesOrderModal}
      onOpenChange={(open) => {
        if (!open) setSingleBoxesOrderModal(!state.showSingleBoxesOrderModal)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>WholeSale Order with Individual Units</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <p className='text-[19.5px] font-bold text-primary'>Order Details</p>
            <div className='px-3 md:w-6/12'>
              <div className='px-3 md:w-full'>
                <div className='mb-4'>
                  <Label htmlFor='firstNameinput' className='mb-2 text-[11.2px]'>
                    *Order Number
                  </Label>
                  <InputGroup>
                    <InputGroupText className='font-semibold text-[16.25px]' style={{ padding: '0.2rem 0.9rem' }} id='bsnss-prefix'>
                      {orderNumberStart}
                    </InputGroupText>
                    <Input
                      type='text'
                      className='h-8 text-xs text-[13px]'
                      style={{ padding: '0.2rem 0.9rem' }}
                      id='orderNumber'
                      {...register('orderNumber')}
                      aria-invalid={errors.orderNumber ? true : undefined}
                    />
                    {errors.orderNumber ? <div className='text-sm text-destructive'>{errors.orderNumber.message}</div> : null}
                  </InputGroup>
                </div>
              </div>
              <div className='px-3 md:w-full'>
                <Label htmlFor='firstNameinput' className='mb-2 text-[11.2px]'>
                  *Type of Shipment
                </Label>
                <div className='flex flex-row justify-start items-center pb-4 gap-4'>
                  <Button
                    type='button'
                    className={type == 'Parcel Boxes' ? '' : 'text-muted-foreground'}
                    variant={type == 'Parcel Boxes' ? 'default' : 'light'}
                    onClick={() => setValue('type', 'Parcel Boxes', { shouldValidate: true })}>
                    Parcel Boxes
                  </Button>
                  <Button
                    type='button'
                    className={type == 'LTL' ? '' : 'text-muted-foreground'}
                    variant={type == 'LTL' ? 'default' : 'light'}
                    onClick={() => setValue('type', 'LTL', { shouldValidate: true })}>
                    Pallets
                  </Button>
                </div>
              </div>
              {type == 'LTL' && (
                <div className='px-3 md:w-6/12'>
                  <div className='mb-4'>
                    <Label htmlFor='firstNameinput' className='mb-2 text-[11.2px]'>
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type='number'
                      className='text-[13px]'
                      id='numberOfPallets'
                      {...register('numberOfPallets', { valueAsNumber: true })}
                      aria-invalid={errors.numberOfPallets ? true : undefined}
                    />
                    {errors.numberOfPallets ? <div className='text-sm text-destructive'>{errors.numberOfPallets.message}</div> : null}
                  </div>
                </div>
              )}
              <div className='px-3 md:w-6/12'>
                <Controller
                  control={control}
                  name='isThird'
                  render={({ field }) => (
                    <SelectSingleFilter
                      inputLabel={'*Select Shipment Type'}
                      inputName={'isThird'}
                      placeholder={'Select ...'}
                      selected={{ value: field.value, label: LABELS_SHIPMENT_TYPES.find((type) => type.value === field.value)?.label || 'Select...' }}
                      options={LABELS_SHIPMENT_TYPES || [{ value: '', label: '' }]}
                      handleSelect={(option: SelectSingleValueType) => {
                        field.onChange(option!.value)
                      }}
                      error={errors.isThird?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className='px-3 md:w-full'>
              {isThird == 'true' && (
                <>
                  <Textarea
                    id='thirdInfo'
                    placeholder='Please enter the Third Party Shipping Information: Recepient, Company, Address, City, State, Zipcode, Country.'
                    {...register('thirdInfo')}
                    aria-invalid={errors.thirdInfo ? true : undefined}
                  />
                  {errors.thirdInfo ? <div className='text-sm text-destructive'>{errors.thirdInfo.message}</div> : null}
                  <h5 className='text-[13px] mb-4 text-muted-foreground'>*Additional shipping costs apply to this type of shipping.</h5>
                </>
              )}
            </div>
            <div className='px-3 md:w-full'>
              <span className='text-info text-[13px] font-light'>*The distribution plan for boxes and items will be available after picking.</span>
              <p className='text-[13px] m-0'>Total SKUs in Order: {hasProducts}</p>
              {errors.hasProducts ? <p className='text-white'>{errors.hasProducts.message}</p> : null}
              <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Individual Units</th>
                    <th className='text-center'>Total Qty To Ship</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className='text-center'>{product.orderQty}</td>
                      <td className='text-center'>{product.totalToShip}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td className='font-bold'>TOTAL</td>
                    <td className='font-bold text-center'>{TotalMasterBoxes}</td>
                    <td className='font-bold text-center'>{totalQuantityToShip}</td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            <div className='px-3 md:w-full'>
              <div className='text-right'>
                <Button disabled={loading} type='submit' variant='success'>
                  {loading ? <Spinner className='text-white' /> : 'Confirm Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SingleBoxesOrderModal
