/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
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
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap'
import * as Yup from 'yup'

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

const AddProducts = ({ session }: Props) => {
  const { state } = useContext(AppContext)
  const title = `Add Product | ${session?.user?.businessName}`

  const [useSameUnitDimensions, setUseSameUnitDimensions] = useState(false)

  const { brands, suppliers, categories, addNewOption } = useSuppliersBrandsCategories()

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
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
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .matches(/^[a-zA-Z0-9-Á-öø-ÿ\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please Enter Your Title'),
      sku: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(50, 'SKU is to Long')
        .required('Please Enter Your Sku'),
      image: Yup.string().url(),
      asin: Yup.string().max(50, 'Asin is to Long'),
      fnsku: Yup.string().max(50, 'Fnsku is to Long'),
      barcode: Yup.string().max(50, 'barcode is to Long').required('Please Enter Your Barcode'),
      brand: Yup.string(),
      supplier: Yup.string(),
      category: Yup.string(),
      defaultPrice: Yup.number().default(0),
      weight: Yup.number().default(0),
      width: Yup.number().default(0),
      length: Yup.number().default(0),
      height: Yup.number().default(0),
      boxweight: Yup.number().default(0),
      boxwidth: Yup.number().default(0),
      boxlength: Yup.number().default(0),
      boxheight: Yup.number().default(0),
      boxqty: Yup.number().integer('Only integers').default(0),
    }),
    onSubmit: async (values, { resetForm }) => {
      const loadingToast = toast.loading('Creating new product...')

      const { data } = await axios.post(`/api/products/createNewProduct?region=${state?.currentRegion}&businessId=${state?.user.businessId}`, {
        productInfo: values,
      })
      if (!data.error) {
        toast.update(loadingToast, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        resetForm()
        uploadLogoImage.handleClearFiles()
      } else {
        toast.update(loadingToast, {
          render: data.message ?? 'Error creating product',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleBoxDimensionsCheckbox = () => {
    validation.setFieldValue('boxweight', validation.values.weight)

    if (!useSameUnitDimensions) {
      setUseSameUnitDimensions(true)
      validation.setFieldValue('boxweight', validation.values.weight)
      validation.setFieldValue('boxwidth', validation.values.width)
      validation.setFieldValue('boxlength', validation.values.length)
      validation.setFieldValue('boxheight', validation.values.height)
      validation.setFieldValue('boxqty', 1)
      validation.validateForm()
    } else {
      setUseSameUnitDimensions(false)
      validation.setFieldValue('boxweight', '')
      validation.setFieldValue('boxwidth', '')
      validation.setFieldValue('boxlength', '')
      validation.setFieldValue('boxheight', '')
      validation.setFieldValue('boxqty', '')
      validation.validateForm()
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
          validation.setFieldValue('image', data.url)
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
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Add Basic Product' pageTitle='Warehouse' />
          <Container fluid>
            <Card>
              <CardBody>
                <Form onSubmit={HandleAddProduct}>
                  <Row>
                    <h5 className='fs-5 fw-bold text-primary'>Product Details</h5>
                    <Col md={6}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='firstNameinput' className='form-label fs-7'>
                          *Title
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
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
                    <Col md={6}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='lastNameinput' className='form-label fs-7'>
                          *SKU
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
                          placeholder='Sku...'
                          id='sku'
                          name='sku'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.sku || ''}
                          invalid={validation.touched.sku && validation.errors.sku ? true : false}
                        />
                        {validation.touched.sku && validation.errors.sku ? <FormFeedback type='invalid'>{validation.errors.sku}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          ASIN
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
                          placeholder='Asin...'
                          id='asin'
                          name='asin'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.asin || ''}
                          invalid={validation.touched.asin && validation.errors.asin ? true : false}
                        />
                        {validation.touched.asin && validation.errors.asin ? <FormFeedback type='invalid'>{validation.errors.asin}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          FNSKU
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
                          placeholder='Fnsku...'
                          id='fnsku'
                          name='fnsku'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.fnsku || ''}
                          invalid={validation.touched.fnsku && validation.errors.fnsku ? true : false}
                        />
                        {validation.touched.fnsku && validation.errors.fnsku ? <FormFeedback type='invalid'>{validation.errors.fnsku}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          UPC / Barcode
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
                          placeholder='Barcode...'
                          id='barcode'
                          name='barcode'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.barcode || ''}
                          invalid={validation.touched.barcode && validation.errors.barcode ? true : false}
                        />
                        {validation.touched.barcode && validation.errors.barcode ? <FormFeedback type='invalid'>{validation.errors.barcode}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Selling Price {state?.currentRegion == 'us' ? '($)' : '(€)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Selling Price...'
                          id='defaultPrice'
                          name='defaultPrice'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.defaultPrice || ''}
                          invalid={validation.touched.defaultPrice && validation.errors.defaultPrice ? true : false}
                        />
                        {validation.touched.defaultPrice && validation.errors.defaultPrice ? <FormFeedback type='invalid'>{validation.errors.defaultPrice}</FormFeedback> : null}
                      </FormGroup>
                    </Col>

                    {/* BRAND - SUPPLIERS - CATEGORY SELECT WITH CREATION COMPONENTS HERE */}
                    <Col md={4}>
                      <SelectSingleFilterWithCreation
                        inputLabel='Brand'
                        inputName='select-new-product-brand'
                        placeholder='Select Brand...'
                        selected={
                          brands
                            .map((brand) => {
                              return { value: brand, label: brand }
                            })
                            .find((brand) => brand.value === validation.values['brand']) || { value: '', label: 'Select Brand...' }
                        }
                        options={[
                          { value: '', label: 'Select Brand...' },
                          ...brands.map((brand) => {
                            return { value: brand, label: brand }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setFieldValue('brand', option?.value || '')
                        }}
                        validationSchema={Yup.object({
                          name: Yup.string()
                            .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long')
                            .required(`Brand required`),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewBrand', values })
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <SelectSingleFilterWithCreation
                        inputLabel='Supplier'
                        inputName='select-new-product-supplier'
                        placeholder='Select Supplier...'
                        selected={
                          suppliers
                            .map((supplier) => {
                              return { value: supplier, label: supplier }
                            })
                            .find((supplier) => supplier.value === validation.values['supplier']) || { value: '', label: 'Select Supplier...' }
                        }
                        options={[
                          { value: '', label: 'Select Supplier...' },
                          ...suppliers.map((supplier) => {
                            return { value: supplier, label: supplier }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setFieldValue('supplier', option?.value ?? '')
                        }}
                        validationSchema={Yup.object({
                          name: Yup.string()
                            .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long')
                            .required(`Supplier required`),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewSupplier', values })
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <SelectSingleFilterWithCreation
                        inputLabel='Category'
                        inputName='select-new-product-category'
                        placeholder='Select Category...'
                        selected={
                          categories
                            .map((category) => {
                              return { value: category, label: category }
                            })
                            .find((category) => category.value === validation.values['category']) || { value: '', label: 'Select Category...' }
                        }
                        options={[
                          { value: '', label: 'Select Category...' },
                          ...categories.map((category) => {
                            return { value: category, label: category }
                          }),
                        ]}
                        handleSelect={(option: SelectSingleValueType) => {
                          validation.setFieldValue('category', option?.value ?? '')
                        }}
                        validationSchema={Yup.object({
                          name: Yup.string()
                            .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                            .max(200, 'Name is to Long')
                            .required(`Category required`),
                        })}
                        submitAddNewOption={(values) => {
                          return addNewOption({ addEndpoint: 'addNewCategory', values })
                        }}
                      />
                    </Col>

                    {/* ADD PRODUCT IMAGE */}
                    <Row className='align-items-center'>
                      {validation.values.image && (
                        <Col xs={2} md={1} style={{ minWidth: 'fit-content' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '40px',
                              margin: '0px',
                              position: 'relative',
                            }}>
                            <img
                              loading='lazy'
                              src={validation.values.image}
                              onError={(e) => (e.currentTarget.src = NoImageAdress)}
                              alt='Image preview'
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              onLoad={() => {
                                URL.revokeObjectURL(validation.values.image)
                              }}
                            />
                          </div>
                        </Col>
                      )}
                      <Col xs={10} md={9}>
                        <FormGroup className='mb-0'>
                          <Label htmlFor='lastNameinput' className='form-label fs-7'>
                            Product Image
                          </Label>
                          <Input
                            type='text'
                            disabled={uploadLogoImage.selectedFiles.length > 0}
                            className='form-control form-control-sm fs-6'
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
                      <Col xs={4} md={2}>
                        <Button className='d-flex align-items-center gap-2 m-0' color='primary' size='sm' onClick={() => setuploadLogoImage((prev) => ({ ...prev, isOpen: true }))}>
                          <i className='mdi mdi-cloud-upload fs-5 m-0 p-0' />
                          Image
                        </Button>
                      </Col>
                    </Row>

                    <div className='border mt-3 border-dashed'></div>

                    {/* DIMENSIONS & WEIGHTS */}

                    <h5 className='fs-5 mt-3 fw-bold text-primary'>Unit Dimensions</h5>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Weight {state?.currentRegion == 'us' ? '(lb)' : '(kg)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Weight...'
                          id='weight'
                          name='weight'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.weight || ''}
                          invalid={validation.touched.weight && validation.errors.weight ? true : false}
                        />
                        {validation.touched.weight && validation.errors.weight ? <FormFeedback type='invalid'>{validation.errors.weight}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Width {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Width...'
                          id='width'
                          name='width'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.width || ''}
                          invalid={validation.touched.width && validation.errors.width ? true : false}
                        />
                        {validation.touched.width && validation.errors.width ? <FormFeedback type='invalid'>{validation.errors.width}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Length {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Length...'
                          id='length'
                          name='length'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.length || ''}
                          invalid={validation.touched.length && validation.errors.length ? true : false}
                        />
                        {validation.touched.length && validation.errors.length ? <FormFeedback type='invalid'>{validation.errors.length}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Height {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Height...'
                          id='height'
                          name='height'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.height || ''}
                          invalid={validation.touched.height && validation.errors.height ? true : false}
                        />
                        {validation.touched.height && validation.errors.height ? <FormFeedback type='invalid'>{validation.errors.height}</FormFeedback> : null}
                      </FormGroup>
                    </Col>

                    <div className='border mt-3 border-dashed'></div>

                    {/* BOX DIMENSIONS & WEIGHTS */}

                    <div className='align-items-baseline d-flex gap-3 justify-content-start mb-2'>
                      <h5 className='fs-5 mt-3 fw-bold text-primary'>Box Dimensions</h5>
                      <div className='flex-shrink-0'>
                        <div className='form-check form-switch form-switch-right form-switch-sm'>
                          <Label className='form-label text-muted'>Same as unit dimensions</Label>
                          <Input className='form-check-input code-switcher' type='checkbox' checked={useSameUnitDimensions} onChange={handleBoxDimensionsCheckbox} />
                        </div>
                      </div>
                    </div>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Box Weight {state?.currentRegion == 'us' ? '(lb)' : '(kg)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Box Weight...'
                          id='boxweight'
                          name='boxweight'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxweight || ''}
                          invalid={validation.touched.boxweight && validation.errors.boxweight ? true : false}
                        />
                        {validation.touched.boxweight && validation.errors.boxweight ? <FormFeedback type='invalid'>{validation.errors.boxweight}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Box Width {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Box Width...'
                          id='boxwidth'
                          name='boxwidth'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxwidth || ''}
                          invalid={validation.touched.boxwidth && validation.errors.boxwidth ? true : false}
                        />
                        {validation.touched.boxwidth && validation.errors.boxwidth ? <FormFeedback type='invalid'>{validation.errors.boxwidth}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Box Length {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Box Length...'
                          id='boxlength'
                          name='boxlength'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxlength || ''}
                          invalid={validation.touched.boxlength && validation.errors.boxlength ? true : false}
                        />
                        {validation.touched.boxlength && validation.errors.boxlength ? <FormFeedback type='invalid'>{validation.errors.boxlength}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Box Height {state?.currentRegion == 'us' ? '(in)' : '(cm)'}
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Box Height...'
                          id='boxheight'
                          name='boxheight'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxheight || ''}
                          invalid={validation.touched.boxheight && validation.errors.boxheight ? true : false}
                        />
                        {validation.touched.boxheight && validation.errors.boxheight ? <FormFeedback type='invalid'>{validation.errors.boxheight}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label fs-7'>
                          Box Quantity
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
                          placeholder='Box Qty...'
                          id='boxqty'
                          name='boxqty'
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxqty || ''}
                          invalid={validation.touched.boxqty && validation.errors.boxqty ? true : false}
                        />
                        {validation.touched.boxqty && validation.errors.boxqty ? <FormFeedback type='invalid'>{validation.errors.boxqty}</FormFeedback> : null}
                      </FormGroup>
                    </Col>

                    <h5 className='fs-7 mb-3 text-muted fw-light'>*You must complete all required fields.</h5>
                    <Col md={12}>
                      <div className='text-end'>
                        <Button type='submit' className='btn btn-primary'>
                          Add New Product
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Container>
        </div>
        {uploadLogoImage.isOpen ? <UploadFileModal {...uploadLogoImage} /> : null}
      </React.Fragment>
    </div>
  )
}

export default AddProducts
