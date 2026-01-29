/* eslint-disable react-hooks/exhaustive-deps */
import router from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import { LABELS_SHIPMENT_TYPES } from '@components/orders/wholesale/constants'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { wholesaleProductRow } from '@typings'
import axios from 'axios'
import { useFormik } from 'formik'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const SingleBoxesOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { state, setSingleBoxesOrderModal } = useContext(AppContext)

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

      const loadingToast = toast.loading('Creating Order...')

      const { data } = await axios.post(`/api/orders/createWholesaleOrderIndividualUnits?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
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
        setSingleBoxesOrderModal(false)
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
          render: data.message ?? 'Error creating Purchase Order',
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
            <p className='fs-4 fw-bold text-primary'>Order Details</p>
            <Col md={6}>
              <Col md={12}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='firstNameinput' className='form-label fs-7'>
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
                <Label htmlFor='firstNameinput' className='form-label fs-7'>
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
                    <Label htmlFor='firstNameinput' className='form-label fs-7'>
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type='number'
                      className='form-control fs-6'
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
                  <h5 className='fs-12 mb-3 text-muted'>*Additional shipping costs apply to this type of shipping.</h5>
                </>
              )}
            </Col>
            <Col md={12}>
              <span className='text-info fs-6 fw-light'>*The distribution plan for boxes and items will be available after picking.</span>
              <p className='fs-6 m-0'>Total SKUs in Order: {validation.values.hasProducts}</p>
              {validation.touched.hasProducts && validation.errors.hasProducts ? <p className='text-light'>{validation.errors.hasProducts}</p> : null}
              <table className='table align-middle table-responsive table-nowrap table-striped-columns table-sm'>
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
                </tbody>
                <tfoot>
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td className='fw-bold'>TOTAL</td>
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

export default SingleBoxesOrderModal
