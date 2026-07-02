/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from '@/components/migration-ui'
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
    <div className='tw:px-4 tw:pt-2 tw:pb-4 tw:border-b tw:border-[color:var(--border)]'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold'>General</p>
      {!showEditFields ? (
        <div className='tw:w-full tw:flex tw:justify-start tw:items-start tw:gap-4'>
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
          <div className='tw:w-full'>
            <table className='tw:w-full tw:text-[13px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
              <tbody className='tw:bg-transparent'>
                <tr>
                  <td className='tw:font-extrabold'>Name</td>
                  <td>{title}</td>
                </tr>
                <tr>
                  <td className='tw:font-extrabold'>Description</td>
                  <td className={description ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>{description ?? 'No Description'}</td>
                </tr>
                <tr>
                  <td className='tw:font-extrabold'>Brand</td>
                  <td className={brand ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>{brand ?? 'No Brand'}</td>
                </tr>
                <tr>
                  <td className='tw:font-extrabold'>Category</td>
                  <td className={category ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>{category ?? 'No Category'}</td>
                </tr>
                <tr>
                  <td className='tw:font-extrabold'>Supplier</td>
                  <td className={supplier ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>{supplier ?? 'No supplier'}</td>
                </tr>
                <tr>
                  <td className='tw:font-extrabold'>Condition</td>
                  <td className={itemCondition ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>{itemCondition ?? 'No supplier'}</td>
                </tr>
                {note && (
                  <tr>
                    <td className='tw:font-extrabold'>Note</td>
                    <td className='tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'>{note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div>{/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}</div>
        </div>
      ) : (
        <Form onSubmit={handleAddProduct}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor='title'>
                  *Title
                </Label>
                <Input
                  type='text'
                  className='tw:text-[13px]'
                  placeholder='Title...'
                  id='title'
                  name='title'
                  bsSize='sm'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title || ''}
                  invalid={validation.touched.title && validation.errors.title ? true : false}
                />
                {validation.touched.title && validation.errors.title ? <FormFeedback type='invalid'>{validation.errors.title}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label htmlFor='description'>
                  Product Description
                </Label>
                <Input
                  type='text'
                  className='tw:text-[13px]'
                  placeholder='Description...'
                  id='description'
                  name='description'
                  bsSize='sm'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.description ?? ''}
                  invalid={validation.touched.description && validation.errors.description ? true : false}
                />
                {validation.touched.description && validation.errors.description ? <FormFeedback type='invalid'>{validation.errors.description}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <Label htmlFor='itemCondition'>
                *Condition
              </Label>
              <Select_Condition_Kit_Details
                selected={validation.values.itemCondition ?? ''}
                handleSelection={handleConditionSelection}
                errorMessage={validation.errors.itemCondition}
              />
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label htmlFor='lastNameinput'>
                  Product Image
                </Label>
                <Input
                  type='text'
                  className='tw:text-[13px]'
                  placeholder='Image URL...'
                  id='image'
                  name='image'
                  bsSize='sm'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.image || ''}
                  invalid={validation.touched.image && validation.errors.image ? true : false}
                />
                {validation.touched.image && validation.errors.image ? <FormFeedback type='invalid'>{validation.errors.image}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup>
                <Label htmlFor='note'>
                  Product Note
                </Label>
                <Input
                  type='textarea'
                  className='tw:text-[13px]'
                  placeholder=''
                  id='note'
                  name='note'
                  bsSize='sm'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.note || ''}
                  invalid={validation.touched.note && validation.errors.note ? true : false}
                />
                {validation.touched.note && validation.errors.note ? <FormFeedback type='invalid'>{validation.errors.note}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={12}>
              <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-3'>
                <Button type='button' color='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button type='submit' color='primary'>
                  Save Changes
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}

export default General_Kit_Details
