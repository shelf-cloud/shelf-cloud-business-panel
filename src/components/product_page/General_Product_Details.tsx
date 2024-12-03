/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import Select_Product_Details from './Select_Product_Details'
import Select_Condition_Product_Details from './Select_Condition_Product_Details'

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
      useEntryDate,
      useExpireDate,
      expirationTime,
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
      expirationTime: Yup.number()
        .min(0, 'Minimum of 0')
        .when('useExpireDate', {
          is: true,
          then: Yup.number().min(1, 'Minimum of 1').required('Enter Expiration Time'),
        }),
      note: Yup.string().max(300, 'Title is to Long'),
    }),
    onSubmit: async (values) => {
      setisLoading(true)
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
      setisLoading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    console.log(validation.values)
    console.log(validation.errors)
    validation.handleSubmit()
  }

  const handleShowEditFields = () => {
    validation.setValues({
      inventoryId,
      sku,
      image,
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
    })
    setShowEditFields(true)
  }

  const handleSelection = (type: string, value: string) => {
    validation.setFieldValue(type, value)
  }

  const handleConditionSelection = (value: string) => {
    validation.setFieldValue('itemCondition', value)
  }

  return (
    <div className='px-4 pt-2 pb-4 border-bottom'>
      <p className='fs-4 text-primary fw-semibold'>General</p>
      {!showEditFields ? (
        <div className='w-full d-flex justify-content-start align-items-start gap-4'>
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
              src={
                image ? image : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
          <div className='w-100'>
            <table className='table table-sm table-borderless'>
              <tbody className='fs-6 bg-transparent'>
                <tr>
                  <td className='fw-bolder'>Name</td>
                  <td>{title}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Description</td>
                  <td className={description ?? 'text-muted fw-light fst-italic'}>{description ?? 'No Description'}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Brand</td>
                  <td className={brand ?? 'text-muted fw-light fst-italic'}>{brand ?? 'No Brand'}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Category</td>
                  <td className={category ?? 'text-muted fw-light fst-italic'}>{category ?? 'No Category'}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Supplier</td>
                  <td className={supplier ?? 'text-muted fw-light fst-italic'}>{supplier ?? 'No supplier'}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Condition</td>
                  <td className={itemCondition ?? 'text-muted fw-light fst-italic'}>{itemCondition ?? 'No supplier'}</td>
                </tr>
                <tr>
                  <td className='fw-bolder'>Tracking</td>
                  <td className={itemCondition ?? 'text-muted fw-light fst-italic'}>
                    <p className='m-0 p-0'>
                      <span className='fw-semibold'>FIFO:</span> {useEntryDate ? 'Yes' : 'No'}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='fw-semibold'>Expires:</span> {useExpireDate ? `${expirationTime} Days` : 'No'}
                    </p>
                  </td>
                </tr>
                {note && (
                  <tr>
                    <td className='fw-bolder'>Note</td>
                    <td className='text-muted fw-light fst-italic'>{note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div>
            <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i>
          </div>
        </div>
      ) : (
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='title' className='form-label'>
                  *Title
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
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
              <FormGroup className='mb-3'>
                <Label htmlFor='description' className='form-label'>
                  Product Description
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
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
              <Label htmlFor='brand' className='form-label'>
                *Brand
              </Label>
              <Select_Product_Details
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
              <Label htmlFor='supplier' className='form-label'>
                *Supplier
              </Label>
              <Select_Product_Details
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
              <Label htmlFor='category' className='form-label'>
                Category
              </Label>
              <Select_Product_Details
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
              <Label htmlFor='itemCondition' className='form-label'>
                *Condition
              </Label>
              <Select_Condition_Product_Details
                selected={validation.values.itemCondition ?? ''}
                handleSelection={handleConditionSelection}
                errorMessage={validation.errors.itemCondition}
              />
            </Col>
            <Col md={12} className='px-3'>
              <FormGroup className='mb-1' check inline>
                <Label htmlFor='useEntryDate' className='form-label' check>
                  Track Entry: FIFO
                </Label>
                <Input
                  type='checkbox'
                  id='useEntryDate'
                  name='useEntryDate'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  checked={validation.values.useEntryDate || false}
                  invalid={validation.touched.useEntryDate && validation.errors.useEntryDate ? true : false}
                />
                {validation.touched.useEntryDate && validation.errors.useEntryDate ? <FormFeedback type='invalid'>{validation.errors.useEntryDate}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <div className='w-100 px-3 d-flex flex-row justify-content-start align-items-center gap-3'>
              <FormGroup className='mb-3' check inline>
                <Label htmlFor='useExpireDate' className='form-label' check>
                  Track Expiration
                </Label>
                <Input
                  type='checkbox'
                  id='useExpireDate'
                  name='useExpireDate'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  checked={validation.values.useExpireDate || false}
                  invalid={validation.touched.useExpireDate && validation.errors.useExpireDate ? true : false}
                />
                {validation.touched.useExpireDate && validation.errors.useExpireDate ? <FormFeedback type='invalid'>{validation.errors.useExpireDate}</FormFeedback> : null}
              </FormGroup>
              {validation.values.useExpireDate && (
                <FormGroup className='mb-3 d-flex flex-row justify-content-start align-items-center gap-3'>
                  <Label htmlFor='expirationTime' className='form-label text-nowrap' check>
                    *Expiration Time (Days)
                  </Label>
                  <Input
                    type='number'
                    className='form-control fs-6'
                    placeholder='Expires in Days'
                    id='expirationTime'
                    name='expirationTime'
                    bsSize='sm'
                    min={0}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.expirationTime ?? ''}
                    invalid={validation.touched.expirationTime && validation.errors.expirationTime ? true : false}
                  />
                  {validation.touched.expirationTime && validation.errors.expirationTime ? <FormFeedback type='invalid'>{validation.errors.expirationTime}</FormFeedback> : null}
                </FormGroup>
              )}
            </div>
            <Col md={12}>
              <FormGroup className='mb-3'>
                <Label htmlFor='lastNameinput' className='form-label'>
                  Product Image
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
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
              <FormGroup className='mb-3'>
                <Label htmlFor='note' className='form-label'>
                  Product Note
                </Label>
                <Input
                  type='textarea'
                  className='form-control fs-6'
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
              <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                <Button disabled={isLoading} type='button' color='light' className='btn' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit' color='primary' className='btn'>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}

export default General_Product_Details
