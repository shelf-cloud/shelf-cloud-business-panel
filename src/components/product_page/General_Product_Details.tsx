/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import UploadFileModal, { HandleSubmitParams } from '@components/modals/shared/UploadFileModal'
import AppContext from '@context/AppContext'
import { FormatBytes } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

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
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
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
    },
    validationSchema: Yup.object({
      title: Yup.string().max(100, 'Title is to Long').required('Please enter product title'),
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
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleShowEditFields = () => {
    validation.setValues({
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
    <div className='tw:px-4 tw:pt-2 tw:pb-4 tw:border-b tw:border-[color:var(--border)]'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold'>General</p>
      {!showEditFields ? (
        <div className='tw:w-full tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-4 tw:lg:flex-row'>
          <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-2'>
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
            <Button className='tw:flex tw:items-center tw:gap-2' color='primary' size='sm' onClick={() => setuploadLogoImage((prev) => ({ ...prev, isOpen: true }))}>
              <i className='mdi mdi-cloud-upload tw:text-[16.25px] tw:m-0 tw:p-0' />
              Image
            </Button>
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
                <tr>
                  <td className='tw:font-extrabold'>Tracking</td>
                  <td className={itemCondition ?? 'tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic'}>
                    <p className='tw:m-0 tw:p-0'>
                      <span className='tw:font-semibold'>FIFO:</span> {useEntryDate ? 'Yes' : 'No'}
                    </p>
                    <p className='tw:m-0 tw:p-0'>
                      <span className='tw:font-semibold'>Expires:</span> {useExpireDate ? `${expirationTime} Days` : 'No'}
                    </p>
                  </td>
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
          <div>
            <button type='button' aria-label='Edit product details' onClick={handleShowEditFields} className='tw:p-0 tw:border-0 tw:bg-transparent'>
              <i className='ri-pencil-fill tw:text-[16.25px] tw:m-0 tw:p-0 tw:text-primary' />
            </button>
          </div>
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
              <Label htmlFor='supplier'>
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
              <Label htmlFor='category'>
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
              <Label htmlFor='itemCondition'>
                *Condition
              </Label>
              <Select_Condition_Product_Details
                selected={validation.values.itemCondition ?? ''}
                handleSelection={handleConditionSelection}
                errorMessage={validation.errors.itemCondition}
              />
            </Col>
            <Col md={12} className='tw:px-3'>
              <FormGroup className='tw:!mb-1' check inline>
                <Label htmlFor='useEntryDate' check>
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
            <div className='tw:w-full tw:px-3 tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-3'>
              <FormGroup check inline>
                <Label htmlFor='useExpireDate' check>
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
                <FormGroup className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-3'>
                  <Label htmlFor='expirationTime' className='tw:text-nowrap' check>
                    *Expiration Time (Days)
                  </Label>
                  <Input
                    type='number'
                    className='tw:text-[13px]'
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
                <Button disabled={isLoading} type='button' color='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit' color='primary'>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
      {uploadLogoImage.isOpen ? <UploadFileModal {...uploadLogoImage} /> : null}
    </div>
  )
}

export default General_Product_Details
