/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import {
  Button,
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
  Spinner,
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { wholesaleProductRow } from '@typings'
import router from 'next/router'
import moment from 'moment'
// import Dropzone from 'react-dropzone'
// import { ref, uploadBytes } from 'firebase/storage'
// import { storage } from '@firebase'
// import { useSession } from 'next-auth/react'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const SingleBoxesOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  // const { data: session } = useSession()
  const { state, setSingleBoxesOrderModal }: any = useContext(AppContext)
  // const [selectedFiles, setselectedFiles] = useState([])
  // const [palletSelectedFiles, setPalletSelectedFiles] = useState([])
  // const [errorFile, setErrorFile] = useState(false)
  // const [errorPalletFile, setErrorPalletFile] = useState(false)
  const [loading, setloading] = useState(false)

  const TotalMasterBoxes = orderProducts.reduce(
    (total: number, item: wholesaleProductRow) => total + Number(item.orderQty),
    0
  )

  const totalQuantityToShip = orderProducts.reduce(
    (total: number, item: wholesaleProductRow) => total + Number(item.totalToShip),
    0
  )

  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber:
        state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
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
      setloading(true)

      const response = await axios.post(
        `api/createWholesaleOrderIndividualUnits?region=${state.currentRegion}&businessId=${state.user.businessId}`,
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
            thirdInfo: values.isThird == 'true' ? values.thirdInfo : '',
            labelsName: '',
            palletLabels: '',
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
        setSingleBoxesOrderModal(false)
        toast.success(response.data.msg)
        resetForm()
        router.push('/Shipments')
      } else {
        toast.error(response.data.msg)
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
      isOpen={state.showSingleBoxesOrderModal}
      toggle={() => {
        setSingleBoxesOrderModal(!state.showSingleBoxesOrderModal)
      }}>
      <ModalHeader
        toggle={() => {
          setSingleBoxesOrderModal(!state.showSingleBoxesOrderModal)
        }}
        className='modal-title'
        id='myModalLabel'>
        WholeSale Order with Individual Units
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
              {/* <Row>
                <Col>
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
                <Col>
                  {validation.values.type == 'LTL' && (
                    <Dropzone
                      multiple={false}
                      onDrop={(acceptedFiles) => {
                        handlePalletAcceptedFiles(acceptedFiles)
                      }}>
                      {({ getRootProps }) => (
                        <div className='dropzone dz-clickable cursor-pointer'>
                          <div className='dz-message needsclick' {...getRootProps()}>
                            <div className='mb-3'>
                              <i className='display-4 text-muted ri-upload-cloud-2-fill' />
                            </div>
                            <h4>Upload Pallet Labels. Drop Only PDF files here or click to upload.</h4>
                          </div>
                        </div>
                      )}
                    </Dropzone>
                  )}
                  <div className='list-unstyled mb-0' id='file-previews'>
                    {palletSelectedFiles.map((f: any, i) => {
                      return (
                        <Card
                          className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete'
                          key={i + '-file'}>
                          <div className='p-2'>
                            <Row className='align-items-center'>
                              <Col className='d-flex justify-content-between align-items-center'>
                                <div>
                                  <p className='text-muted font-weight-bold m-0'>{f.name}</p>
                                  <p className='mb-0'>
                                    <strong>{f.formattedSize}</strong>
                                  </p>
                                </div>
                                <div>
                                  <Button color='light' className='btn-icon' onClick={() => setPalletSelectedFiles([])}>
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
                  {errorPalletFile && (
                    <p className='text-danger m-0'>You must Upload the Pallet Labels to create order.</p>
                  )}
                </Col>
              </Row> */}
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
              <h5>Total SKUs in Order: {validation.values.hasProducts}</h5>
              <span className='text-info fs-6 fw-light'>The distribution plan for boxes and items will be available after picking.</span>
              {validation.touched.hasProducts && validation.errors.hasProducts ? (
                <p className='text-light'>{validation.errors.hasProducts}</p>
              ) : null}
              <table className='table align-middle table-responsive table-nowrap table-striped-columns'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Individual Units</th>
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
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td className='fw-bold'>TOTAL</td>
                    <td className='fw-bold text-center'>{TotalMasterBoxes}</td>
                    <td className='fw-bold text-center'>{totalQuantityToShip}</td>
                  </tr>
                </tbody>
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

export default SingleBoxesOrderModal
