/* eslint-disable @next/next/no-img-element */
import { useContext, useEffect, useState } from 'react'

import UploadFileModal, { HandleSubmitParams } from '@components/modals/shared/UploadFileModal'
import AppContext from '@context/AppContext'
import { FormatBytes } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Textarea } from '@shadcn/ui/textarea'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

import Select_Condition_Product_Details from './Select_Condition_Product_Details'
import Select_Product_Details from './Select_Product_Details'

type Props = {
  inventoryId?: number
  sku?: string
  image?: string
  title?: string
  description?: string
  brand?: string
  category?: string
  supplier?: string
  itemCondition?: string
  note?: string
  brands: string[]
  categories: string[]
  suppliers: string[]
  useEntryDate: boolean
  useExpireDate: boolean
  expirationTime: number | null
}

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const General_Product_Details = ({
  inventoryId,
  sku,
  image,
  title,
  description,
  brand,
  category,
  supplier,
  itemCondition,
  note,
  brands,
  categories,
  suppliers,
  useEntryDate,
  useExpireDate,
  expirationTime,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)
  const [uploadLogoImage, setuploadLogoImage] = useState({
    isOpen: false,
    headerText: 'Upload Product Image',
    primaryText: 'Change Product Image',
    primaryTextSub: 'supported formats: PNG, JPG. Max size: 2MB.',
    descriptionText: 'Upload a new image for the product. The image should be in PNG or JPG format and optimized for web use.',
    uploadZoneText: 'Drag & drop a product image file here, or click to select one (PNG, JPG)',
    confirmText: 'Upload',
    loadingText: 'Uploading...',
    inventoryId: inventoryId || 0,
    selectedFiles: [] as any[],
    acceptedFiles: {
      'image/jpeg': [],
      'image/png': [],
    },
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setuploadLogoImage((prev) => ({ ...prev, selectedFiles: acceptedFiles }))
    },
    handleClearFiles: () => {
      setuploadLogoImage((prev) => ({ ...prev, selectedFiles: [] }))
    },
    handleSubmit: async ({ region, businessId, selectedFiles }: HandleSubmitParams) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading Image...')

      const formData = new FormData()
      formData.append('assetType', 'product')
      formData.append('fileName', selectedFiles[0].name)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])
      formData.append('inventoryId', uploadLogoImage.inventoryId.toString())

      const { data } = await axios.post(`/api/assets/uploadNewAsset?region=${region}&businessId=${businessId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data.error) {
        toast.update(uploadingAsset, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        generate_new_forecast_products({
          skus: [sku || ''],
          productIds: [inventoryId || 0],
        })
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        return { error: true }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading logo',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: false }
      }
    },
    handleClose: () => {
      setuploadLogoImage((prev) => ({ ...prev, isOpen: false, selectedFiles: [] }))
    },
  })

  const { generate_new_forecast_products } = useRPNewForecast()

  const schema = z
    .object({
      inventoryId: z.number().optional(),
      sku: z.string().optional(),
      title: z.string().max(100, 'Title is to Long').min(1, 'Please enter product title'),
      description: z.string().max(300, 'Title is to Long').optional(),
      brand: z.string().max(200, 'Title is to Long').min(1, 'Please enter product brand'),
      category: z.string().max(100, 'Title is to Long').optional(),
      supplier: z.string().max(200, 'Title is to Long').min(1, 'Please enter product supplier'),
      itemCondition: z.string().max(10, 'Title is to Long').min(1, 'Please select product condition'),
      useEntryDate: z.boolean(),
      useExpireDate: z.boolean(),
      expirationTime: z.preprocess(toNumber, z.number().min(0, 'Minimum of 0').nullable().optional()),
      note: z.string().max(300, 'Title is to Long').optional(),
    })
    .superRefine((data, ctx) => {
      if (data.useExpireDate) {
        if (data.expirationTime === undefined || data.expirationTime === null) {
          ctx.addIssue({ path: ['expirationTime'], code: 'custom', message: 'Enter Expiration Time' })
        } else if (data.expirationTime < 1) {
          ctx.addIssue({ path: ['expirationTime'], code: 'custom', message: 'Minimum of 1' })
        }
      }
    })

  const defaultFormValues = {
    inventoryId,
    sku,
    title,
    description: description ?? '',
    brand: brand ?? '',
    category: category ?? '',
    supplier: supplier ?? '',
    itemCondition: itemCondition ?? 'New',
    useEntryDate,
    useExpireDate,
    expirationTime,
    note,
  }

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    validation.reset(defaultFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryId, sku, title, description, brand, category, supplier, itemCondition, useEntryDate, useExpireDate, expirationTime, note])

  const onSubmit = async (values: z.output<typeof schema>) => {
    setisLoading(true)
    const response = await axios.post(`/api/productDetails/generalProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      generate_new_forecast_products({
        skus: [sku || ''],
        productIds: [inventoryId || 0],
      })
      toast.success(response.data.msg)
      mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      setShowEditFields(false)
    } else {
      toast.error(response.data.msg)
    }
    setisLoading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const handleShowEditFields = () => {
    validation.reset(defaultFormValues)
    setShowEditFields(true)
  }

  const handleSelection = (type: string, value: string) => {
    validation.setValue(type as any, value, { shouldValidate: true, shouldDirty: true })
  }

  const handleConditionSelection = (value: string) => {
    validation.setValue('itemCondition', value, { shouldValidate: true, shouldDirty: true })
  }

  const useExpireDateValue = validation.watch('useExpireDate')

  return (
    <div className='px-4 pt-2 pb-4 border-b border-[color:var(--border)]'>
      <p className='text-[19.5px] text-primary font-semibold'>General</p>
      {!showEditFields ? (
        <div className='w-full flex flex-col justify-start items-start gap-4 lg:flex-row'>
          <div className='flex flex-col justify-start items-start gap-2'>
            <div
              style={{
                width: '30%',
                height: 'auto',
                margin: '2px 0px',
                position: 'relative',
                minWidth: '150px',
                maxWidth: '200px',
              }}>
              <img
                loading='lazy'
                src={image ? image : NoImageAdress}
                alt='Product'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            <Button className='flex items-center gap-2' size='sm' onClick={() => setuploadLogoImage((prev) => ({ ...prev, isOpen: true }))}>
              <i className='mdi mdi-cloud-upload text-[16.25px] m-0 p-0' />
              Image
            </Button>
          </div>
          <div className='w-full'>
            <table className='w-full text-[13px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
              <tbody className='bg-transparent'>
                <tr>
                  <td className='font-extrabold'>Name</td>
                  <td>{title}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Description</td>
                  <td className={description ?? 'text-muted-foreground font-light italic'}>{description ?? 'No Description'}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Brand</td>
                  <td className={brand ?? 'text-muted-foreground font-light italic'}>{brand ?? 'No Brand'}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Category</td>
                  <td className={category ?? 'text-muted-foreground font-light italic'}>{category ?? 'No Category'}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Supplier</td>
                  <td className={supplier ?? 'text-muted-foreground font-light italic'}>{supplier ?? 'No supplier'}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Condition</td>
                  <td className={itemCondition ?? 'text-muted-foreground font-light italic'}>{itemCondition ?? 'No supplier'}</td>
                </tr>
                <tr>
                  <td className='font-extrabold'>Tracking</td>
                  <td className={itemCondition ?? 'text-muted-foreground font-light italic'}>
                    <p className='m-0 p-0'>
                      <span className='font-semibold'>FIFO:</span> {useEntryDate ? 'Yes' : 'No'}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='font-semibold'>Expires:</span> {useExpireDate ? `${expirationTime} Days` : 'No'}
                    </p>
                  </td>
                </tr>
                {note && (
                  <tr>
                    <td className='font-extrabold'>Note</td>
                    <td className='text-muted-foreground font-light italic'>{note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div>
            <button type='button' aria-label='Edit product details' onClick={handleShowEditFields} className='p-0 border-0 bg-transparent'>
              <i className='ri-pencil-fill text-[16.25px] m-0 p-0 text-primary' />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 md:w-6/12'>
              <div className='mb-3'>
                <Label htmlFor='title'>
                  *Title
                </Label>
                <Input
                  type='text'
                  className='text-[13px] h-8 text-xs'
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
            <div className='px-3 md:w-full'>
              <div className='mb-3'>
                <Label htmlFor='description'>
                  Product Description
                </Label>
                <Input
                  type='text'
                  className='text-[13px] h-8 text-xs'
                  placeholder='Description...'
                  id='description'
                  aria-invalid={(validation.formState.touchedFields.description && validation.formState.errors.description ? true : false) || undefined}
                  {...validation.register('description')}
                />
                {validation.formState.touchedFields.description && validation.formState.errors.description ? (
                  <div className='text-sm text-destructive'>{validation.formState.errors.description.message}</div>
                ) : null}
              </div>
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='brand'>
                *Brand
              </Label>
              <Select_Product_Details
                inventoryId={inventoryId}
                type={'brand'}
                addEndpoint={'addNewBrand'}
                selectionInfo={brands}
                selected={validation.watch('brand') ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.formState.errors.brand?.message}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='supplier'>
                *Supplier
              </Label>
              <Select_Product_Details
                inventoryId={inventoryId}
                type={'supplier'}
                addEndpoint={'addNewSupplier'}
                selectionInfo={suppliers}
                selected={validation.watch('supplier') ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.formState.errors.supplier?.message}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='category'>
                Category
              </Label>
              <Select_Product_Details
                inventoryId={inventoryId}
                type={'category'}
                addEndpoint={'addNewCategory'}
                selectionInfo={categories}
                selected={validation.watch('category') ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.formState.errors.category?.message}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='itemCondition'>
                *Condition
              </Label>
              <Select_Condition_Product_Details
                selected={validation.watch('itemCondition') ?? ''}
                handleSelection={handleConditionSelection}
                errorMessage={validation.formState.errors.itemCondition?.message}
              />
            </div>
            <div className='px-3 md:w-full px-3'>
              <div className='mb-1 flex items-center gap-2'>
                <Label htmlFor='useEntryDate' className='font-normal'>
                  Track Entry: FIFO
                </Label>
                <input
                  type='checkbox'
                  className='size-4 shrink-0 border border-input-border accent-primary rounded-sm'
                  id='useEntryDate'
                  aria-invalid={(validation.formState.touchedFields.useEntryDate && validation.formState.errors.useEntryDate ? true : false) || undefined}
                  {...validation.register('useEntryDate')}
                />
                {validation.formState.touchedFields.useEntryDate && validation.formState.errors.useEntryDate ? (
                  <div className='text-sm text-destructive'>{validation.formState.errors.useEntryDate.message}</div>
                ) : null}
              </div>
            </div>
            <div className='w-full px-3 flex flex-row justify-start items-center gap-3'>
              <div className='mb-3 inline-flex items-center gap-2'>
                <Label htmlFor='useExpireDate' className='font-normal'>
                  Track Expiration
                </Label>
                <input
                  type='checkbox'
                  className='size-4 shrink-0 border border-input-border accent-primary rounded-sm'
                  id='useExpireDate'
                  aria-invalid={(validation.formState.touchedFields.useExpireDate && validation.formState.errors.useExpireDate ? true : false) || undefined}
                  {...validation.register('useExpireDate')}
                />
                {validation.formState.touchedFields.useExpireDate && validation.formState.errors.useExpireDate ? (
                  <div className='text-sm text-destructive'>{validation.formState.errors.useExpireDate.message}</div>
                ) : null}
              </div>
              {useExpireDateValue && (
                <div className='mb-3 flex flex-row justify-start items-center gap-3'>
                  <Label htmlFor='expirationTime' className='text-nowrap font-normal'>
                    *Expiration Time (Days)
                  </Label>
                  <Input
                    type='number'
                    className='text-[13px] h-8 text-xs'
                    placeholder='Expires in Days'
                    id='expirationTime'
                    min={0}
                    aria-invalid={(validation.formState.touchedFields.expirationTime && validation.formState.errors.expirationTime ? true : false) || undefined}
                    {...validation.register('expirationTime')}
                  />
                  {validation.formState.touchedFields.expirationTime && validation.formState.errors.expirationTime ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.expirationTime.message}</div>
                  ) : null}
                </div>
              )}
            </div>
            <div className='px-3 md:w-full'>
              <div className='mb-3'>
                <Label htmlFor='note'>
                  Product Note
                </Label>
                <Textarea
                  className='text-[13px] h-8 text-xs'
                  placeholder=''
                  id='note'
                  aria-invalid={(validation.formState.touchedFields.note && validation.formState.errors.note ? true : false) || undefined}
                  {...validation.register('note')}
                />
                {validation.formState.touchedFields.note && validation.formState.errors.note ? (
                  <div className='text-sm text-destructive'>{validation.formState.errors.note.message}</div>
                ) : null}
              </div>
            </div>
            <div className='px-3 md:w-full'>
              <div className='flex flex-row justify-end items-center gap-3'>
                <Button disabled={isLoading} type='button' variant='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit'>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      {uploadLogoImage.isOpen ? <UploadFileModal {...uploadLogoImage} /> : null}
    </div>
  )
}

export default General_Product_Details
