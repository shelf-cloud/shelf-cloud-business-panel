/* eslint-disable @next/next/no-img-element */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import { SelectSingleValueType } from '@components/Common/SimpleSelectWithImage'
import UploadFileModal, { HandleSubmitParams, UploadResponse } from '@components/modals/shared/UploadFileModal'
import SelectSingleFilterWithCreation from '@components/ui/filters/SelectSingleFilterWithCreation'
import AppContext from '@context/AppContext'
import { useSuppliersBrandsCategories } from '@hooks/products/useSuppliersBrandsCategories'
import { FormatBytes } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { z } from 'zod'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'
import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

// import UploadProductsModal from '@components/UploadProductsModal'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      businessName: string
    }
  }
}

const toNumberOrNaN = (v: unknown) => {
  if (typeof v === 'number') return v
  if (v === '' || v === null || v === undefined) return NaN
  const n = Number(v)
  return n
}

const AddProducts = ({ session }: Props) => {
  const { state } = useContext(AppContext)
  const title = `Add Product | ${session?.user?.businessName}`
  const { generate_new_forecast_products } = useRPNewForecast()
  const [useSameUnitDimensions, setUseSameUnitDimensions] = useState(false)

  const { brands, suppliers, categories, addNewOption } = useSuppliersBrandsCategories()

  const schema = z.object({
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
    barcode: z.string().max(50, 'barcode is to Long').min(1, 'Please Enter Your Barcode'),
    brand: z.string().optional(),
    supplier: z.string().optional(),
    category: z.string().optional(),
    defaultPrice: z.preprocess(toNumberOrNaN, z.number()),
    weight: z.preprocess(toNumberOrNaN, z.number()),
    width: z.preprocess(toNumberOrNaN, z.number()),
    length: z.preprocess(toNumberOrNaN, z.number()),
    height: z.preprocess(toNumberOrNaN, z.number()),
    boxweight: z.preprocess(toNumberOrNaN, z.number()),
    boxwidth: z.preprocess(toNumberOrNaN, z.number()),
    boxlength: z.preprocess(toNumberOrNaN, z.number()),
    boxheight: z.preprocess(toNumberOrNaN, z.number()),
    boxqty: z.preprocess(toNumberOrNaN, z.number().int('Only integers')),
  })

  const defaultFormValues = {
    title: '',
    sku: '',
    image: '',
    asin: '',
    fnsku: '',
    barcode: '',
    brand: '',
    supplier: '',
    category: '',
    defaultPrice: '',
    weight: '',
    width: '',
    length: '',
    height: '',
    boxweight: '',
    boxwidth: '',
    boxlength: '',
    boxheight: '',
    boxqty: '',
  }

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues as any,
  })

  const onSubmit = async (values: z.output<typeof schema>) => {
    const loadingToast = toast.loading('Creating new product...')

    const { data } = await axios.post(`/api/products/createNewProduct?region=${state?.currentRegion}&businessId=${state?.user.businessId}`, {
      productInfo: values,
    })
    if (!data.error && data.inventoryId) {
      generate_new_forecast_products({
        skus: [values.sku],
        productIds: [data.inventoryId],
      })
      toast.update(loadingToast, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      validation.reset(defaultFormValues as any)
      uploadLogoImage.handleClearFiles()
    } else {
      toast.update(loadingToast, {
        render: data.message ?? 'Error creating product',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const handleBoxDimensionsCheckbox = () => {
    const currentWeight = validation.getValues('weight')
    validation.setValue('boxweight', currentWeight, { shouldValidate: true, shouldDirty: true })

    if (!useSameUnitDimensions) {
      setUseSameUnitDimensions(true)
      validation.setValue('boxweight', validation.getValues('weight'), { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxwidth', validation.getValues('width'), { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxlength', validation.getValues('length'), { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxheight', validation.getValues('height'), { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxqty', 1 as any, { shouldValidate: true, shouldDirty: true })
      validation.trigger()
    } else {
      setUseSameUnitDimensions(false)
      validation.setValue('boxweight', '' as any, { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxwidth', '' as any, { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxlength', '' as any, { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxheight', '' as any, { shouldValidate: true, shouldDirty: true })
      validation.setValue('boxqty', '' as any, { shouldValidate: true, shouldDirty: true })
      validation.trigger()
    }
  }

  const [uploadLogoImage, setuploadLogoImage] = useState({
    isOpen: false,
    headerText: 'Upload Product Image',
    primaryText: 'Add Product Image',
    primaryTextSub: 'supported formats: PNG, JPG. Max size: 2MB.',
    descriptionText: 'Upload image for the product. The image should be in PNG or JPG format and optimized for web use.',
    uploadZoneText: 'Drag & drop a product image file here, or click to select one (PNG, JPG)',
    confirmText: 'Upload',
    loadingText: 'Uploading...',
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
      formData.append('assetType', 'new-product')
      formData.append('fileName', selectedFiles[0].name)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])

      const { data } = await axios.post<UploadResponse>(`/api/assets/uploadNewAsset?region=${region}&businessId=${businessId}`, formData, {
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
        if (data.url) {
          validation.setValue('image', data.url, { shouldValidate: true, shouldDirty: true })
        }
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
      setuploadLogoImage((prev) => ({ ...prev, isOpen: false }))
    },
  })

  const imageValue = validation.watch('image')

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Add Basic Product' pageTitle='Warehouse' />
          <div className='mx-auto w-full px-3'>
            <Card>
              <CardContent>
                <form onSubmit={handleAddProduct}>
                  <div className='flex flex-wrap -mx-3'>
                    <h5 className='text-[16.25px] font-bold text-primary'>Product Details</h5>
                    <div className='px-3 w-full md:w-6/12'>
                      <div className='mb-3'>
                        <Label htmlFor='firstNameinput' className='text-[11.2px]'>
                          *Title
                        </Label>
                        <Input
                          type='text'
                          placeholder='Title...'
                          id='title'
                          aria-invalid={Boolean(validation.formState.touchedFields.title && validation.formState.errors.title) || undefined}
                          {...validation.register('title')}
                        />
                        {validation.formState.touchedFields.title && validation.formState.errors.title ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.title.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-6/12'>
                      <div className='mb-3'>
                        <Label htmlFor='lastNameinput' className='text-[11.2px]'>
                          *SKU
                        </Label>
                        <Input
                          type='text'
                          placeholder='Sku...'
                          id='sku'
                          aria-invalid={Boolean(validation.formState.touchedFields.sku && validation.formState.errors.sku) || undefined}
                          {...validation.register('sku')}
                        />
                        {validation.formState.touchedFields.sku && validation.formState.errors.sku ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.sku.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          ASIN
                        </Label>
                        <Input
                          type='text'
                          placeholder='Asin...'
                          id='asin'
                          aria-invalid={Boolean(validation.formState.touchedFields.asin && validation.formState.errors.asin) || undefined}
                          {...validation.register('asin')}
                        />
                        {validation.formState.touchedFields.asin && validation.formState.errors.asin ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.asin.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          FNSKU
                        </Label>
                        <Input
                          type='text'
                          placeholder='Fnsku...'
                          id='fnsku'
                          aria-invalid={Boolean(validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku) || undefined}
                          {...validation.register('fnsku')}
                        />
                        {validation.formState.touchedFields.fnsku && validation.formState.errors.fnsku ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.fnsku.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          UPC / Barcode
                        </Label>
                        <Input
                          type='text'
                          placeholder='Barcode...'
                          id='barcode'
                          aria-invalid={Boolean(validation.formState.touchedFields.barcode && validation.formState.errors.barcode) || undefined}
                          {...validation.register('barcode')}
                        />
                        {validation.formState.touchedFields.barcode && validation.formState.errors.barcode ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.barcode.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Selling Price {state?.currentRegion == 'us' ? '($)' : '(€)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Selling Price...'
                          id='defaultPrice'
                          aria-invalid={Boolean(validation.formState.touchedFields.defaultPrice && validation.formState.errors.defaultPrice) || undefined}
                          {...validation.register('defaultPrice')}
                        />
                        {validation.formState.touchedFields.defaultPrice && validation.formState.errors.defaultPrice ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.defaultPrice.message}</div>
                        ) : null}
                      </div>
                    </div>

                    {/* BRAND - SUPPLIERS - CATEGORY SELECT WITH CREATION COMPONENTS HERE */}
                    <div className='px-3 w-full md:w-4/12'>
                      <SelectSingleFilterWithCreation
                        inputLabel='Brand'
                        inputName='select-new-product-brand'
                        placeholder='Select Brand...'
                        selected={
                          brands
                            .map((brand) => {
                              return { value: brand, label: brand }
                            })
                            .find((brand) => brand.value === validation.watch('brand')) || { value: '', label: 'Select Brand...' }
                        }
                        options={[
                          { value: '', label: 'Select Brand...' },
                          ...brands.map((brand) => {
                            return { value: brand, label: brand }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setValue('brand', String(option?.value ?? ''), { shouldValidate: true, shouldDirty: true })
                        }}
                        validationSchema={z.object({
                          name: z
                            .string()
                            .min(1, `Brand required`)
                            .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long'),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewBrand', values })
                        }}
                      />
                    </div>
                    <div className='px-3 w-full md:w-4/12'>
                      <SelectSingleFilterWithCreation
                        inputLabel='Supplier'
                        inputName='select-new-product-supplier'
                        placeholder='Select Supplier...'
                        selected={
                          suppliers
                            .map((supplier) => {
                              return { value: supplier, label: supplier }
                            })
                            .find((supplier) => supplier.value === validation.watch('supplier')) || { value: '', label: 'Select Supplier...' }
                        }
                        options={[
                          { value: '', label: 'Select Supplier...' },
                          ...suppliers.map((supplier) => {
                            return { value: supplier, label: supplier }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setValue('supplier', String(option?.value ?? ''), { shouldValidate: true, shouldDirty: true })
                        }}
                        validationSchema={z.object({
                          name: z
                            .string()
                            .min(1, `Supplier required`)
                            .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long'),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewSupplier', values })
                        }}
                      />
                    </div>
                    <div className='px-3 w-full md:w-4/12'>
                      <SelectSingleFilterWithCreation
                        inputLabel='Category'
                        inputName='select-new-product-category'
                        placeholder='Select Category...'
                        selected={
                          categories
                            .map((category) => {
                              return { value: category, label: category }
                            })
                            .find((category) => category.value === validation.watch('category')) || { value: '', label: 'Select Category...' }
                        }
                        options={[
                          { value: '', label: 'Select Category...' },
                          ...categories.map((category) => {
                            return { value: category, label: category }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setValue('category', String(option?.value ?? ''), { shouldValidate: true, shouldDirty: true })
                        }}
                        validationSchema={z.object({
                          name: z
                            .string()
                            .min(1, `Category required`)
                            .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long'),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewCategory', values })
                        }}
                      />
                    </div>

                    {/* ADD PRODUCT IMAGE */}
                    <div className='flex flex-wrap -mx-3 items-center'>
                      {imageValue && (
                        <div className='px-3 w-2/12 md:w-1/12' style={{ minWidth: 'fit-content' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '40px',
                              margin: '0px',
                              position: 'relative',
                            }}>
                            <img
                              loading='lazy'
                              src={imageValue}
                              onError={(e) => (e.currentTarget.src = NoImageAdress)}
                              alt='Product preview'
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              onLoad={() => {
                                URL.revokeObjectURL(imageValue)
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className='px-3 w-10/12 md:w-9/12'>
                        <div className='!mb-0'>
                          <Label htmlFor='lastNameinput' className='text-[11.2px]'>
                            Product Image
                          </Label>
                          <Input
                            type='text'
                            disabled={uploadLogoImage.selectedFiles.length > 0}
                            placeholder='Image URL...'
                            id='image'
                            aria-invalid={Boolean(validation.formState.touchedFields.image && validation.formState.errors.image) || undefined}
                            {...validation.register('image')}
                          />
                          {validation.formState.touchedFields.image && validation.formState.errors.image ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.image.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 w-4/12 md:w-2/12'>
                        <Button className='flex items-center gap-2 m-0' size='sm' onClick={() => setuploadLogoImage((prev) => ({ ...prev, isOpen: true }))}>
                          <i className='mdi mdi-cloud-upload text-[16.25px] m-0 p-0' />
                          Image
                        </Button>
                      </div>
                    </div>

                    <div className='mt-3 border border-dashed border-[color:var(--border)]'></div>

                    {/* DIMENSIONS & WEIGHTS */}

                    <h5 className='text-[16.25px] mt-3 font-bold text-primary'>Unit Dimensions</h5>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Weight {state?.currentRegion == 'us' ? '(lb)' : '(kg)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Weight...'
                          id='weight'
                          aria-invalid={Boolean(validation.formState.touchedFields.weight && validation.formState.errors.weight) || undefined}
                          {...validation.register('weight')}
                        />
                        {validation.formState.touchedFields.weight && validation.formState.errors.weight ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.weight.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Width {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Width...'
                          id='width'
                          aria-invalid={Boolean(validation.formState.touchedFields.width && validation.formState.errors.width) || undefined}
                          {...validation.register('width')}
                        />
                        {validation.formState.touchedFields.width && validation.formState.errors.width ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.width.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Length {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Length...'
                          id='length'
                          aria-invalid={Boolean(validation.formState.touchedFields.length && validation.formState.errors.length) || undefined}
                          {...validation.register('length')}
                        />
                        {validation.formState.touchedFields.length && validation.formState.errors.length ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.length.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Height {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Height...'
                          id='height'
                          aria-invalid={Boolean(validation.formState.touchedFields.height && validation.formState.errors.height) || undefined}
                          {...validation.register('height')}
                        />
                        {validation.formState.touchedFields.height && validation.formState.errors.height ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.height.message}</div>
                        ) : null}
                      </div>
                    </div>

                    <div className='mt-3 border border-dashed border-[color:var(--border)]'></div>

                    {/* BOX DIMENSIONS & WEIGHTS */}

                    <div className='items-baseline flex gap-3 justify-start mb-2'>
                      <h5 className='text-[16.25px] mt-3 font-bold text-primary'>Box Dimensions</h5>
                      <div className='shrink-0'>
                        <div className='flex items-center gap-2'>
                          <Label className='text-muted-foreground'>Same as unit dimensions</Label>
                          <Switch checked={useSameUnitDimensions} onChange={handleBoxDimensionsCheckbox} />
                        </div>
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Box Weight {state?.currentRegion == 'us' ? '(lb)' : '(kg)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Box Weight...'
                          id='boxweight'
                          aria-invalid={Boolean(validation.formState.touchedFields.boxweight && validation.formState.errors.boxweight) || undefined}
                          {...validation.register('boxweight')}
                        />
                        {validation.formState.touchedFields.boxweight && validation.formState.errors.boxweight ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.boxweight.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Box Width {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Box Width...'
                          id='boxwidth'
                          aria-invalid={Boolean(validation.formState.touchedFields.boxwidth && validation.formState.errors.boxwidth) || undefined}
                          {...validation.register('boxwidth')}
                        />
                        {validation.formState.touchedFields.boxwidth && validation.formState.errors.boxwidth ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.boxwidth.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Box Length {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Box Length...'
                          id='boxlength'
                          aria-invalid={Boolean(validation.formState.touchedFields.boxlength && validation.formState.errors.boxlength) || undefined}
                          {...validation.register('boxlength')}
                        />
                        {validation.formState.touchedFields.boxlength && validation.formState.errors.boxlength ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.boxlength.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Box Height {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          placeholder='Box Height...'
                          id='boxheight'
                          aria-invalid={Boolean(validation.formState.touchedFields.boxheight && validation.formState.errors.boxheight) || undefined}
                          {...validation.register('boxheight')}
                        />
                        {validation.formState.touchedFields.boxheight && validation.formState.errors.boxheight ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.boxheight.message}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className='px-3 w-full md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='text-[11.2px]'>
                          Box Quantity
                        </Label>
                        <Input
                          type='number'
                          placeholder='Box Qty...'
                          id='boxqty'
                          aria-invalid={Boolean(validation.formState.touchedFields.boxqty && validation.formState.errors.boxqty) || undefined}
                          {...validation.register('boxqty')}
                        />
                        {validation.formState.touchedFields.boxqty && validation.formState.errors.boxqty ? (
                          <div className='text-sm text-destructive'>{validation.formState.errors.boxqty.message}</div>
                        ) : null}
                      </div>
                    </div>

                    <h5 className='text-[11.2px] mb-3 text-muted-foreground font-light'>*You must complete all required fields.</h5>
                    <div className='px-3 w-full'>
                      <div className='text-right'>
                        <Button type='submit'>
                          Add New Product
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        {uploadLogoImage.isOpen ? <UploadFileModal {...uploadLogoImage} /> : null}
      </React.Fragment>
    </div>
  )
}

export default AddProducts
