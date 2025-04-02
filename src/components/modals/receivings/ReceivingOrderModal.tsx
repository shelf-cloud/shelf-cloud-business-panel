/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useEffect, useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
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
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true)

      const creatingUploadedReceiving = toast.loading('Creating Receiving...')

      const response = await axios.post(`api/createReceivingOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            qty: Number(product.orderQty),
            storeId: product.quantity.businessId,
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
      })

      if (!response.data.error) {
        toast.update(creatingUploadedReceiving, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        resetForm()
        setWholeSaleOrderModal(false)
        router.push('/receivings')
      } else {
        toast.update(creatingUploadedReceiving, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setLoading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='createReceivingOrderFromTable'
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
        Create Receiving From Table
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <h5 className='fs-5 fw-bolder'>Order Details</h5>
            <p className='m-0 mb-2 fs-7'>{`Add "Quantity to Receive" in the table for each SKU to create a receiving order.`}</p>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='orderNumber' className='fs-7 form-label text-muted'>
                  *Transaction Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text fw-semibold fs-6' id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    type='text'
                    className='form-control fs-6'
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
              <table className='table table-sm align-middle table-responsive table-nowrap table-striped-columns'>
                <thead className='table-light'>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Total to Received</th>
                  </tr>
                </thead>
                <tbody className='fs-7'>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className='text-center'>{product.orderQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Col>
            <Col md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn fs-7'>
                  {loading ? (
                    <span>
                      <Spinner color='#fff' size={'sm'} /> Creating...
                    </span>
                  ) : (
                    'Create Receiving'
                  )}
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
