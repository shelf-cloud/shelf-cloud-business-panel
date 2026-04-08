/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import router from 'next/router'
import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { wholesaleProductRow } from '@typings'
import axios from 'axios'
import { useFormik } from 'formik'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { Button, Card, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

import { FormatBytes } from '@/lib/FormatNumbers'
import { NoImageAdress } from '@/lib/assetsConstants'

import { SelectSingleValueType } from './Common/SimpleSelect'
import { FileWithPreview, HandleSubmitParams } from './modals/shared/UploadFileModal'
import { LABELS_SHIPMENT_TYPES } from './orders/wholesale/constants'
import UploadFileDropzone from './ui/UploadFileDropzone'
import SelectSingleFilter from './ui/filters/SelectSingleFilter'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}

const WholeSaleOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { data: session } = useSession()
  const { state, setWholeSaleOrderModal } = useContext(AppContext)

  const [orderLabel, setOrderLabel] = useState({
    files: [] as FileWithPreview[],
    acceptedFiles: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5000000,
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setOrderLabel((prev) => ({ ...prev, files: acceptedFiles as FileWithPreview[] }))
    },
    handleUploadFiles: async ({ region, businessId, selectedFiles, fileName }: HandleSubmitParams & { fileName: string }) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading Order Labels...')

      const formData = new FormData()
      formData.append('assetType', 'labels')
      formData.append('fileName', fileName)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])

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
        return { error: false }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading order labels',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      }
    },
    handleDeleteFile: (fileIndex: number) => {
      setOrderLabel((prev) => ({
        ...prev,
        files: prev.files.filter((_, index) => index !== fileIndex),
      }))
    },
    handleClearFiles: () => {
      setOrderLabel((prev) => ({ ...prev, files: [] }))
    },
  })

  const [orderPalletLabel, setOrderPalletLabel] = useState({
    files: [] as FileWithPreview[],
    acceptedFiles: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5000000,
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setOrderPalletLabel((prev) => ({ ...prev, files: acceptedFiles as FileWithPreview[] }))
    },
    handleUploadFiles: async ({ region, businessId, selectedFiles, fileName }: HandleSubmitParams & { fileName: string }) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading Pallet Labels...')

      const formData = new FormData()
      formData.append('assetType', 'labels')
      formData.append('fileName', fileName)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])

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
        return { error: false }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading pallet labels',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      }
    },
    handleDeleteFile: (fileIndex: number) => {
      setOrderPalletLabel((prev) => ({
        ...prev,
        files: prev.files.filter((_, index) => index !== fileIndex),
      }))
    },
    handleClearFiles: () => {
      setOrderPalletLabel((prev) => ({ ...prev, files: [] }))
    },
  })

  const [errorFile, setErrorFile] = useState(false)
  const [errorPalletFile, setErrorPalletFile] = useState(false)
  const [loading, setloading] = useState(false)

  const TotalMasterBoxes = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.orderQty), 0)

  const totalQuantityToShip = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)
  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      type: 'Parcel Boxes',
      numberOfPallets: 1,
      isThird: '',
      thirdInfo: '',
      hasProducts: orderProducts.length,
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
      type: Yup.string().oneOf(['LTL', 'Parcel Boxes'], 'Please Choose a Type').required('Please Choose a Type'),
      numberOfPallets: Yup.number().when('type', {
        is: 'LTL',
        then: Yup.number().min(1, 'Must be greater than or equal to 1').required('Must enter Third Party Information'),
      }),
      isThird: Yup.string().required('Select a Shipment Payment Type'),
      thirdInfo: Yup.string().when('isThird', {
        is: 'true',
        then: Yup.string().required('Must enter Third Party Information'),
      }),
      hasProducts: Yup.number().min(1, 'To create an order, you must add at least one product'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)

      const loadingToast = toast.loading('Creating Order...')

      if (values.isThird == 'false' && orderLabel.files.length == 0) {
        setErrorFile(true)
        setloading(false)
        toast.update(loadingToast, {
          render: 'Error creating Wholesale Order. Please upload the FBA Labels.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }
      setErrorFile(false)

      if (values.type == 'LTL' && orderPalletLabel.files.length == 0) {
        setErrorPalletFile(true)
        setloading(false)
        toast.update(loadingToast, {
          render: 'Error creating Wholesale Order. Please upload the Pallet Labels.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }
      setErrorPalletFile(false)

      const docTime = moment().format('DD-MM-YYYY-HH-mm-ss-a')
      const order_label_name_file = `order-labels-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`
      const order_pallet_label_name_file = `order-pallet-labels-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`

      if (values.isThird == 'false') {
        const uploadResult = await orderLabel.handleUploadFiles({
          region: state.currentRegion,
          businessId: state.user.businessId,
          selectedFiles: orderLabel.files,
          fileName: order_label_name_file,
        })
        if (uploadResult.error) {
          setErrorFile(true)
          setloading(false)
          return
        }

        if (values.type == 'LTL') {
          const uploadPalletResult = await orderPalletLabel.handleUploadFiles({
            region: state.currentRegion,
            businessId: state.user.businessId,
            selectedFiles: orderPalletLabel.files,
            fileName: order_pallet_label_name_file,
          })
          if (uploadPalletResult.error) {
            setErrorPalletFile(true)
            setloading(false)
            return
          }
        }
      }

      const { data } = await axios.post(`/api/orders/createWholesaleOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            qty: product.totalToShip,
            storeId: product.quantity.businessId,
            qtyPicked: 0,
            pickedHistory: [],
          }
        }),
        groovePackerProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            qty: product.totalToShip,
            storeId: product.quantity.businessId,
            qtyScanned: 0,
            history: [
              {
                sku: product.sku,
                status: 'Awaiting',
                user: state.user.name,
                date: moment().format('YYYY-MM-DD h:mm:ss'),
              },
            ],
          }
        }),
        orderInfo: {
          orderNumber: values.orderNumber,
          carrierService: values.type,
          isPallets: values.type == 'LTL' ? true : false,
          numberOfPallets: values.type == 'LTL' ? values.numberOfPallets : 0,
          isthird: values.isThird == 'true' ? true : false,
          thirdInfo: values.isThird == 'true' ? values.thirdInfo : '',
          labelsName: values.isThird == 'false' ? order_label_name_file : '',
          palletLabels: values.isThird == 'false' && values.type == 'LTL' ? order_pallet_label_name_file : '',
          orderProducts: orderProducts.map((product) => {
            return {
              sku: product.sku,
              inventoryId: product.quantity.inventoryId,
              name: product.title,
              boxQty: product.qtyBox,
              quantity: product.totalToShip,
              businessId: product.quantity.businessId,
              isKit: product.isKit,
              children: product.children?.map((child) => {
                return {
                  inventoryId: child.idInventory,
                  sku: child.sku,
                  name: child.title,
                  title: child.title,
                  qtyUsed: child.qty,
                  quantity: child.qty * product.totalToShip!,
                  businessId: product.quantity.businessId,
                }
              }),
            }
          }),
        },
      })

      if (!data.error) {
        setWholeSaleOrderModal(false)
        toast.update(loadingToast, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        resetForm()
        router.push('/Shipments')
      } else {
        toast.update(loadingToast, {
          render: data.message ?? 'Error creating Wholesale Order',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setloading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='xl'
      id='myModal'
      isOpen={state.showWholeSaleOrderModal}
      toggle={() => {
        setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
      }}>
      <ModalHeader
        toggle={() => {
          setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
        }}
        className='modal-title'
        id='myModalLabel'>
        WholeSale Order with Master Boxes
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <p className='fs-4 fw-bold text-primary'>Order Details</p>
            <Col md={6}>
              <Col md={12}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='orderNumber' className='form-label fs-7'>
                    *Order Number
                  </Label>
                  <div className='input-group'>
                    <span className='input-group-text fw-semibold fs-5' style={{ padding: '0.2rem 0.9rem' }} id='bsnss-prefix'>
                      {orderNumberStart}
                    </span>
                    <Input
                      type='text'
                      bsSize='sm'
                      className='form-control fs-6'
                      style={{ padding: '0.2rem 0.9rem' }}
                      id='orderNumber'
                      name='orderNumber'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.orderNumber || ''}
                      invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                    />
                    {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                  </div>
                </FormGroup>
              </Col>
              <Col md={12}>
                <Label htmlFor='type' className='form-label fs-7'>
                  *Type of Shipment
                </Label>
                <div className='d-flex flex-row justify-content-start align-items-center pb-3 gap-3'>
                  <Button
                    type='button'
                    className={validation.values.type == 'Parcel Boxes' ? '' : 'text-muted'}
                    color={validation.values.type == 'Parcel Boxes' ? 'primary' : 'light'}
                    onClick={() => validation.setFieldValue('type', 'Parcel Boxes')}>
                    Parcel Boxes
                  </Button>
                  <Button
                    type='button'
                    className={validation.values.type == 'LTL' ? '' : 'text-muted'}
                    color={validation.values.type == 'LTL' ? 'primary' : 'light'}
                    onClick={() => validation.setFieldValue('type', 'LTL')}>
                    Pallets
                  </Button>
                </div>
              </Col>
              {validation.values.type == 'LTL' && (
                <Col md={6}>
                  <FormGroup className='mb-3'>
                    <Label htmlFor='numberOfPallets' className='form-label fs-7'>
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type='number'
                      className='form-control form-control-sm fs-6'
                      id='numberOfPallets'
                      name='numberOfPallets'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.numberOfPallets || ''}
                      invalid={validation.touched.numberOfPallets && validation.errors.numberOfPallets ? true : false}
                    />
                    {validation.touched.numberOfPallets && validation.errors.numberOfPallets ? (
                      <FormFeedback type='invalid'>{validation.errors.numberOfPallets}</FormFeedback>
                    ) : null}
                  </FormGroup>
                </Col>
              )}
              <Col md={6}>
                <SelectSingleFilter
                  inputLabel={'*Select Shipment Type'}
                  inputName={'isThird'}
                  placeholder={'Select ...'}
                  selected={{ value: validation.values.isThird, label: LABELS_SHIPMENT_TYPES.find((type) => type.value === validation.values.isThird)?.label || 'Select...' }}
                  options={LABELS_SHIPMENT_TYPES || [{ value: '', label: '' }]}
                  handleSelect={(option: SelectSingleValueType) => {
                    validation.handleChange({ target: { name: 'isThird', value: option!.value } })
                  }}
                  error={validation.errors.isThird}
                />
              </Col>
            </Col>
            <Col md={6}>
              <Row>
                <Col>
                  <UploadFileDropzone
                    accptedFiles={orderLabel.acceptedFiles}
                    handleAcceptedFiles={orderLabel.handleAcceptedFiles}
                    description={`Upload Shipping Labels. Drop Only PDF files here or click to upload.`}
                  />
                  <div className='list-unstyled mb-0' id='file-previews'>
                    {orderLabel.files.map((file, i) => {
                      return (
                        <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                          <div className='p-2'>
                            <Row className='align-items-center'>
                              <Col className='d-flex justify-content-between align-items-center gap-2'>
                                {file.type === 'application/pdf' ? (
                                  <div className='relative overflow-hidden rounded border' style={{ width: '60px', height: '60px' }}>
                                    <iframe
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      width='400px'
                                      height='220px'
                                      style={{
                                        border: 'none',
                                        zoom: 0.35,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      margin: '0px',
                                      position: 'relative',
                                    }}>
                                    <img
                                      loading='lazy'
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      alt='File preview'
                                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                                      onLoad={() => {
                                        URL.revokeObjectURL(file.preview)
                                      }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className='text-muted m-0 fs-7'>{file.name}</p>
                                  <p className='mb-0 fs-7'>
                                    <strong>{file.formattedSize}</strong>
                                  </p>
                                </div>
                                <div>
                                  <Button color='light' className='btn-icon' onClick={orderLabel.handleClearFiles}>
                                    <i className=' ri-close-line' />
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  {errorFile && <p className='text-danger m-0'>You must Upload the FBA Labels to create order.</p>}
                </Col>
                <Col>
                  {validation.values.type == 'LTL' && (
                    <UploadFileDropzone
                      accptedFiles={orderPalletLabel.acceptedFiles}
                      handleAcceptedFiles={orderPalletLabel.handleAcceptedFiles}
                      description={`Upload Pallet Labels. Drop Only PDF files here or click to upload.`}
                    />
                  )}
                  <div className='list-unstyled mb-0' id='file-previews'>
                    {orderPalletLabel.files.map((file: any, i) => {
                      return (
                        <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                          <div className='p-2'>
                            <Row className='align-items-center'>
                              <Col className='d-flex justify-content-between align-items-center gap-2'>
                                {file.type === 'application/pdf' ? (
                                  <div className='relative overflow-hidden rounded border' style={{ width: '60px', height: '60px' }}>
                                    <iframe
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      width='400px'
                                      height='220px'
                                      style={{
                                        border: 'none',
                                        zoom: 0.35,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      margin: '0px',
                                      position: 'relative',
                                    }}>
                                    <img
                                      loading='lazy'
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      alt='File preview'
                                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                                      onLoad={() => {
                                        URL.revokeObjectURL(file.preview)
                                      }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className='text-muted font-weight-bold m-0 fs-7'>{file.name}</p>
                                  <p className='mb-0 fs-7'>
                                    <strong>{file.formattedSize}</strong>
                                  </p>
                                </div>
                                <div>
                                  <Button color='light' className='btn-icon' onClick={orderPalletLabel.handleClearFiles}>
                                    <i className=' ri-close-line' />
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  {errorPalletFile && <p className='text-danger m-0'>You must Upload the Pallet Labels to create order.</p>}
                </Col>
              </Row>
            </Col>
            <Col md={12}>
              {validation.values.isThird == 'true' && (
                <>
                  <Input
                    type='textarea'
                    id='thirdInfo'
                    name='thirdInfo'
                    placeholder='Please enter the Third Party Shipping Information: Recepient, Company, Address, City, State, Zipcode, Country.'
                    value={validation.values.thirdInfo}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.thirdInfo && validation.errors.thirdInfo ? true : false}
                  />
                  {validation.touched.thirdInfo && validation.errors.thirdInfo ? <FormFeedback type='invalid'>{validation.errors.thirdInfo}</FormFeedback> : null}
                  <h5 className='fs-7 mb-3 text-muted'>*Additional shipping costs apply to this type of shipping.</h5>
                </>
              )}
            </Col>
            <Col md={12}>
              <p className='fs-6 m-0'>Total SKUs in Order: {validation.values.hasProducts}</p>
              {validation.touched.hasProducts && validation.errors.hasProducts ? <p className='text-danger'>{validation.errors.hasProducts}</p> : null}
              <table className='table align-middle table-responsive table-nowrap table-striped-columns table-sm'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Type</th>
                    <th className='text-center'>Master Boxes</th>
                    <th className='text-center'>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className='text-center'>{product.isKit ? 'Kit' : 'Product'}</td>
                      <td className='text-center'>{product.orderQty}</td>
                      <td className='text-center'>{product.totalToShip}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td></td>
                    <td className='fw-bold text-center'>TOTAL</td>
                    <td className='fw-bold text-center'>{TotalMasterBoxes}</td>
                    <td className='fw-bold text-center'>{totalQuantityToShip}</td>
                  </tr>
                </tfoot>
              </table>
            </Col>
            <Col md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn'>
                  {loading ? <Spinner color='#fff' /> : 'Confirm Order'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default WholeSaleOrderModal
