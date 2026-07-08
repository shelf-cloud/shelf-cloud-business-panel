
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import router from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import SimpleSelect from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { useCreateKit } from '@hooks/kits/useCreateKit'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { z } from 'zod'

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

const AddKit = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const { skus, validSkus, skuInfo, isLoading } = useCreateKit()
  const title = `Create New Kit | ${session?.user?.businessName}`
  const [creatingKit, setCreatingKit] = useState(false)

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
    weight: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Weight' }).gt(0, 'Value must be grater than 0')),
    width: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Width' }).gt(0, 'Value must be grater than 0')),
    length: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Length' }).gt(0, 'Value must be grater than 0')),
    height: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Height' }).gt(0, 'Value must be grater than 0')),
    boxqty: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Qty' }).int('Only integers').gt(0, 'Value must be grater than 0')),
    boxweight: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Eeight' }).gt(0, 'Value must be grater than 0')),
    boxwidth: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Width' }).gt(0, 'Value must be grater than 0')),
    boxlength: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Length' }).gt(0, 'Value must be grater than 0')),
    boxheight: z.preprocess(toNumberOrNaN, z.number({ error: 'Please Enter Your Box Height' }).gt(0, 'Value must be grater than 0')),
    children: z.array(childSchema).min(1, 'Must have products'),
  })

  const initialValues = {
    title: '',
    sku: '',
    image: '',
    asin: '',
    fnsku: '',
    barcode: '',
    weight: '',
    width: '',
    length: '',
    height: '',
    boxqty: '',
    boxweight: '',
    boxlength: '',
    boxwidth: '',
    boxheight: '',
    children: [
      {
        sku: '',
        title: '',
        qty: 1,
        inventoryId: 0,
      },
    ],
  }

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialValues as any,
  })

  const { fields, remove, append } = useFieldArray({ control: validation.control, name: 'children' })

  const handleSubmit = async (values: z.output<typeof schema>) => {
    setCreatingKit(true)
    const creatingKit = toast.loading('Creating Kit...')

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
      toast.update(creatingKit, {
        render: 'Duplicate SKUs found in Children List',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      setCreatingKit(false)
      return
    }

    const { data } = await axios.post(`/api/kits/createNewKit?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderInfo: values,
    })
    if (!data.error) {
      toast.update(creatingKit, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      validation.reset(initialValues as any)
      router.push('/Kits')
    } else {
      toast.update(creatingKit, {
        render: data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setCreatingKit(false)
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Create New Kit' pageTitle='Inventory' />
            <Card>
              <CardContent className='px-4'>
                {!isLoading ? (
                  <form onSubmit={validation.handleSubmit(handleSubmit)}>
                    <div className='flex flex-wrap -mx-3'>
                      <h5 className='text-[16.25px] mb-4 font-extrabold'>New Kit Details</h5>
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
                      <div className='px-3 md:w-full'>
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
                      <h5 className='text-[16.25px] my-4 font-extrabold'>Unit Dimensions</h5>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='weight' className='mb-1'>
                            *Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Weight...'
                            id='weight'
                            aria-invalid={(validation.formState.touchedFields.weight && validation.formState.errors.weight ? true : false) || undefined}
                            {...validation.register('weight')}
                          />
                          {validation.formState.touchedFields.weight && validation.formState.errors.weight ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.weight.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='width' className='mb-1'>
                            *Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Width...'
                            id='width'
                            aria-invalid={(validation.formState.touchedFields.width && validation.formState.errors.width ? true : false) || undefined}
                            {...validation.register('width')}
                          />
                          {validation.formState.touchedFields.width && validation.formState.errors.width ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.width.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='length' className='mb-1'>
                            *Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Length...'
                            id='length'
                            aria-invalid={(validation.formState.touchedFields.length && validation.formState.errors.length ? true : false) || undefined}
                            {...validation.register('length')}
                          />
                          {validation.formState.touchedFields.length && validation.formState.errors.length ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.length.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='height' className='mb-1'>
                            *Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Height...'
                            id='height'
                            aria-invalid={(validation.formState.touchedFields.height && validation.formState.errors.height ? true : false) || undefined}
                            {...validation.register('height')}
                          />
                          {validation.formState.touchedFields.height && validation.formState.errors.height ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.height.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <h5 className='text-[16.25px] my-4 font-extrabold'>Master Box Dimensions</h5>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='boxweight' className='mb-1'>
                            *Box Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Box Weight...'
                            id='boxweight'
                            aria-invalid={(validation.formState.touchedFields.boxweight && validation.formState.errors.boxweight ? true : false) || undefined}
                            {...validation.register('boxweight')}
                          />
                          {validation.formState.touchedFields.boxweight && validation.formState.errors.boxweight ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.boxweight.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='boxwidth' className='mb-1'>
                            *Box Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Box Width...'
                            id='boxwidth'
                            aria-invalid={(validation.formState.touchedFields.boxwidth && validation.formState.errors.boxwidth ? true : false) || undefined}
                            {...validation.register('boxwidth')}
                          />
                          {validation.formState.touchedFields.boxwidth && validation.formState.errors.boxwidth ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.boxwidth.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='boxlength' className='mb-1'>
                            *Box Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Box Length...'
                            id='boxlength'
                            aria-invalid={(validation.formState.touchedFields.boxlength && validation.formState.errors.boxlength ? true : false) || undefined}
                            {...validation.register('boxlength')}
                          />
                          {validation.formState.touchedFields.boxlength && validation.formState.errors.boxlength ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.boxlength.message}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className='px-3 md:w-3/12'>
                        <div className='mb-3'>
                          <Label htmlFor='boxheight' className='mb-1'>
                            *Box Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                          </Label>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Box Height...'
                            id='boxheight'
                            aria-invalid={(validation.formState.touchedFields.boxheight && validation.formState.errors.boxheight ? true : false) || undefined}
                            {...validation.register('boxheight')}
                          />
                          {validation.formState.touchedFields.boxheight && validation.formState.errors.boxheight ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.boxheight.message}</div>
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
                      <div className='flex flex-wrap -mx-3'>
                        <h5 className='text-[16.25px] mb-4 font-extrabold'>Kit Children</h5>
                        <div className='px-3 xl:w-full p-0 mt-1'>
                          <table className='w-full align-middle text-nowrap [&_th]:px-2 [&_td]:px-2'>
                            <thead>
                              <tr>
                                <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'></th>
                                <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                  SKU
                                </th>
                                <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                  Title
                                </th>
                                <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
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
                                          menuPortalTarget={document?.body}
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
                      <h5 className='text-[13px] my-0 text-muted-foreground font-normal'>*You must complete all required fields or you will not be able to create your product.</h5>
                      <div className='px-3 md:w-full'>
                        <div className='text-right'>
                          <Button type='submit' disabled={creatingKit}>
                            {creatingKit ? (
                              <span className='flex items-center gap-2'>
                                <Spinner className='text-white' /> Creating...
                              </span>
                            ) : (
                              'Create Kit'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className='flex flex-wrap -mx-3'>
                    <h5>Loading...</h5>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default AddKit
