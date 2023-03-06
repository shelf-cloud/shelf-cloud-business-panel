/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { wholesaleProductRow } from '@typings'
import router from 'next/router'
import moment from 'moment'
import Dropzone from 'react-dropzone'
// import Image from 'next/image'
import { ref, uploadBytes } from 'firebase/storage'
import { storage } from '@firebase'
import { useSession } from 'next-auth/react'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const WholeSaleOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { data: session } = useSession()
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const [selectedFiles, setselectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)

  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber: state.currentRegion ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      type: 'Parcel Boxes',
      numberOfPallets: 1,
      isThird: '',
      thirdInfo: '',
      hasProducts: orderProducts.length,
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string().max(100, 'Title is to Long').required('Please enter Order Number'),
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
      if (values.isThird == 'false' && selectedFiles.length == 0) {
        setErrorFile(true)
        return
      }
      setErrorFile(false)
      const docTime = moment().format('DD-MM-YYYY-HH-mm-ss-a')

      if (values.isThird == 'false') {
        const storageRef = ref(storage, `shelf-cloud/etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`)
        await uploadBytes(storageRef, selectedFiles[0]).then((_snapshot) => {
          toast.success('Successfully uploaded labels!')
        })
      }

      const response = await axios.post(
        `api/createWholesaleOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`,
        {
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
            thirdInfo: values.thirdInfo == 'true' ? values.thirdInfo : '',
            labelsName: values.isThird == 'false' ? `etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf` : '',
            orderProducts: orderProducts.map((product) => {
              return {
                sku: product.sku,
                name: product.title,
                boxQty: product.qtyBox,
                quantity: product.totalToShip,
                businessId: product.quantity.businessId,
              }
            }),
          },
        }
      )

      if (!response.data.error) {
        setWholeSaleOrderModal(false)
        toast.success(response.data.msg)
        resetForm()
        router.push('/Shipments')
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  function handleAcceptedFiles(files: any) {
    files.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    )
    setselectedFiles(files)
  }

  function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  return (
    <Modal
      fade={false}
      size='lg'
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
        WholeSale Order
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <h5 className='fs-5 m-3 fw-bolder text-primary'>Order Details</h5>
            <Col md={6}>
              <Col md={12}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='firstNameinput' className='form-label'>
                    *Order Number
                  </Label>
                  <div className='input-group'>
                    <span className='input-group-text fw-semibold fs-5' id='basic-addon1'>
                      {orderNumberStart}
                    </span>
                    <Input
                      type='text'
                      className='form-control'
                      id='orderNumber'
                      name='orderNumber'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.orderNumber || ''}
                      invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                    />
                    {validation.touched.orderNumber && validation.errors.orderNumber ? (
                      <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback>
                    ) : null}
                  </div>
                </FormGroup>
              </Col>
              <Col md={12}>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Type of Shipment
                </Label>
                <div className='flex flex-row w-100 justify-content-start align-items-center pb-3'>
                  <Button
                    type='button'
                    className={'me-3 ' + (validation.values.type == 'Parcel Boxes' ? '' : 'text-muted')}
                    color={validation.values.type == 'Parcel Boxes' ? 'primary' : 'light'}
                    onClick={() => validation.setFieldValue('type', 'Parcel Boxes')}>
                    Parcel Boxes
                  </Button>
                  <Button
                    type='button'
                    className={'' + (validation.values.type == 'LTL' ? '' : 'text-muted')}
                    color={validation.values.type == 'LTL' ? 'primary' : 'light'}
                    onClick={() => validation.setFieldValue('type', 'LTL')}>
                    Pallets
                  </Button>
                </div>
              </Col>
              {validation.values.type == 'LTL' && (
                <Col md={12}>
                  <FormGroup className='mb-3'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type='number'
                      className='form-control'
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
              <Col md={12}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='firstNameinput' className='form-label'>
                    *Type of Shipment Payment
                  </Label>
                  <Input
                    type='select'
                    className='form-control'
                    id='isThird'
                    name='isThird'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.isThird && validation.errors.isThird ? true : false}>
                    <option value=''>Choose a Type..</option>
                    <option value='false'>Prepaid Shipping Label</option>
                    <option value='true'>Shelf-Cloud Preferred Carrier</option>
                  </Input>
                  {validation.touched.isThird && validation.errors.isThird ? (
                    <FormFeedback type='invalid'>{validation.errors.isThird}</FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
            </Col>
            <Col md={6}>
              <Dropzone
                multiple={false}
                onDrop={(acceptedFiles) => {
                  handleAcceptedFiles(acceptedFiles)
                }}>
                {({ getRootProps }) => (
                  <div className='dropzone dz-clickable cursor-pointer'>
                    <div className='dz-message needsclick' {...getRootProps()}>
                      <div className='mb-3'>
                        <i className='display-4 text-muted ri-upload-cloud-2-fill' />
                      </div>
                      <h4>Upload Shipping Labels. Drop Only PDF files here or click to upload.</h4>
                    </div>
                  </div>
                )}
              </Dropzone>
              <div className='list-unstyled mb-0' id='file-previews'>
                {selectedFiles.map((f: any, i) => {
                  return (
                    <Card
                      className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete'
                      key={i + '-file'}>
                      <div className='p-2'>
                        <Row className='align-items-center'>
                          {/* <Col className="col-auto">
                            <Image
                              data-dz-thumbnail=""
                              height={'40px'}
                              width={'40px'}
                              objectFit="cover"
                              objectPosition="center"
                              className="avatar-sm rounded bg-light"
                              alt={f.name}
                              src={'https://electrostoregroup.com/Onix/img/no-image.png'}
                            />
                          </Col> */}
                          <Col className='d-flex justify-content-between align-items-center'>
                            <div>
                              <p className='text-muted font-weight-bold m-0'>{f.name}</p>
                              <p className='mb-0'>
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </div>
                            <div>
                              <Button color='light' className='btn-icon' onClick={() => setselectedFiles([])}>
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
                  {validation.touched.thirdInfo && validation.errors.thirdInfo ? (
                    <FormFeedback type='invalid'>{validation.errors.thirdInfo}</FormFeedback>
                  ) : null}
                  <h5 className='fs-12 mb-3 text-muted'>*Additional shipping costs apply to this type of shipping.</h5>
                </>
              )}
            </Col>
            <Col md={12}>
              <h5>Total Products in Order: {validation.values.hasProducts}</h5>
              {validation.touched.hasProducts && validation.errors.hasProducts ? (
                <p className='text-danger'>{validation.errors.hasProducts}</p>
              ) : null}
              <table className='table align-middle table-responsive table-nowrap table-striped-columns'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Master Boxes</th>
                    <th className='text-center'>Total Qty To Ship</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className='text-center'>{product.orderQty}</td>
                      <td className='text-center'>{product.totalToShip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Col>
            <Col md={12}>
              <div className='text-end'>
                <Button type='submit' color='success' className='btn'>
                  Confirm Order
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
