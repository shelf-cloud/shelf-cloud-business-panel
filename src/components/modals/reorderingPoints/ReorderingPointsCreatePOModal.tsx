/* eslint-disable @next/next/no-img-element */
import SelectDropDown from '@components/ui/SelectDropDown'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { useContext, useState } from 'react'
import {
  Button,
  Col,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledButtonDropdown,
} from 'reactstrap'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import PrintReorderingPointsOrder from '@components/reorderingPoints/PrintReorderingPointsOrder'
import DownloadExcelReorderingPointsOrder from '@components/reorderingPoints/DownloadExcelReorderingPointsOrder'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import router from 'next/router'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  selectedSupplier: string
  showPOModal: boolean
  setshowPOModal: (showPOModal: boolean) => void
  username: string
}

const DESTINATION_OPTIONS = ['ShelfCloud Warehouse', 'Direct to Marketplace']

function ReorderingPointsCreatePOModal({ reorderingPointsOrder, selectedSupplier, showPOModal, setshowPOModal, username }: Props) {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [orderComment, setorderComment] = useState('')
  const [printColumns, setprintColumns] = useState({
    comments: true,
    qtyPerBox: true,
    volume: true,
    cost: true,
  })
  const orderNumberStart = `${username.substring(0, 3).toUpperCase()}-`

  const initialValues = {
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    destinationSC: '',
  }

  const validationSchema = Yup.object({
    destinationSC: Yup.string().required('You must select a destination'),
    orderNumber: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Order Number is to Long')
      .required('Required Order Number'),
  })

  const handleSubmit = async (values: any) => {
    setLoading(true)

    const poItems = []
    for await (const product of Object.values(reorderingPointsOrder.products)) {
      poItems.push({
        sku: product.sku,
        orderQty: product.useOrderAdjusted ? product.orderAdjusted : product.order,
        inboundQty: 0,
        sellerCost: product.sellerCost,
        inventoryId: product.inventoryId,
        receivedQty: 0,
        arrivalHistory: [],
      })
    }

    const response = await axios.post(`/api/reorderingPoints/createNewPurchaseOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderNumber: values.orderNumber,
      destinationSC: values.destinationSC === 'ShelfCloud Warehouse' ? 1 : 0,
      poItems: poItems,
      selectedSupplier: selectedSupplier,
    })
    if (!response.data.error) {
      setshowPOModal(false)
      toast.success(response.data.message)
      mutate('/api/getuser')
      router.push('/purchaseOrders?status=pending&organizeBy=suppliers')
    } else {
      toast.error(response.data.message ?? 'Error creating Purchase Order')
    }

    setLoading(false)
  }

  const handleAddComment = (comment: string, sku: string) => {
    if (comment === '') reorderingPointsOrder.products[sku].comment = ''
    else reorderingPointsOrder.products[sku].comment = comment
  }

  return (
    <Modal fade={false} size='xl' id='unitsSoldDetailsModal' isOpen={showPOModal} toggle={() => setshowPOModal(false)}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <ModalHeader toggle={() => setshowPOModal(false)}>
              <p className='m-0 p-0 mb-1 fw-bold fs-5'>Purchase Order</p>
              <p className='m-0 p-0 fw-normal fs-6'>Supplier: {selectedSupplier}</p>
            </ModalHeader>
            <ModalBody>
              <Row className='mb-3'>
                <Col xs={12} md={5}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label mb-0 fs-7'>
                      *Purchase Order Number
                    </Label>
                    <div className='input-group'>
                      <span className='input-group-text fw-semibold fs-6' style={{ padding: '0.2rem 0.9rem' }} id='basic-addon1'>
                        {orderNumberStart}
                      </span>
                      <Input
                        type='text'
                        className='form-control fs-6'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Order Number...'
                        aria-describedby='basic-addon1'
                        id='orderNumber'
                        name='orderNumber'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.orderNumber || ''}
                        invalid={touched.orderNumber && errors.orderNumber ? true : false}
                      />
                      {touched.orderNumber && errors.orderNumber ? <FormFeedback type='invalid'>{errors.orderNumber}</FormFeedback> : null}
                    </div>
                  </FormGroup>
                </Col>
                <Col xs={12} md={5}>
                  <Label className='form-label mb-0 fs-7'>*Select Destination</Label>
                  <SelectDropDown
                    formValue={'destinationSC'}
                    selectionInfo={DESTINATION_OPTIONS}
                    selected={values.destinationSC}
                    handleSelection={setFieldValue}
                    error={errors.destinationSC && touched.destinationSC ? true : false}
                  />
                  {errors.destinationSC && touched.destinationSC ? <div className='m-0 p-0 text-danger fs-7'>*{errors.destinationSC}</div> : null}
                </Col>
              </Row>
              <span className='fs-7 text-muted'>*Select the columns you wish to print.</span>
              <div className='d-flex flex-row justify-content-evenly align-items-start'>
                <table className='table table-bordered table-hover table-striped table-sm mb-0'>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>
                        Product Comment{' '}
                        <Input
                          type='checkbox'
                          className='fs-7'
                          checked={printColumns.comments}
                          onChange={() =>
                            setprintColumns((prev) => {
                              return { ...prev, comments: !printColumns.comments }
                            })
                          }
                        />
                      </th>
                      <th className='text-center'>
                        Qty Per Box{' '}
                        <Input
                          type='checkbox'
                          className='fs-7'
                          checked={printColumns.qtyPerBox}
                          onChange={() =>
                            setprintColumns((prev) => {
                              return { ...prev, qtyPerBox: !printColumns.qtyPerBox }
                            })
                          }
                        />
                      </th>
                      <th className='text-center'>
                        Order Qty
                      </th>
                      <th className='text-center'>
                        Volume{' '}
                        <Input
                          type='checkbox'
                          className='fs-7'
                          checked={printColumns.volume}
                          onChange={() =>
                            setprintColumns((prev) => {
                              return { ...prev, volume: !printColumns.volume }
                            })
                          }
                        />
                      </th>
                      <th className='text-center'>
                        Cost{' '}
                        <Input
                          type='checkbox'
                          className='fs-7'
                          checked={printColumns.cost}
                          onChange={() =>
                            setprintColumns((prev) => {
                              return { ...prev, cost: !printColumns.cost }
                            })
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(reorderingPointsOrder.products).map((product) => {
                      const productVolume = product.useOrderAdjusted ? product.orderAdjusted * product.itemVolume : product.order * product.itemVolume

                      return (
                        <tr key={product.sku}>
                          <td className='text-nowrap'>{product.sku}</td>
                          <td>
                            <div
                              style={{
                                width: '40px',
                                minWidth: '30px',
                                height: '40px',
                                margin: '0px',
                                position: 'relative',
                              }}>
                              <img
                                loading='lazy'
                                src={
                                  product.image
                                    ? product.image
                                    : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                                }
                                onError={(e) =>
                                  (e.currentTarget.src =
                                    'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                                }
                                alt='product Image'
                                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              />
                            </div>
                          </td>
                          <td className='w-25 fs-7'>{product.title}<br/><span className='fs-7 text-muted'>{`UPC: ${product.barcode}`}</span></td>
                          <td>
                            <DebounceInput
                              element='textarea'
                              minLength={5}
                              debounceTimeout={800}
                              className='form-control fs-7'
                              rows={1}
                              placeholder='Add comment...'
                              id='search-options'
                              // value={searchValue}
                              onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                              onChange={(e) => handleAddComment(e.target.value, product.sku)}
                            />
                          </td>
                          <td className='text-center align-middle'>{product.boxQty}</td>
                          <td className='text-center align-middle'>{FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                          <td className='text-center align-middle'>
                            {`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? productVolume / 1728 : productVolume / 1000000)} ${
                              state.currentRegion === 'us' ? 'ft³' : 'm³'
                            }`}
                          </td>

                          <td className='text-center align-middle'>
                            {FormatCurrency(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className='fw-semibold'>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='text-end'>TOTAL</td>
                      <td className='text-center'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                      <td className='text-center'>{`${FormatIntPercentage(
                        state.currentRegion,
                        state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 1728 : reorderingPointsOrder.totalVolume / 1000000
                      )} ${state.currentRegion === 'us' ? 'ft³' : 'm³'}`}</td>
                      <td className='text-center'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <Row className='my-1'>
                <Col xs={12} md={6}>
                  <Label className='form-label mb-0 fs-7'>Order Comment</Label>
                  <DebounceInput
                    element='textarea'
                    minLength={5}
                    debounceTimeout={800}
                    className='form-control fs-7'
                    rows={1}
                    placeholder='Add comment...'
                    id='order-comment'
                    // value={searchValue}
                    onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                    onChange={(e) => setorderComment(e.target.value)}
                  />
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter className='d-flex flex-row justify-content-between align-items-center'>
              <UncontrolledButtonDropdown>
                <DropdownToggle className='btn btn-primary fs-6 py-2' caret>
                  Actions
                </DropdownToggle>
                <DropdownMenu>
                  <PrintReorderingPointsOrder
                    reorderingPointsOrder={reorderingPointsOrder}
                    orderDetails={values}
                    selectedSupplier={selectedSupplier}
                    username={username}
                    orderComment={orderComment}
                    printColumns={printColumns}
                  />
                  <DownloadExcelReorderingPointsOrder
                    reorderingPointsOrder={reorderingPointsOrder}
                    orderDetails={values}
                    selectedSupplier={selectedSupplier}
                    username={username}
                    orderComment={orderComment}
                  />
                </DropdownMenu>
              </UncontrolledButtonDropdown>
              <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                <Button color='light' onClick={() => setshowPOModal(false)}>
                  Close
                </Button>
                <Button disabled={loading} type='submit' color='success'>
                  {loading ? <Spinner color='white' size={'sm'} /> : 'Create'}
                </Button>
              </div>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default ReorderingPointsCreatePOModal
