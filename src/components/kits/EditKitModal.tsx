
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import { useContext, useEffect, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { useCreateKit } from '@hooks/kits/useCreateKit'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR from 'swr'
import { z } from 'zod'

interface EditKitDetails {
  kitId: number
  businessId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnsku: string
  boxqty: number
  note: string
  children: KitChildren[]
}

interface KitChildren {
  qty: string
  sku: string
  title: string
  inventoryId: number
}

type EditKitResponse = EditKitDetails

type Props = {
  mutateKits: () => void
}

const fetcher = async (endPoint: string) => axios.get<EditKitResponse>(endPoint).then((res) => res.data)

const toNumberOrNaN = (v: unknown) => {
  if (typeof v === 'number') return v
  if (v === '' || v === null || v === undefined) return NaN
  const n = Number(v)
  return n
}

function EditKitModal({ mutateKits }: Props) {
  const { state, setShowEditKitModal } = useContext(AppContext)
  const { skus, validSkus, skuInfo, isLoading } = useCreateKit()
  const [updatingKit, setUpdatingKit] = useState(false)

  const { data, isValidating } = useSWR(
    state.user.businessId ? `/api/kits/getKitDetails?region=${state.currentRegion}&kitId=${state.modalKitDetails.kitId}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  const initialValues = data
    ? data
    : {
        kitId: '',
        title: '',
        sku: '',
        image: '',
        asin: '',
        fnsku: '',
        barcode: '',
        boxqty: '',
        note: '',
        children: [
          {
            sku: '',
            title: '',
            qty: 1,
            inventoryId: 0,
          },
        ],
      }

  const childSchema = z.object({
    sku: z
      .string()
      .min(1, 'Required SKU')
      .refine((value) => validSkus.includes(value), { message: 'Invalid SKU' }),
    title: z.string().max(100, 'Name is to Long').min(1, 'Required Name'),
    qty: z.preprocess(toNumberOrNaN, z.number().int('Qty must be an integer').min(1, 'Quantity must be greater than 0')),
    inventoryId: z.number().optional(),
  })

  const schema = z.object({
    kitId: z.union([z.number(), z.string()]).optional(),
    title: z
      .string()
      .regex(/^[a-zA-Z0-9-Á-öø-ÿ\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(100, 'Title is to Long')
      .min(1, 'Please Enter Your Title'),
    sku: z
      .string()
      .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(50, 'SKU is to Long')
      .min(1, 'Please Enter Your Sku'),
    image: z.union([z.literal(''), z.string().url()]).optional(),
    asin: z.string().max(50, 'Asin is to Long').optional(),
    fnsku: z.string().max(50, 'Fnsku is to Long').optional(),
    boxqty: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Qty' }).gt(0, 'Value must be grater than 0').int('Only integers')),
    barcode: z.string().max(50, 'barcode is to Long').min(1, 'Please Enter Your Barcode'),
    note: z.string().optional(),
    children: z.array(childSchema).min(1, 'Must have products'),
  })

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as any,
  })

  useEffect(() => {
    if (data) {
      validation.reset(data as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const { fields, remove, append } = useFieldArray({ control: validation.control, name: 'children' })

  const handleSubmit = async (values: z.output<typeof schema>) => {
    setUpdatingKit(true)
    const updatingKit = toast.loading('Updating Kit...')

    const ChildrenSkus: String[] = await values.children.map((child: any) => {
      return child.sku
    })

    if (
      values.children.some((child: any) => {
        const count = ChildrenSkus.filter((sku) => sku == child.sku)
        if (count.length > 1) {
          return true
        } else {
          return false
        }
      })
    ) {
      toast.update(updatingKit, {
        render: 'Duplicate SKUs found in Children List',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      return
    }

    const { data } = await axios.post(`/api/kits/updateKitDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!data.error) {
      toast.update(updatingKit, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutateKits()
      setShowEditKitModal(false)
    } else {
      toast.update(updatingKit, {
        render: data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setUpdatingKit(false)
  }

  return (
    <Dialog
      open={!!state.showEditKitModal}
      onOpenChange={(open) => {
        if (!open) setShowEditKitModal(!state.showEditKitModal)
      }}>
      <DialogContent id='EditKitModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle>
            Edit Kit: <span className='text-primary'>{state.modalKitDetails.sku}</span>
          </DialogTitle>
        </DialogHeader>
        <div>
        {!isLoading && !isValidating ? (
          <form onSubmit={validation.handleSubmit(handleSubmit)}>
            <div className='flex flex-wrap -mx-3'>
              <h4 className='text-[16.25px] mb-4 font-extrabold'>Kit Details</h4>
              <div className='px-3 md:w-6/12 hidden'>
                <div className='mb-3'>
                  <Label htmlFor='kitId' className='mb-1'>
                    *kitId
                  </Label>
                  <Input
                    disabled
                    type='number'
                    className='text-[13px]'
                    id='kitId'
                    aria-invalid={(validation.formState.touchedFields.kitId && validation.formState.errors.kitId ? true : false) || undefined}
                    {...validation.register('kitId')}
                  />
                  {validation.formState.touchedFields.kitId && validation.formState.errors.kitId ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.kitId.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 md:w-6/12'>
                <div className='mb-3'>
                  <Label htmlFor='title' className='mb-1'>
                    *Title
                  </Label>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Title...'
                    id='title'
                    aria-invalid={(validation.formState.touchedFields.title && validation.formState.errors.title ? true : false) || undefined}
                    {...validation.register('title')}
                  />
                  {validation.formState.touchedFields.title && validation.formState.errors.title ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.title.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 md:w-6/12'>
                <div className='mb-3'>
                  <Label htmlFor='sku' className='mb-1'>
                    *SKU
                  </Label>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Sku...'
                    id='sku'
                    aria-invalid={(validation.formState.touchedFields.sku && validation.formState.errors.sku ? true : false) || undefined}
                    {...validation.register('sku')}
                  />
                  {validation.formState.touchedFields.sku && validation.formState.errors.sku ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.sku.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 md:w-4/12'>
                <div className='mb-3'>
                  <Label htmlFor='asin' className='mb-1'>
                    ASIN
                  </Label>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Asin...'
                    id='asin'
                    aria-invalid={(validation.formState.touchedFields.asin && validation.formState.errors.asin ? true : false) || undefined}
                    {...validation.register('asin')}
                  />
                  {validation.formState.touchedFields.asin && validation.formState.errors.asin ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.asin.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 md:w-4/12'>
                <div className='mb-3'>
                  <Label htmlFor='fnsku' className='mb-1'>
                    FNSKU
                  </Label>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Fnsku...'
                    id='fnsku'
                    aria-invalid={(validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku ? true : false) || undefined}
                    {...validation.register('fnsku')}
                  />
                  {validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.fnsku.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 md:w-4/12'>
                <div className='mb-3'>
                  <Label htmlFor='barcode' className='mb-1'>
                    UPC / Barcode
                  </Label>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Barcode...'
                    id='barcode'
                    aria-invalid={(validation.formState.touchedFields.barcode && validation.formState.errors.barcode ? true : false) || undefined}
                    {...validation.register('barcode')}
                  />
                  {validation.formState.touchedFields.barcode && validation.formState.errors.barcode ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.barcode.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 md:w-9/12'>
                  <div className='mb-3'>
                    <Label htmlFor='image' className='mb-1'>
                      Product Image
                    </Label>
                    <Input
                      type='text'
                      className='text-[13px]'
                      placeholder='Image URL...'
                      id='image'
                      aria-invalid={(validation.formState.touchedFields.image && validation.formState.errors.image ? true : false) || undefined}
                      {...validation.register('image')}
                    />
                    {validation.formState.touchedFields.image && validation.formState.errors.image ? (
                      <div className='text-sm text-destructive'>{validation.formState.errors.image.message}</div>
                    ) : null}
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3'>
                    <Label htmlFor='boxqty' className='mb-1'>
                      *Master Box Quantity
                    </Label>
                    <Input
                      type='number'
                      className='text-[13px]'
                      placeholder='Box Qty...'
                      id='boxqty'
                      aria-invalid={(validation.formState.touchedFields.boxqty && validation.formState.errors.boxqty ? true : false) || undefined}
                      {...validation.register('boxqty')}
                    />
                    {validation.formState.touchedFields.boxqty && validation.formState.errors.boxqty ? (
                      <div className='text-sm text-destructive'>{validation.formState.errors.boxqty.message}</div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className='px-3 md:w-full'>
                <div className='mb-3'>
                  <Label htmlFor='note' className='mb-1'>
                    Kit Note
                  </Label>
                  <Input
                    type='textarea'
                    className='text-[13px]'
                    placeholder=''
                    id='note'
                    aria-invalid={(validation.formState.touchedFields.note && validation.formState.errors.note ? true : false) || undefined}
                    {...validation.register('note')}
                  />
                  {validation.formState.touchedFields.image && validation.formState.errors.image ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.image.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='flex flex-wrap -mx-3'>
                <h5 className='text-[16.25px] mb-1 font-extrabold'>Kit Children</h5>
                <div className='px-3 xl:w-full p-0 mt-1'>
                  <table className='table table-hover align-middle table-nowrap'>
                    <thead>
                      <tr>
                        <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'></th>
                        <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
                          SKU
                        </th>
                        <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
                          Title
                        </th>
                        <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
                          Qty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        const skuError = validation.formState.errors.children?.[index]?.sku
                        const titleError = validation.formState.errors.children?.[index]?.title
                        const titleTouched = validation.formState.touchedFields.children?.[index]?.title
                        const qtyError = validation.formState.errors.children?.[index]?.qty
                        const qtyTouched = validation.formState.touchedFields.children?.[index]?.qty
                        const childSku = validation.watch(`children.${index}.sku`)
                        return (
                          <tr key={field.id}>
                            <td style={{ minWidth: '50px' }}>
                              {index > 0 ? (
                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
                                  <i
                                    className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                      append({
                                        sku: '',
                                        title: '',
                                        qty: 1,
                                        inventoryId: 0,
                                      })
                                    }
                                  />
                                  <i className='text-danger text-[22.75px] las la-minus-circle m-0 p-0 w-auto' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                </div>
                              ) : (
                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
                                  <i
                                    className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                      append({
                                        sku: '',
                                        title: '',
                                        qty: 1,
                                        inventoryId: 0,
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </td>
                            <td style={{ minWidth: '200px' }}>
                              <div className='mb-3 createOrder_inputs'>
                                <SimpleSelect
                                  selected={{ label: childSku, value: childSku }}
                                  options={skus.map((sku) => ({ label: sku.sku, value: sku.sku, description: sku.title }))}
                                  handleSelect={(option: any) => {
                                    if (!option) {
                                      validation.setValue(`children.${index}.sku`, '', { shouldValidate: true, shouldDirty: true })
                                      validation.setValue(`children.${index}.title`, '', { shouldValidate: true, shouldDirty: true })
                                      validation.setValue(`children.${index}.inventoryId`, 0, { shouldValidate: true, shouldDirty: true })
                                      return
                                    }
                                    validation.setValue(`children.${index}.sku`, option.value, { shouldValidate: true, shouldDirty: true })
                                    validation.setValue(`children.${index}.title`, skuInfo[option.value].title, { shouldValidate: true, shouldDirty: true })
                                    validation.setValue(`children.${index}.inventoryId`, skuInfo[option.value].inventoryId, { shouldValidate: true, shouldDirty: true })
                                  }}
                                  placeholder='Select SKU...'
                                  customStyle='sm'
                                  hasError={skuError ? true : false}
                                  isClearable
                                />
                                {skuError ? <ErrorInputLabel error={skuError.message} marginTop='mt-0' /> : null}
                              </div>
                            </td>
                            <td style={{ minWidth: '200px' }}>
                              <div className='mb-3 createOrder_inputs'>
                                <Input
                                  type='text'
                                  className='text-[13px]'
                                  placeholder='Title...'
                                  readOnly
                                  aria-invalid={(titleTouched && titleError ? true : false) || undefined}
                                  {...validation.register(`children.${index}.title`)}
                                />
                                {titleTouched && titleError ? <div className='text-sm text-destructive'>{titleError.message}</div> : null}
                              </div>
                            </td>
                            <td style={{ minWidth: '80px' }}>
                              <div className='mb-3 createOrder_inputs'>
                                <Input
                                  type='text'
                                  className='text-center text-[13px]'
                                  placeholder='Qty...'
                                  aria-invalid={(qtyTouched && qtyError ? true : false) || undefined}
                                  {...validation.register(`children.${index}.qty`)}
                                />
                                {qtyTouched && qtyError ? <div className='text-sm text-destructive'>{qtyError.message}</div> : null}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className='text-[11.2px] text-muted-foreground'>*You must complete all required fields or you will not be able to create your product.</p>
              <div className='px-3 md:w-full'>
                <div className='text-right flex gap-4 justify-end items-center'>
                  <Button variant='light' onClick={() => setShowEditKitModal(!state.showEditKitModal)}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={updatingKit} className='text-[11.2px]'>
                    {updatingKit ? (
                      <span className='flex items-center gap-2'>
                        <Spinner className='text-white' /> Updating...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <p className='w-full text-center flex items-center justify-center gap-4 text-[13px]'>
            <Spinner className='size-6 text-primary' /> <span className='text-[16.25px] font-normal'>Loading kit details...</span>
          </p>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditKitModal
