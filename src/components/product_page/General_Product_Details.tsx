/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'

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

const General_Product_Details = ({ inventoryId, sku, image, title, description, brand, category, supplier, itemCondition, note, brands, categories, suppliers }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [showEditButton, setShowEditButton] = useState({ display: 'none' })
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      image,
      title,
      description,
      brand,
      category,
      supplier,
      itemCondition: itemCondition ?? 'New',
      note,
    },
    validationSchema: Yup.object({
      title: Yup.string().max(100, 'Title is to Long').required('Please enter product title'),
      image: Yup.string().url(),
      description: Yup.string().max(300, 'Title is to Long'),
      brand: Yup.string().max(200, 'Title is to Long').required('Please enter product brand'),
      category: Yup.string().max(100, 'Title is to Long').required('Please enter product category'),
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

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleShowEditFields = () => {
    validation.setValues({
      inventoryId,
      sku,
      image,
      title,
      description,
      brand,
      category,
      supplier,
      itemCondition: itemCondition ?? 'New',
      note,
    })
    setShowEditFields(true)
  }
  return (
    <div className='px-4 pt-2 pb-4 border-bottom' onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
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
              src={
                image ? image : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
          <div className='w-100'>
            <table className='table table-sm table-borderless'>
              <body className='fs-5 bg-transparent'>
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
              </body>
            </table>
          </div>
          <div style={showEditButton}>
            <i onClick={handleShowEditFields} className='ri-pencil-fill fs-3 text-secondary' style={{ cursor: 'pointer' }}></i>
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
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.description || ''}
                  invalid={validation.touched.description && validation.errors.description ? true : false}
                />
                {validation.touched.description && validation.errors.description ? <FormFeedback type='invalid'>{validation.errors.description}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='brand' className='form-label'>
                  Brand
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
                  placeholder='brand...'
                  id='brand'
                  name='brand'
                  list='savedBrands'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.brand || ''}
                  invalid={validation.touched.brand && validation.errors.brand ? true : false}
                />
                {validation.touched.brand && validation.errors.brand ? <FormFeedback type='invalid'>{validation.errors.brand}</FormFeedback> : null}
              </FormGroup>
              <datalist id='savedBrands'>
                {brands.map((brand) => (
                  <option key={`brand${brand}`} value={brand} />
                ))}
              </datalist>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='supplier' className='form-label'>
                  Supplier
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
                  placeholder='supplier...'
                  id='supplier'
                  name='supplier'
                  list='savedSuppliers'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.supplier || ''}
                  invalid={validation.touched.supplier && validation.errors.supplier ? true : false}
                />
                {validation.touched.supplier && validation.errors.supplier ? <FormFeedback type='invalid'>{validation.errors.supplier}</FormFeedback> : null}
              </FormGroup>
              <datalist id='savedBrands'>
                {suppliers.map((supplier) => (
                  <option key={`brand${supplier}`} value={supplier} />
                ))}
              </datalist>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='category' className='form-label'>
                  Category
                </Label>
                <Input
                  type='text'
                  className='form-control fs-6'
                  placeholder='category...'
                  id='category'
                  name='category'
                  list='savedCategories'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.category || ''}
                  invalid={validation.touched.category && validation.errors.category ? true : false}
                />
                {validation.touched.category && validation.errors.category ? <FormFeedback type='invalid'>{validation.errors.category}</FormFeedback> : null}
              </FormGroup>
              <datalist id='savedCategories'>
                {categories.map((category) => (
                  <option key={`brand${category}`} value={category} />
                ))}
              </datalist>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='itemCondition' className='form-label'>
                  Condition
                </Label>
                <Input
                  type='select'
                  className='form-control fs-6'
                  placeholder='itemCondition...'
                  id='itemCondition'
                  name='itemCondition'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.itemCondition || ''}
                  invalid={validation.touched.itemCondition && validation.errors.itemCondition ? true : false}>
                  <option value='New'>New</option>
                  <option value='Like New'>Like New</option>
                  <option value='Used'>Used</option>
                </Input>
                {validation.touched.itemCondition && validation.errors.itemCondition ? <FormFeedback type='invalid'>{validation.errors.itemCondition}</FormFeedback> : null}
              </FormGroup>
            </Col>
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
                  className='form-control'
                  placeholder=''
                  id='note'
                  name='note'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.note || ''}
                  invalid={validation.touched.note && validation.errors.note ? true : false}
                />
                {validation.touched.image && validation.errors.image ? <FormFeedback type='invalid'>{validation.errors.image}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={12}>
              <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                <Button type='button' color='light' className='btn' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button type='submit' color='primary' className='btn'>
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

export default General_Product_Details
