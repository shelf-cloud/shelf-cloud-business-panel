/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
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
import { WholeSaleOrderProduct, wholesaleProductRow } from '@typings'
import router from 'next/router'
import moment from 'moment'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const WholeSaleOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)

  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber: `00${state?.user?.orderNumber}`,
      type: '',
      numberOfPallets: 1,
      isThird: false,
      thirdInfo: '',
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
      type: Yup.string()
        .oneOf(['LTL', 'Parcel Boxes'], 'Please Choose a Type')
        .required('Please Choose a Type'),
      isThird: Yup.boolean(),
      thirdInfo: Yup.string().when('isThird', {
        is: true,
        then: Yup.string().required('Must enter Third Party Information'),
      }),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(
        `api/createWholesaleOrder?businessId=${state.user.businessId}`,
        {
          shippingProducts: orderProducts.map((product) => {
            return {
              sku: product.sku,
              qty: product.totalToShip,
              storeId: state.user.businessId,
              qtyPicked: 0,
              pickedHistory: [],
            }
          }),
          groovePackerProducts: orderProducts.map((product) => {
            return {
              sku: product.sku,
              qty: product.totalToShip,
              storeId: state.user.businessId,
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
            isthird: values.isThird,
            thirdInfo: values.thirdInfo,
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
        toast.success(response.data.msg)
        resetForm()
        setWholeSaleOrderModal(false)
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

  return (
    <Modal
      fade={false}
      size="lg"
      id="myModal"
      isOpen={state.showWholeSaleOrderModal}
      toggle={() => {
        setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
      }}
    >
      <ModalHeader
        toggle={() => {
          setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
        }}
        className="modal-title"
        id="myModalLabel"
      >
        WholeSale Order
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <h5 className="fs-5 m-3 fw-bolder text-primary">Order Details</h5>
            <Col md={6}>
              <FormGroup className="mb-3">
                <Label htmlFor="firstNameinput" className="form-label">
                  *Order Number
                </Label>
                <div className="input-group">
                  <span
                    className="input-group-text fw-semibold fs-5"
                    id="basic-addon1"
                  >
                    {orderNumberStart}-
                  </span>
                  <Input
                    type="text"
                    className="form-control"
                    id="orderNumber"
                    name="orderNumber"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    invalid={
                      validation.touched.orderNumber &&
                      validation.errors.orderNumber
                        ? true
                        : false
                    }
                  />
                  {validation.touched.orderNumber &&
                  validation.errors.orderNumber ? (
                    <FormFeedback type="invalid">
                      {validation.errors.orderNumber}
                    </FormFeedback>
                  ) : null}
                </div>
              </FormGroup>
            </Col>
            <Row>
              <Col md={6}>
                <FormGroup className="mb-3">
                  <Label htmlFor="firstNameinput" className="form-label">
                    *Type of Shipment
                  </Label>
                  <Input
                    type="select"
                    className="form-control"
                    id="type"
                    name="type"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.type && validation.errors.type
                        ? true
                        : false
                    }
                  >
                    <option value="">Choose a Type..</option>
                    <option value="LTL">Pallets</option>
                    <option value="Parcel Boxes">Parcel Boxes</option>
                  </Input>
                  {validation.touched.type && validation.errors.type ? (
                    <FormFeedback type="invalid">
                      {validation.errors.type}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
              {validation.values.type == 'LTL' && (
                <Col md={4}>
                  <FormGroup className="mb-3">
                    <Label htmlFor="firstNameinput" className="form-label">
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type="number"
                      className="form-control"
                      id="numberOfPallets"
                      name="numberOfPallets"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.numberOfPallets || ''}
                      invalid={
                        validation.touched.numberOfPallets &&
                        validation.errors.numberOfPallets
                          ? true
                          : false
                      }
                    />
                    {validation.touched.numberOfPallets &&
                    validation.errors.numberOfPallets ? (
                      <FormFeedback type="invalid">
                        {validation.errors.numberOfPallets}
                      </FormFeedback>
                    ) : null}
                  </FormGroup>
                </Col>
              )}
            </Row>
            <Col md={12}>
              <FormGroup
                switch
                className="mb-3 flex flex-row justify-content-start align-items-center"
                style={{ padding: '0px 0px' }}
              >
                <Input
                  type="switch"
                  checked={validation.values.isThird}
                  className="form-control"
                  style={{ margin: '0px 1em 0px 0px' }}
                  id="isThird"
                  name="isThird"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                />
                <Label className="fs-5" check>
                  Creating Shipment for{' '}
                  {validation.values.isThird ? (
                    <span className="fw-bold text-primary">Third Party</span>
                  ) : (
                    <span className="fw-bold text-primary">FBA</span>
                  )}
                </Label>
              </FormGroup>
              {validation.values.isThird && (
                <>
                  <Input
                    type="textarea"
                    id="thirdInfo"
                    name="thirdInfo"
                    placeholder="Please enter the Third Party Shipping Information: Recepient, Company, Address, City, State, Zipcode, Country."
                    value={validation.values.thirdInfo}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.thirdInfo && validation.errors.thirdInfo
                        ? true
                        : false
                    }
                  />
                  {validation.touched.thirdInfo && validation.errors.thirdInfo ? (
                    <FormFeedback type="invalid">
                      {validation.errors.thirdInfo}
                    </FormFeedback>
                  ) : null}
                  <h5 className="fs-12 mb-3 text-muted">
                    *Additional shipping costs apply to this type of shipping.
                  </h5>
                </>
              )}
            </Col>
            <Col md={12}>
              <table className="table align-middle table-responsive table-nowrap table-striped-columns">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className="text-center">Master Boxes</th>
                    <th className="text-center">Total Qty To Ship</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className="text-center">{product.orderQty}</td>
                      <td className="text-center">{product.totalToShip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Col>
            <Col md={12}>
              <div className="text-end">
                <Button type="submit" color="success" className="btn">
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
