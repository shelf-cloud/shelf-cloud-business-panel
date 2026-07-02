/* eslint-disable @next/next/no-img-element */
import router from 'next/router'
import { useContext, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import { RECEIVING_SHIPMENT_TYPES } from '@components/constants/receivings'
import DownloadExcelReorderingPointsOrder from '@components/reorderingPoints/DownloadExcelReorderingPointsOrder'
import PrintReorderingPointsOrder from '@components/reorderingPoints/PrintReorderingPointsOrder'
import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
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
import { useSWRConfig } from 'swr'

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
} from '@/components/migration-ui'
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

  const { generate_new_forecast_products } = useRPNewForecast()

  const orderNumberStart = `${username.substring(0, 3).toUpperCase()}-`

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state.user.orderNumber.us}` : `00${state.user.orderNumber.eu}`,
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

        generate_new_forecast_products({
          skus: poItems.map((item) => item.sku),
          productIds: poItems.map((item) => item.inventoryId),
        })

        await mutate('/api/getuser').then(() => {
          router.push('/purchaseOrders?status=pending&organizeBy=suppliers')
        })
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
          <p className='tw:m-0 tw:p-0 tw:mb-1 tw:font-bold tw:text-[16.25px]'>Purchase Order</p>
          <p className='tw:m-0 tw:p-0 tw:font-normal tw:text-[13px]'>Supplier: {selectedSupplier}</p>
        </ModalHeader>
        <ModalBody className='tw:overflow-auto' style={{ minHeight: '60dvh' }}>
          <Row className='tw:mb-2'>
            <Col xs={12} md={4}>
              <FormGroup className='createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='form-label tw:mb-1 tw:text-[11.2px]'>
                  *Purchase Order Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text tw:font-semibold tw:text-[13px]' style={{ padding: '0.2rem 0.9rem' }} id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    type='text'
                    className='tw:text-[13px]'
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
                  <Label htmlFor='shipmentType' className='form-label tw:text-[11.2px]'>
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
                    <div className='tw:m-0 tw:p-0 tw:text-danger tw:text-[11.2px]'>*{validation.errors.shipmentType.value}</div>
                  ) : null}
                </Col>
                <Col xs={12} md={4}>
                  <Label htmlFor='destinationSC' className='form-label tw:text-[11.2px]'>
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
                    <div className='tw:m-0 tw:p-0 tw:text-danger tw:text-[11.2px]'>*{validation.errors.destinationSC.value}</div>
                  ) : null}
                </Col>
              </>
            )}
          </Row>
          {splits.isSplitting && (
            <Row className='tw:mb-4'>
              <Label className='tw:mb-1 tw:text-[13px] tw:font-semibold'>*Select Split Destination</Label>
              {Object.entries(validation.values.splitShipmentTypes).map(([key, split]) => (
                <Col xs={12} md={12 / Object.entries(validation.values.splitShipmentTypes).length} key={`splitShipmentType-${key}`} className='tw:mb-2'>
                  <Label htmlFor={`splitShipmentType-${key}`} className='form-label tw:mb-1 tw:text-[11.2px]'>
                    <span className='tw:font-normal'>Shipment Type To: </span>
                    <span className='tw:font-semibold'>{splitNames[`${key}`]}</span>
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
                    <div className='tw:m-0 tw:p-0 tw:text-danger tw:text-[11.2px]'>{`*${validation.errors.splitShipmentTypes[key]?.value}`}</div>
                  ) : null}
                </Col>
              ))}
              {Object.entries(validation.values.splitDestinations).map(([key, split]) => (
                <Col xs={12} md={12 / Object.entries(validation.values.splitDestinations).length} key={`splitDestination-${key}`}>
                  <Label htmlFor={`splitDestination-${key}`} className='form-label tw:mb-1 tw:text-[11.2px]'>
                    <span className='tw:font-normal'>Split:: </span>
                    <span className='tw:font-semibold'>{splitNames[`${key}`]}</span>
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
                    <div className='tw:m-0 tw:p-0 tw:text-danger tw:text-[11.2px]'>{`*${validation.errors.splitDestinations[key]?.value}`}</div>
                  ) : null}
                </Col>
              ))}
              {validation.errors.splitDestinations && typeof validation.errors.splitDestinations === 'string' && validation.touched.splitDestinations ? (
                <p className='tw:mb-0 tw:mt-1 tw:text-danger tw:text-[11.2px]'>{`*${validation.errors.splitDestinations}`}</p>
              ) : null}
            </Row>
          )}
          <span className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>*Select the columns you wish to print.</span>
          <div className='tw:flex tw:flex-row tw:justify-evenly tw:items-start'>
            <table className='tw:w-full tw:align-middle tw:mb-0 tw:border tw:border-[color:var(--border)] tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_th]:border tw:[&_th]:border-[color:var(--border)] tw:[&_td]:border tw:[&_td]:border-[color:var(--border)] tw:[&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] tw:[&_tbody_tr:hover]:bg-[color-mix(in_srgb,var(--bs-light)_60%,transparent)]'>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>
                    Product Comment{' '}
                    <Input
                      type='checkbox'
                      className='tw:text-[11.2px]'
                      checked={printColumns.comments}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, comments: !printColumns.comments }
                        })
                      }
                    />
                  </th>
                  <th className='tw:text-center'>
                    Qty Per Box{' '}
                    <Input
                      type='checkbox'
                      className='tw:text-[11.2px]'
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
                        <th key={`splitHeader-${splitIndex}`} className='tw:text-center'>
                          {splitNames[`${splitIndex}`]}
                        </th>
                      ))}
                  <th className='tw:text-center'>Order Qty</th>
                  <th className='tw:text-center'>
                    Volume{' '}
                    <Input
                      type='checkbox'
                      className='tw:text-[11.2px]'
                      checked={printColumns.volume}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, volume: !printColumns.volume }
                        })
                      }
                    />
                  </th>
                  <th className='tw:text-center'>
                    Cost{' '}
                    <Input
                      type='checkbox'
                      className='tw:text-[11.2px]'
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
                      <td className='tw:text-nowrap'>{product.sku}</td>
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
                      <td className='tw:w-1/4 tw:text-[11.2px]'>
                        {product.title}
                        <br />
                        <span className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>{`UPC: ${product.barcode}`}</span>
                      </td>
                      <td className='tw:flex tw:flex-row tw:justify-center tw:items-end tw:gap-1'>
                        <DebounceInput
                          element='textarea'
                          minLength={6}
                          debounceTimeout={1000}
                          className='form-control tw:text-[11.2px]'
                          style={{ scrollbarWidth: 'none' }}
                          rows={product.note === '' ? 1 : 2}
                          placeholder='Add comment...'
                          id='search-options'
                          value={product.note}
                          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                          onChange={(e) => handleAddComment(e.target.value, product.sku, product.inventoryId)}
                        />
                        {savingComment ? <Spinner color='success' size={'sm'} /> : <i className={`mdi mdi-check-all tw:text-[16.25px] tw:m-0 tw:p-0 tw:text-success`} />}
                      </td>
                      <td className='tw:text-center tw:align-middle'>{product.boxQty}</td>
                      {splits.isSplitting &&
                        Array(splits.splitsQty)
                          .fill('')
                          .map((_, splitIndex) => (
                            <td key={`splitProduct-${product.sku}-${splitIndex}`} className='tw:text-center tw:align-middle'>
                              {FormatIntNumber(
                                state.currentRegion,
                                product.useOrderAdjusted ? product.orderSplits[`${splitIndex}`].orderAdjusted : product.orderSplits[`${splitIndex}`].order
                              )}
                            </td>
                          ))}
                      <td className='tw:text-center tw:align-middle'>{FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                      <td className='tw:text-center tw:align-middle'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? productVolume / 61020 : productVolume / 1000000)} m³`}</td>

                      <td className='tw:text-center tw:align-middle'>
                        {FormatCurrency(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className='tw:font-semibold'>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='tw:text-center'>TOTAL</td>
                  {splits.isSplitting &&
                    Array(splits.splitsQty)
                      .fill('')
                      .map((_, splitIndex) => (
                        <td key={`splitFooter-${splitIndex}`} className='tw:text-center tw:align-middle'>
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
                  <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                  <td className='tw:text-center'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</td>
                  <td className='tw:text-center'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Row className='tw:my-1'>
            <Col xs={12} md={6}>
              <Label className='form-label tw:mb-0 tw:text-[11.2px]'>Order Comment</Label>
              <DebounceInput
                element='textarea'
                minLength={5}
                debounceTimeout={800}
                className='form-control tw:text-[11.2px]'
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
        <ModalFooter className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'>
          <Button type='button' color='light' onClick={() => setshowPOModal(false)}>
            Close
          </Button>
          <UncontrolledButtonDropdown>
            <DropdownToggle className='tw:inline-flex tw:items-center tw:bg-primary tw:text-white tw:rounded tw:px-3 tw:py-2 tw:text-[13px]' caret>
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
