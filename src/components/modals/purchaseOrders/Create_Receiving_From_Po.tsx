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
import useSWR from 'swr'
import { NoImageAdress } from '@lib/assetsConstants'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import { SelectOptionType } from '@components/Common/SimpleSelect'

type Props = {
  orderNumberStart: string
}
type OpenReceivings = {
  id: number
  businessId: number
  orderId: string
  orderNumber: string
  orderDate: string
}

const RECEIVING_TYPES: SelectOptionType[] = [
  { value: '', label: 'Choose a Type...' },
  { value: 'true', label: 'Create New Receiving' },
]
const EXIST_RECEIVING_TYPE: SelectOptionType[] = [{ value: 'false', label: 'Add to Existing Receiving' }]

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const Create_Receiving_From_Po = ({ orderNumberStart }: Props) => {
  const { state, setShowCreateReceivingFromPo } = useContext(AppContext)
  const [loading, setloading] = useState(false)

  const { data: openReceivings }: { data?: OpenReceivings[] } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getOpenReceivings?region=${state.currentRegion}&businessId=${state.user.businessId}&warehouseId=${state.receivingFromPo.warehouse.id}` : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
    }
  )

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      isNewReceiving: '',
      receivingIdToAdd: '',
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
      isNewReceiving: Yup.string().required('Select a Receiving Type'),
      receivingIdToAdd: Yup.string().when('isNewReceiving', {
        is: 'false',
        then: Yup.string().required('Must select a Receiving'),
      }),
    }),
    onSubmit: async (values) => {
      setloading(true)

      // SHIPPING PRODUCTS
      let shippingProducts = [] as any
      Object.entries(state.receivingFromPo.items).forEach(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          shippingProducts.push({
            poId: item.poId,
            hasSplitting: item.hasSplitting,
            splitId: item.splitId,
            sku: item.sku,
            inventoryId: item.inventoryId,
            qty: Number(item.receivingQty),
            storeId: item.businessId,
            qtyPicked: 0,
            pickedHistory: [],
          })
        })
      )

      // ORDER PRODUCTS
      let orderProducts = [] as any
      Object.entries(state.receivingFromPo.items).map(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          orderProducts.push({
            poId: item.poId,
            hasSplitting: item.hasSplitting,
            splitId: item.splitId,
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
        receivingItems: state.receivingFromPo.items,
        isNewReceiving: values.isNewReceiving == 'true' ? true : false,
        receivingIdToAdd: parseInt(values.receivingIdToAdd),
        warehouseId: state.receivingFromPo.warehouse.id,
      })

      if (!response.data.error) {
        toast.success(response.data.msg)
        setShowCreateReceivingFromPo(false)
        router.push('/receivings')
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
      size='lg'
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
        <Row>
          <p className='m-0 fs-5 fw-semibold'>
            Destination: <span className='text-primary'>{state.receivingFromPo.warehouse.name}</span>
          </p>
        </Row>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label htmlFor='firstNameinput' className='form-label fs-7'>
                  *Transaction Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text fw-semibold fs-5 m-0 px-2 py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    disabled={validation.values.isNewReceiving == 'false'}
                    type='text'
                    className='form-control fs-6'
                    id='orderNumber'
                    name='orderNumber'
                    bsSize='sm'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                  />
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <SelectSingleFilter
                inputLabel='*Select Receiving Type'
                inputName='isNewReceiving'
                placeholder='Choose a Type...'
                selected={[...RECEIVING_TYPES, ...EXIST_RECEIVING_TYPE].find((option) => option.value === validation.values.isNewReceiving) || { value: '', label: 'Choose a Type...' }}
                options={openReceivings && openReceivings.length > 0 ? [...RECEIVING_TYPES, ...EXIST_RECEIVING_TYPE] : RECEIVING_TYPES}
                handleSelect={(option: SelectOptionType) => {
                  validation.handleChange({ target: { name: 'isNewReceiving', value: option.value } })
                }}
                error={validation.errors.isNewReceiving}
              />
              {openReceivings && openReceivings.length <= 0 && <p className='text-muted fs-7'>{`No open receiving to ${state.receivingFromPo.warehouse.name}`}</p>}
              {validation.values.isNewReceiving == 'false' && (
                <SelectSingleFilter
                  inputLabel='*Select Existing Receiving'
                  inputName='receivingIdToAdd'
                  placeholder='Choose a Type...'
                  selected={{ value: validation.values.receivingIdToAdd, label: openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber || 'Choose a Receiving...' }}
                  options={openReceivings?.map((receiving) => ({ value: receiving.id, label: receiving.orderNumber })) || [{ value: '', label: '' }]}
                  handleSelect={(option: SelectOptionType) => {
                    validation.handleChange({ target: { name: 'receivingIdToAdd', value: option.value } })
                  }}
                  error={validation.errors.receivingIdToAdd}
                />
              )}
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
                <thead className='table-light'>
                  <tr>
                    <th scope='col'>PO Number</th>
                    <th scope='col'>Supplier</th>
                    <th scope='col'>Title / SKU</th>
                    <th scope='col' className='text-center'>
                      Total to Received
                    </th>
                  </tr>
                </thead>
                <tbody className='fs-7'>
                  {Object.entries(state.receivingFromPo.items)
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
                          <td className='fw-bold fs-6'>{item.suppliersName}</td>
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
                                <img loading='lazy' src={item.image ? item.image : NoImageAdress} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
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
                    <td className='fw-bold fs-6 text-end'>Total</td>
                    <td className='fw-bold fs-6 text-center'>
                      {FormatIntNumber(
                        state.currentRegion,
                        Object.entries(state.receivingFromPo.items).reduce((total: number, po: [string, any]) => {
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
          </Row>
          <Row md={12}>
            <div className='text-end'>
              <Button disabled={loading || Object.keys(state.receivingFromPo.items).length <= 0} type='submit' color='success' className='fs-7'>
                {loading ? (
                  <span>
                    <Spinner color='light' size={'sm'} /> Creating...
                  </span>
                ) : (
                  'Confirm Receiving'
                )}
              </Button>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Create_Receiving_From_Po
