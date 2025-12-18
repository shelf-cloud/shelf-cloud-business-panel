/* eslint-disable @next/next/no-img-element */
import router from 'next/router'
import { useContext, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import { RECEIVING_SHIPMENT_TYPES } from '@components/constants/receivings'
import DownloadExcelReorderingPointsOrder from '@components/reorderingPoints/DownloadExcelReorderingPointsOrder'
import PrintReorderingPointsOrder from '@components/reorderingPoints/PrintReorderingPointsOrder'
import AppContext from '@context/AppContext'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { useFilterWarehousesByShipmentType } from '@hooks/warehouses/useFilterWarehousesByShipmentType'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import {
  Button,
  Col,
  DropdownMenu,
  DropdownToggle,
  Form,
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
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

export type Splits = {
  isSplitting: boolean
  splitsQty: number
}

type poItem = {
  sku: string
  name: string
  boxQty: number
  orderQty: number
  inboundQty: number
  sellerCost: number
  inventoryId: number
  receivedQty: number
  arrivalHistory: never[]
}

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
  splits: Splits
  splitNames: SplitNames
}
// const DESTINATION_OPTIONS = ['ShelfCloud Warehouse', 'Direct to Marketplace']

function ReorderingPointsCreatePOModal({ reorderingPointsOrder, selectedSupplier, showPOModal, setshowPOModal, username, splits, splitNames }: Props) {
  const { state } = useContext(AppContext)
  const { warehouses, isLoading } = useWarehouses()
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [orderComment, setorderComment] = useState('')
  const [savingComment, setsavingComment] = useState(false)
  const [printColumns, setprintColumns] = useState({
    comments: true,
    qtyPerBox: true,
    volume: true,
    cost: true,
  })

  const orderNumberStart = `${username.substring(0, 3).toUpperCase()}-`

  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      destinationSC: { value: '', label: 'Select ...' },
      shipmentType: { value: '', label: 'Select ...' },
      splitDestinations: splits.isSplitting ? Object.fromEntries(Array.from({ length: splits.splitsQty }, (_, index) => [index, { value: '', label: 'Select ...' }])) : {},
      splitShipmentTypes: splits.isSplitting ? Object.fromEntries(Array.from({ length: splits.splitsQty }, (_, index) => [index, { value: '', label: 'Select ...' }])) : {},
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
        .max(50, 'Order Number is to Long')
        .required('Required Order Number'),
      destinationSC: Yup.object().shape({
        value: Yup.number().when([], {
          is: () => !splits.isSplitting,
          then: Yup.number().required('Destination Required'),
        }),
      }),
      shipmentType: Yup.object().shape({
        value: Yup.string().when([], {
          is: () => !splits.isSplitting,
          then: Yup.string().required('Shipment Type Required'),
        }),
      }),
      splitDestinations: Yup.object().when([], {
        is: () => splits.isSplitting,
        then: Yup.object()
          .shape(
            Object.fromEntries(
              Array.from({ length: splits.splitsQty }, (_, index) => [
                index,
                Yup.object().shape({
                  value: Yup.number()
                    .min(0, `Required Split #${index + 1} Destination`)
                    .required(`Required Split #${index + 1} Destination`),
                }),
              ])
            )
          )
          .test('unique', 'Splits must have unique destinations', function (value) {
            const values = Object.values(value || {}).map((v: any) => v.value)
            return new Set(values).size === values.length
          }),
      }),
      splitShipmentTypes: Yup.object().when([], {
        is: () => splits.isSplitting,
        then: Yup.object().shape(
          Object.fromEntries(
            Array.from({ length: splits.splitsQty }, (_, index) => [
              index,
              Yup.object().shape({
                value: Yup.string().required(`Required Split #${index + 1} Shipment Type`),
              }),
            ])
          )
        ),
      }),
    }),
    onSubmit: async (values) => {
      setLoading(true)

      const createNewPurchaseOrder = toast.loading('Creating Purchase Order...')

      const poItems: poItem[] = []
      for await (const product of Object.values(reorderingPointsOrder.products)) {
        poItems.push({
          sku: product.sku,
          name: product.title,
          boxQty: product.boxQty,
          orderQty: product.useOrderAdjusted ? product.orderAdjusted : product.order,
          inboundQty: 0,
          sellerCost: product.sellerCost,
          inventoryId: product.inventoryId,
          receivedQty: 0,
          arrivalHistory: [],
        })
      }

      const hasSplitting = splits.isSplitting

      const splitsInfo = {} as { [split: string]: { splitId: number; splitName: string; destination: { id: number; label: string }; items: poItem[]; name3PL: string | null } }
      if (splits.isSplitting) {
        for await (const product of Object.values(reorderingPointsOrder.products)) {
          for (let i = 0; i < splits.splitsQty; i++) {
            if (!splitsInfo[i])
              splitsInfo[i] = {
                splitId: i,
                splitName: splitNames[`${i}`],
                destination: { id: parseInt(values.splitDestinations[i].value), label: values.splitDestinations[i].label },
                items: [],
                name3PL: warehouses.find((w) => w.warehouseId === parseInt(values.splitDestinations[i].value))?.name3PL || null,
              }
            splitsInfo[i].items.push({
              sku: product.sku,
              name: product.title,
              boxQty: product.boxQty,
              orderQty: product.useOrderAdjusted ? product.orderSplits[`${i}`].orderAdjusted : product.orderSplits[`${i}`].order,
              inboundQty: 0,
              sellerCost: product.sellerCost,
              inventoryId: product.inventoryId,
              receivedQty: 0,
              arrivalHistory: [],
            })
          }
        }
      }

      const selectedWarehouse = warehouses.find((w) => w.warehouseId === parseInt(values.destinationSC.value))

      const response = await axios.post(`/api/reorderingPoints/createNewPurchaseOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        orderNumber: values.orderNumber,
        destinationSC: hasSplitting ? 0 : warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
        warehouseId: hasSplitting ? 0 : parseInt(values.destinationSC.value),
        poItems,
        hasSplitting,
        splits: splitsInfo,
        selectedSupplier: selectedSupplier,
        name3PL: hasSplitting ? null : selectedWarehouse?.name3PL,
      })

      if (!response.data.error) {
        setshowPOModal(false)
        toast.update(createNewPurchaseOrder, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        mutate('/api/getuser')
        router.push('/purchaseOrders?status=pending&organizeBy=suppliers')
      } else {
        toast.update(createNewPurchaseOrder, {
          render: response.data.message ?? 'Error creating Purchase Order',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }

      setLoading(false)
    },
  })

  const handleSubmit = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleAddComment = async (comment: string, sku: string, inventoryId: number) => {
    setsavingComment(true)
    if (comment === '') reorderingPointsOrder.products[sku].note = ''
    else reorderingPointsOrder.products[sku].note = comment

    await axios
      .post(`/api/reorderingPoints/setNewComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        note: comment,
        inventoryId: inventoryId,
      })
      .then(() => {
        setsavingComment(false)
      })
  }

  const { filteredWarehouses, splitFilteredWarehouses } = useFilterWarehousesByShipmentType(warehouses, validation.values.shipmentType.value)

  return (
    <Modal fade={false} size='xl' id='unitsSoldDetailsModal' isOpen={showPOModal} toggle={() => setshowPOModal(false)}>
      <Form onSubmit={handleSubmit}>
        <ModalHeader toggle={() => setshowPOModal(false)}>
          <p className='m-0 p-0 mb-1 fw-bold fs-5'>Purchase Order</p>
          <p className='m-0 p-0 fw-normal fs-6'>Supplier: {selectedSupplier}</p>
        </ModalHeader>
        <ModalBody className='overflow-auto' style={{ minHeight: '60dvh' }}>
          <Row className='mb-2'>
            <Col xs={12} md={4}>
              <FormGroup className='createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='form-label mb-1 fs-7'>
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
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                  />
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            {!splits.isSplitting && (
              <>
                <Col xs={12} md={4}>
                  <Label htmlFor='shipmentType' className='form-label fs-7'>
                    *Shipment Type
                  </Label>
                  <SimpleSelect
                    options={RECEIVING_SHIPMENT_TYPES}
                    selected={validation.values.shipmentType}
                    handleSelect={(selected) => {
                      validation.setFieldValue('shipmentType', selected)
                      validation.setFieldValue('destinationSC', { value: '', label: 'Select ...' })
                    }}
                    placeholder={'Select ...'}
                    customStyle='sm'
                  />
                  {validation.errors.shipmentType && validation.touched.shipmentType ? (
                    <div className='m-0 p-0 text-danger fs-7'>*{validation.errors.shipmentType.value}</div>
                  ) : null}
                </Col>
                <Col xs={12} md={4}>
                  <Label htmlFor='destinationSC' className='form-label fs-7'>
                    *Select Destination
                  </Label>
                  <SimpleSelect
                    options={filteredWarehouses}
                    selected={validation.values.destinationSC}
                    handleSelect={(selected) => {
                      validation.setFieldValue('destinationSC', selected)
                    }}
                    placeholder={isLoading ? 'Loading...' : 'Select ...'}
                    customStyle='sm'
                  />
                  {validation.errors.destinationSC && validation.touched.destinationSC ? (
                    <div className='m-0 p-0 text-danger fs-7'>*{validation.errors.destinationSC.value}</div>
                  ) : null}
                </Col>
              </>
            )}
          </Row>
          {splits.isSplitting && (
            <Row className='mb-3'>
              <Label className='mb-1 fs-6 fw-semibold'>*Select Split Destination</Label>
              {Object.entries(validation.values.splitShipmentTypes).map(([key, split]) => (
                <Col xs={12} md={12 / Object.entries(validation.values.splitShipmentTypes).length} key={`splitShipmentType-${key}`} className='mb-2'>
                  <Label htmlFor={`splitShipmentType-${key}`} className='form-label mb-1 fs-7'>
                    <span className='fw-normal'>Shipment Type To: </span>
                    <span className='fw-semibold'>{splitNames[`${key}`]}</span>
                  </Label>
                  <SimpleSelect
                    options={RECEIVING_SHIPMENT_TYPES}
                    selected={split}
                    handleSelect={(selected) => {
                      validation.setFieldValue(`splitShipmentTypes.${key}`, selected)
                      validation.setFieldValue(`splitDestinations.${key}`, { value: '', label: 'Select ...' })
                    }}
                    placeholder={'Select ...'}
                    customStyle='sm'
                  />
                  {validation.errors.splitShipmentTypes &&
                  typeof validation.errors.splitShipmentTypes !== 'string' &&
                  validation.errors.splitShipmentTypes[key]?.value &&
                  validation.touched.splitShipmentTypes ? (
                    <div className='m-0 p-0 text-danger fs-7'>{`*${validation.errors.splitShipmentTypes[key]?.value}`}</div>
                  ) : null}
                </Col>
              ))}
              {Object.entries(validation.values.splitDestinations).map(([key, split]) => (
                <Col xs={12} md={12 / Object.entries(validation.values.splitDestinations).length} key={`splitDestination-${key}`}>
                  <Label htmlFor={`splitDestination-${key}`} className='form-label mb-1 fs-7'>
                    <span className='fw-normal'>Split:: </span>
                    <span className='fw-semibold'>{splitNames[`${key}`]}</span>
                  </Label>
                  <SimpleSelect
                    options={splitFilteredWarehouses(validation.values.splitShipmentTypes[`${key}`]?.value)}
                    selected={split}
                    handleSelect={(selected) => {
                      validation.setFieldValue(`splitDestinations.${key}`, selected)
                    }}
                    placeholder={isLoading ? 'Loading...' : 'Select ...'}
                    customStyle='sm'
                  />
                  {validation.errors.splitDestinations &&
                  typeof validation.errors.splitDestinations !== 'string' &&
                  validation.errors.splitDestinations[key]?.value &&
                  validation.touched.splitDestinations ? (
                    <div className='m-0 p-0 text-danger fs-7'>{`*${validation.errors.splitDestinations[key]?.value}`}</div>
                  ) : null}
                </Col>
              ))}
              {validation.errors.splitDestinations && typeof validation.errors.splitDestinations === 'string' && validation.touched.splitDestinations ? (
                <p className='mb-0 mt-1 text-danger fs-7'>{`*${validation.errors.splitDestinations}`}</p>
              ) : null}
            </Row>
          )}
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
                  {splits.isSplitting &&
                    Array(splits.splitsQty)
                      .fill('')
                      .map((_, splitIndex) => (
                        <th key={`splitHeader-${splitIndex}`} className='text-center'>
                          {splitNames[`${splitIndex}`]}
                        </th>
                      ))}
                  <th className='text-center'>Order Qty</th>
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
                            src={product.image ? product.image : NoImageAdress}
                            onError={(e) => (e.currentTarget.src = NoImageAdress)}
                            alt='product Image'
                            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                          />
                        </div>
                      </td>
                      <td className='w-25 fs-7'>
                        {product.title}
                        <br />
                        <span className='fs-7 text-muted'>{`UPC: ${product.barcode}`}</span>
                      </td>
                      <td className='d-flex flex-row justify-content-center align-items-end gap-1'>
                        <DebounceInput
                          element='textarea'
                          minLength={6}
                          debounceTimeout={1000}
                          className='form-control fs-7'
                          style={{ scrollbarWidth: 'none' }}
                          rows={product.note === '' ? 1 : 2}
                          placeholder='Add comment...'
                          id='search-options'
                          value={product.note}
                          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                          onChange={(e) => handleAddComment(e.target.value, product.sku, product.inventoryId)}
                        />
                        {savingComment ? <Spinner color='success' size={'sm'} /> : <i className={`mdi mdi-check-all fs-5 m-0 p-0 text-success`} />}
                      </td>
                      <td className='text-center align-middle'>{product.boxQty}</td>
                      {splits.isSplitting &&
                        Array(splits.splitsQty)
                          .fill('')
                          .map((_, splitIndex) => (
                            <td key={`splitProduct-${product.sku}-${splitIndex}`} className='text-center align-middle'>
                              {FormatIntNumber(
                                state.currentRegion,
                                product.useOrderAdjusted ? product.orderSplits[`${splitIndex}`].orderAdjusted : product.orderSplits[`${splitIndex}`].order
                              )}
                            </td>
                          ))}
                      <td className='text-center align-middle'>{FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                      <td className='text-center align-middle'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? productVolume / 61020 : productVolume / 1000000)} m³`}</td>

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
                  <td className='text-center'>TOTAL</td>
                  {splits.isSplitting &&
                    Array(splits.splitsQty)
                      .fill('')
                      .map((_, splitIndex) => (
                        <td key={`splitFooter-${splitIndex}`} className='text-center align-middle'>
                          {FormatIntNumber(
                            state.currentRegion,
                            Object.values(reorderingPointsOrder.products).reduce(
                              (total, product) =>
                                total + (product.useOrderAdjusted ? product.orderSplits[`${splitIndex}`].orderAdjusted : product.orderSplits[`${splitIndex}`].order),
                              0
                            )
                          )}
                        </td>
                      ))}
                  <td className='text-center'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                  <td className='text-center'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</td>
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
        <ModalFooter className='d-flex flex-row justify-content-end align-items-center gap-2'>
          <Button type='button' color='light' onClick={() => setshowPOModal(false)}>
            Close
          </Button>
          <UncontrolledButtonDropdown>
            <DropdownToggle className='btn btn-primary fs-6 py-2' caret>
              Actions
            </DropdownToggle>
            <DropdownMenu>
              <PrintReorderingPointsOrder
                reorderingPointsOrder={reorderingPointsOrder}
                orderDetails={validation.values}
                selectedSupplier={selectedSupplier}
                username={username}
                orderComment={orderComment}
                printColumns={printColumns}
                splits={splits}
                splitNames={splitNames}
              />
              <DownloadExcelReorderingPointsOrder
                reorderingPointsOrder={reorderingPointsOrder}
                orderDetails={validation.values}
                selectedSupplier={selectedSupplier}
                username={username}
                orderComment={orderComment}
                splits={splits}
                splitNames={splitNames}
              />
            </DropdownMenu>
          </UncontrolledButtonDropdown>
          <Button disabled={loading || savingComment} type='submit' color='success'>
            {loading ? (
              <span>
                <Spinner color='light' size={'sm'} /> Creating PO
              </span>
            ) : (
              'Create PO'
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default ReorderingPointsCreatePOModal
