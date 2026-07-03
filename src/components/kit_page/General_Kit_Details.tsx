/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { Label } from '@shadcn/ui/label'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import Select_Condition_Kit_Details from './Select_Condition_Kit_Details'
import Select_Kit_Details from './Select_Kit_Details'

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
}

const General_Kit_Details = ({ inventoryId, sku, image, title, description, brand, category, supplier, itemCondition, note, brands, categories, suppliers }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      image,
      title,
      description: description ?? '',
      brand: brand ?? '',
      category: category ?? '',
      supplier: supplier ?? '',
      itemCondition: itemCondition ?? 'New',
      note,
    },
    validationSchema: Yup.object({
      title: Yup.string().max(100, 'Title is to Long').required('Please enter product title'),
      image: Yup.string().url(),
      description: Yup.string().max(300, 'Title is to Long'),
      brand: Yup.string().max(200, 'Title is to Long').required('Please enter product brand'),
      category: Yup.string().max(100, 'Title is to Long'),
      supplier: Yup.string().max(200, 'Title is to Long').required('Please enter product supplier'),
      itemCondition: Yup.string().max(10, 'Title is to Long').required('Please select product condition'),
      note: Yup.string().max(300, 'Title is to Long'),
    }),
    onSubmit: async (values) => {
      const response = await axios.post(`/api/productDetails/generalProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  // const handleShowEditFields = () => {
  //   validation.setValues({
  //     inventoryId,
  //     sku,
  //     image,
  //     title,
  //     description: description ?? '',
  //     brand: brand ?? '',
  //     category: category ?? '',
  //     supplier: supplier ?? '',
  //     itemCondition: itemCondition ?? 'New',
  //     note,
  //   })
  //   setShowEditFields(true)
  // }

  const handleSelection = (type: string, value: string) => {
    validation.setFieldValue(type, value)
  }

  const handleConditionSelection = (value: string) => {
    validation.setFieldValue('itemCondition', value)
  }

  return (
    <div className='px-4 pt-2 pb-4 border-b border-[color:var(--border)]'>
      <p className='text-[19.5px] text-primary font-semibold'>General</p>
      {!showEditFields ? (
        <div className='w-full flex justify-start items-start gap-4'>
          <div
            style={{
              width: '30%',
              height: 'auto',
              margin: '2px 0px',
              position: 'relative',
              minWidth: '150px',
              maxWidth: '200px',
            }}>
            <img loading='lazy' src={image ? image : NoImageAdress} alt='Kit' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
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
                {note && (
                  <tr>
                    <td className='font-extrabold'>Note</td>
                    <td className='text-muted-foreground font-light italic'>{note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div>{/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}</div>
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
                  name='title'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title || ''}
                  aria-invalid={validation.touched.title && validation.errors.title ? true : undefined}
                />
                {validation.touched.title && validation.errors.title ? <div className='text-sm text-destructive'>{validation.errors.title}</div> : null}
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
                  name='description'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.description ?? ''}
                  aria-invalid={validation.touched.description && validation.errors.description ? true : undefined}
                />
                {validation.touched.description && validation.errors.description ? <div className='text-sm text-destructive'>{validation.errors.description}</div> : null}
              </div>
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='brand'>
                *Brand
              </Label>
              <Select_Kit_Details
                inventoryId={inventoryId}
                type={'brand'}
                addEndpoint={'addNewBrand'}
                selectionInfo={brands}
                selected={validation.values.brand ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.errors.brand}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='supplier'>
                *Supplier
              </Label>
              <Select_Kit_Details
                inventoryId={inventoryId}
                type={'supplier'}
                addEndpoint={'addNewSupplier'}
                selectionInfo={suppliers}
                selected={validation.values.supplier ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.errors.supplier}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='category'>
                Category
              </Label>
              <Select_Kit_Details
                inventoryId={inventoryId}
                type={'category'}
                addEndpoint={'addNewCategory'}
                selectionInfo={categories}
                selected={validation.values.category ?? ''}
                handleSelection={handleSelection}
                errorMessage={validation.errors.category}
              />
            </div>
            <div className='px-3 md:w-6/12'>
              <Label htmlFor='itemCondition'>
                *Condition
              </Label>
              <Select_Condition_Kit_Details
                selected={validation.values.itemCondition ?? ''}
                handleSelection={handleConditionSelection}
                errorMessage={validation.errors.itemCondition}
              />
            </div>
            <div className='px-3 md:w-full'>
              <div className='mb-3'>
                <Label htmlFor='lastNameinput'>
                  Product Image
                </Label>
                <Input
                  type='text'
                  className='text-[13px] h-8 text-xs'
                  placeholder='Image URL...'
                  id='image'
                  name='image'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.image || ''}
                  aria-invalid={validation.touched.image && validation.errors.image ? true : undefined}
                />
                {validation.touched.image && validation.errors.image ? <div className='text-sm text-destructive'>{validation.errors.image}</div> : null}
              </div>
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
                  name='note'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.note || ''}
                  aria-invalid={validation.touched.note && validation.errors.note ? true : undefined}
                />
                {validation.touched.note && validation.errors.note ? <div className='text-sm text-destructive'>{validation.errors.note}</div> : null}
              </div>
            </div>
            <div className='px-3 md:w-full'>
              <div className='flex flex-row justify-end items-center gap-3'>
                <Button type='button' variant='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button type='submit'>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default General_Kit_Details
