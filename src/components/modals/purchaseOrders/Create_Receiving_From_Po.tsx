/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import router from 'next/router'
import { FormatIntNumber } from '@lib/FormatNumbers'

type Props = {
  orderNumberStart: string
}

const Create_Receiving_From_Po = ({ orderNumberStart }: Props) => {
  const { state, setShowCreateReceivingFromPo }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)

  const validation = useFormik({
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
    onSubmit: async (values) => {
      setloading(true)
      let shippingProducts = [] as any
      Object.entries(state.receivingFromPo).forEach(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          shippingProducts.push({
            sku: item.sku,
            qty: Number(item.receivingQty),
            storeId: item.businessId,
            qtyPicked: 0,
            pickedHistory: [],
          })
        })
      )

      let orderProducts = [] as any
      Object.entries(state.receivingFromPo).map(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          orderProducts.push({
            poId: item.poId,
            sku: item.sku,
            inventoryId: item.inventoryId,
            name: item.title,
            boxQty: 0,
            quantity: Number(item.receivingQty),
            businessId: item.businessId,
            qtyReceived: 0,
          })
        })
      )
      const response = await axios.post(`/api/purchaseOrders/createReceivingFromPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts,
        orderInfo: {
          orderNumber: values.orderNumber,
          orderProducts,
        },
        poInfo: state.receivingFromPo,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        setShowCreateReceivingFromPo(false)
        router.push('/Receivings')
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
      id='addPaymentToPoModal'
      isOpen={state.showCreateReceivingFromPo}
      toggle={() => {
        setShowCreateReceivingFromPo(!state.showCreateReceivingFromPo)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreateReceivingFromPo(!state.showCreateReceivingFromPo)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create Receiving From Purchase Orders
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Transaction Number
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
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col md={12}>
              <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
                <thead>
                  <tr>
                    <th scope='col'>Order Number</th>
                    <th scope='col'>Supplier</th>
                    <th scope='col'>Title / SKU</th>
                    <th scope='col' className='text-center'>
                      Total to Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(state.receivingFromPo)
                    .sort(([_poIdA, inventoryIdA]: any, [_poIdB, inventoryIdB]: any) => {
                      const supplerA = Object.values<any>(inventoryIdA)[0].suppliersName
                      const supplerB = Object.values<any>(inventoryIdB)[0].suppliersName
                      if (supplerA < supplerB) {
                        return -1
                      }
                      if (supplerA > supplerB) {
                        return 1
                      }
                      return 0
                    })
                    .map(([poId, inventoryId]: any) =>
                      Object.entries(inventoryId).map(([inventoryId, item]: any) => (
                        <tr key={`${poId}-${inventoryId}`}>
                          <td>{item.orderNumber}</td>
                          <td className='fw-bold fs-5'>{item.suppliersName}</td>
                          <td className='text-center'>
                            <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                              <div
                                style={{
                                  width: '100%',
                                  maxWidth: '40px',
                                  height: '50px',
                                  margin: '0px',
                                  position: 'relative',
                                }}>
                                <img
                                  src={
                                    item.image
                                      ? item.image
                                      : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                                  }
                                  alt='product Image'
                                  style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                                />
                              </div>
                              <div className='text-start'>
                                <p className='text-nowrap m-0 fw-semibold'>{item.title}</p>
                                <p className='text-nowrap m-0'>{item.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className='text-center'>{item.receivingQty}</td>
                        </tr>
                      ))
                    )}
                  <tr>
                    <td></td>
                    <td></td>
                    <td className='fw-bold fs-5 text-end'>Total</td>
                    <td className='fw-bold fs-5 text-center'>
                      {FormatIntNumber(
                        state.currentRegion,
                        Object.entries(state.receivingFromPo).reduce((total: number, po: [string, any]) => {
                          const poTotal = Object.entries(po[1]).reduce((subtotal: number, inventoryId: [string, any]) => {
                            return subtotal + inventoryId[1].receivingQty
                          }, 0)
                          return total + poTotal
                        }, 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Row md={12}>
              <div className='text-end'>
                <Button disabled={loading || Object.keys(state.receivingFromPo).length <= 0} type='submit' color='success' className='btn'>
                  {loading ? <Spinner color='#fff' /> : 'Confirm Receiving'}
                </Button>
              </div>
            </Row>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Create_Receiving_From_Po
