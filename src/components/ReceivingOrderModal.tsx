/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useEffect, useContext } from 'react'
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
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { wholesaleProductRow } from '@typings'
import router from 'next/router'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}
const ReceivingOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
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
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(
        `api/createReceivingOrder?businessId=${state.user.businessId}`,
        {
          shippingProducts: orderProducts.map((product) => {
            return {
              sku: product.sku,
              qty: Number(product.orderQty),
              storeId: state.user.businessId,
              qtyPicked: 0,
              pickedHistory: [],
            }
          }),
          orderInfo: {
            orderNumber: values.orderNumber,
            orderProducts: orderProducts.map((product) => {
              return {
                sku: product.sku,
                name: product.title,
                boxQty: product.qtyBox,
                quantity: Number(product.orderQty),
                businessId: product.quantity.businessId,
                qtyReceived: 0,
              }
            }),
          },
        }
      )

      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        setWholeSaleOrderModal(false)
        router.push('/Receivings')
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
            <h5 className="fs-5 m-3 fw-bolder">Order Details</h5>
            <Col md={6}>
              <FormGroup className="mb-3">
                <Label htmlFor="firstNameinput" className="form-label">
                  *Transaction Number
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
            <Col md={12}>
              <table className="table align-middle table-responsive table-nowrap table-striped-columns">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className="text-center">Total to Received</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className="text-center">{product.orderQty}</td>
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

export default ReceivingOrderModal
