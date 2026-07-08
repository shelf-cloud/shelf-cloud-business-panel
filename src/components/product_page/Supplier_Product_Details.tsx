import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Switch } from '@shadcn/ui/switch'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Badge, Button, Col, Form, FormFeedback, FormGroup, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

type Props = {
  inventoryId?: number
  sku?: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA?: number
  hideReorderingPoints?: boolean
  orderFrequency?: number
  daysOfStockSC?: number
  manualLeadTime?: boolean
  leadTimeSC?: number
}

const Supplier_Product_Details = ({
  inventoryId,
  sku,
  sellerCost,
  inboundShippingCost,
  otherCosts,
  productionTime,
  transitTime,
  shippingToFBA,
  hideReorderingPoints,
  orderFrequency,
  daysOfStockSC,
  manualLeadTime,
  leadTimeSC,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const { generate_new_forecast_products } = useRPNewForecast()

  const showReorderingPoints = Boolean(state.user[state.currentRegion]?.showReorderingPoints)
  const landedCost = sellerCost + inboundShippingCost + otherCosts || 0
  const totalLeadTime = productionTime + transitTime
  const productPageDetailsKey = `/api/products/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      sellerCost,
      inboundShippingCost,
      otherCosts,
      productionTime,
      transitTime,
      shippingToFBA,
      hideReorderingPoints: Boolean(hideReorderingPoints),
      orderFrequency: orderFrequency ?? 0,
      daysOfStockSC: daysOfStockSC ?? 0,
      manualLeadTime: Boolean(manualLeadTime),
      leadTimeSC: leadTimeSC ?? 0,
    },
    validationSchema: Yup.object({
      sellerCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      inboundShippingCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      otherCosts: Yup.number().min(0, 'Minimum of 0'),
      productionTime: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
      transitTime: Yup.number().min(0, 'Minimum of 0'),
      shippingToFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
      orderFrequency: Yup.number().min(0, 'Minimum of 0').required('Enter Order Frequency'),
      daysOfStockSC: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock'),
      leadTimeSC: Yup.number().min(0, 'Minimum of 0'),
      manualLeadTime: Yup.boolean(),
    }),
    onSubmit: async (values) => {
      setisLoading(true)
      const response = await axios.post(`/api/productDetails/supplierProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        generate_new_forecast_products({
          skus: [sku || ''],
          productIds: [inventoryId || 0],
        })
        toast.success(response.data.msg)
        mutate(productPageDetailsKey)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
      setisLoading(false)
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleShowEditFields = () => {
    validation.setValues({
      inventoryId,
      sku,
      sellerCost,
      inboundShippingCost,
      otherCosts,
      productionTime,
      transitTime,
      shippingToFBA,
      hideReorderingPoints: Boolean(hideReorderingPoints),
      orderFrequency: orderFrequency ?? 0,
      daysOfStockSC: daysOfStockSC ?? 0,
      manualLeadTime: Boolean(manualLeadTime),
      leadTimeSC: leadTimeSC ?? 0,
    })
    setShowEditFields(true)
  }

  return (
    <div className='py-1 w-100'>
      {!showEditFields ? (
        <div>
          <table className='table table-sm table-borderless'>
            <thead>
              <tr className='text-center'>
                <th>Seller Cost</th>
                <th>Inbound Shipping Cost</th>
                <th>Other Costs</th>
                <th id='landedCostHead'>Landed Cost</th>
                <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                  {`Total of Seller, Inbound and Other Costs`}
                </UncontrolledTooltip>
                <th>Shipping To FBA Cost</th>
              </tr>
            </thead>
            <tbody className='fs-7'>
              <tr className='text-center'>
                <td className={sellerCost ? '' : 'text-muted fw-light fst-italic'}>{sellerCost ? FormatCurrency(state.currentRegion, sellerCost) : 'No Cost'}</td>
                <td className={inboundShippingCost ? '' : 'text-muted fw-light fst-italic'}>
                  {inboundShippingCost ? FormatCurrency(state.currentRegion, inboundShippingCost) : 'No Cost'}
                </td>
                <td className={otherCosts ? '' : 'text-muted fw-light fst-italic'}>{otherCosts ? FormatCurrency(state.currentRegion, otherCosts) : 'No Cost'}</td>
                <td className={landedCost ? '' : 'text-muted fw-light fst-italic'}>{landedCost ? FormatCurrency(state.currentRegion, landedCost) : 'No Cost'}</td>
                <td className={shippingToFBA ? '' : 'text-muted fw-light fst-italic'}>{shippingToFBA ? FormatCurrency(state.currentRegion, shippingToFBA) : 'No Cost'}</td>
              </tr>
            </tbody>
          </table>
          <table className='table table-sm table-borderless'>
            <thead>
              <tr className='text-center'>
                <th>{`Production Time (Days)`}</th>
                <th>{`Transit Time (Days)`}</th>
                <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                  {`Total Days from Production and Transit`}
                </UncontrolledTooltip>
                {showReorderingPoints && (
                  <>
                    <th>RP Visibility</th>
                    <th>Order Frequency</th>
                    <th>Days Of Stock After Lead Time</th>
                    <th>Manual Lead Time</th>
                    <th>Lead Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className='fs-7'>
              <tr className='text-center'>
                <td className={productionTime ? '' : 'text-muted fw-light fst-italic'}>{`${productionTime ?? 'No'} Days`}</td>
                <td className={transitTime ? '' : 'text-muted fw-light fst-italic'}>{`${transitTime ?? 'No'} Days`}</td>
                <td className={totalLeadTime ? '' : 'text-muted fw-light fst-italic'}>{`${totalLeadTime ?? 'No'} Days`}</td>
                {showReorderingPoints && (
                  <>
                    <td>
                      <Badge color={hideReorderingPoints ? 'warning' : 'success'}>{hideReorderingPoints ? 'Hidden' : 'Visible'}</Badge>
                    </td>
                    <td>{`${orderFrequency ?? 0} Weeks`}</td>
                    <td>{`${daysOfStockSC ?? 0} Days`}</td>
                    <td>{manualLeadTime ? 'On' : 'Off'}</td>
                    <td>{`${leadTimeSC ?? 0} Days`}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
          <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
            <Button type='button' aria-label='Edit supplier details' onClick={handleShowEditFields} color='primary' className='btn btn-sm'>
              <i className='ri-pencil-fill fs-5 m-0 p-0' />
            </Button>
          </div>
        </div>
      ) : (
        <Form onSubmit={handleAddProduct}>
          <Row>
            <table className='table table-sm table-borderless'>
              <thead>
                <tr className='text-center'>
                  <th>Seller Cost</th>
                  <th>Inbound Shipping Cost</th>
                  <th>Other Costs</th>
                  <th id='landedCostHead'>Landed Cost</th>
                  <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                    {`Total of Seller, Inbound and Other Costs`}
                  </UncontrolledTooltip>
                  <th>Shipping To FBA Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        style={{ minWidth: '60px' }}
                        placeholder='Seller Cost...'
                        id='sellerCost'
                        name='sellerCost'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sellerCost || 0}
                        invalid={validation.touched.sellerCost && validation.errors.sellerCost ? true : false}
                      />
                      {validation.touched.sellerCost && validation.errors.sellerCost ? <FormFeedback type='invalid'>{validation.errors.sellerCost}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Shipping Cost...'
                        id='inboundShippingCost'
                        name='inboundShippingCost'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.inboundShippingCost || 0}
                        invalid={validation.touched.inboundShippingCost && validation.errors.inboundShippingCost ? true : false}
                      />
                      {validation.touched.inboundShippingCost && validation.errors.inboundShippingCost ? (
                        <FormFeedback type='invalid'>{validation.errors.inboundShippingCost}</FormFeedback>
                      ) : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Other Cost...'
                        id='otherCosts'
                        name='otherCosts'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.otherCosts || 0}
                        invalid={validation.touched.otherCosts && validation.errors.otherCosts ? true : false}
                      />
                      {validation.touched.otherCosts && validation.errors.otherCosts ? <FormFeedback type='invalid'>{validation.errors.otherCosts}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        disabled
                        type='number'
                        className='form-control fs-6'
                        style={{ minWidth: '60px' }}
                        placeholder='Seller Cost...'
                        id='landedCost'
                        name='landedCost'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={Number(validation.values.sellerCost + validation.values.inboundShippingCost + validation.values.otherCosts).toFixed(2) || 0}
                      />
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='FBA Cost...'
                        id='shippingToFBA'
                        name='shippingToFBA'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.shippingToFBA || 0}
                        invalid={validation.touched.shippingToFBA && validation.errors.shippingToFBA ? true : false}
                      />
                      {validation.touched.shippingToFBA && validation.errors.shippingToFBA ? <FormFeedback type='invalid'>{validation.errors.shippingToFBA}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className='table table-sm table-borderless'>
              <thead>
                <tr className='text-center'>
                  <th>{`Production Time (Days)`}</th>
                  <th>{`Transit Time (Days)`}</th>
                  <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                  <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                    {`Total Days from Production and Transit`}
                  </UncontrolledTooltip>
                  {showReorderingPoints && (
                    <>
                      <th>RP Visibility</th>
                      <th>Order Frequency</th>
                      <th>Days Of Stock After Lead Time</th>
                      <th>Manual Lead Time</th>
                      <th>Lead Time</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Production...'
                        id='productionTime'
                        name='productionTime'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.productionTime || 0}
                        invalid={validation.touched.productionTime && validation.errors.productionTime ? true : false}
                      />
                      {validation.touched.productionTime && validation.errors.productionTime ? (
                        <FormFeedback type='invalid'>{validation.errors.productionTime}</FormFeedback>
                      ) : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Transit...'
                        id='transitTime'
                        name='transitTime'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.transitTime || 0}
                        invalid={validation.touched.transitTime && validation.errors.transitTime ? true : false}
                      />
                      {validation.touched.transitTime && validation.errors.transitTime ? <FormFeedback type='invalid'>{validation.errors.transitTime}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        disabled
                        type='number'
                        className='form-control fs-6'
                        placeholder='Transit...'
                        id='totalTime'
                        name='totalTime'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={Number(validation.values.productionTime + validation.values.transitTime) || 0}
                      />
                    </FormGroup>
                  </td>
                  {showReorderingPoints && (
                    <>
                      <td>
                        <FormGroup className='d-flex justify-content-center align-items-center pt-1'>
                          <Switch
                            checked={!validation.values.hideReorderingPoints}
                            onCheckedChange={(checked) => validation.setFieldValue('hideReorderingPoints', !checked)}
                            aria-label='Reordering points visibility'
                          />
                        </FormGroup>
                      </td>
                      <td>
                        <FormGroup>
                          <Input
                            type='number'
                            className='form-control fs-6'
                            placeholder='Frequency...'
                            id='orderFrequency'
                            name='orderFrequency'
                            bsSize='sm'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.orderFrequency || 0}
                            invalid={validation.touched.orderFrequency && validation.errors.orderFrequency ? true : false}
                          />
                          {validation.touched.orderFrequency && validation.errors.orderFrequency ? (
                            <FormFeedback type='invalid'>{validation.errors.orderFrequency}</FormFeedback>
                          ) : null}
                        </FormGroup>
                      </td>
                      <td>
                        <FormGroup>
                          <Input
                            type='number'
                            className='form-control fs-6'
                            placeholder='Days...'
                            id='daysOfStockSC'
                            name='daysOfStockSC'
                            bsSize='sm'
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.daysOfStockSC || 0}
                            invalid={validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? true : false}
                          />
                          {validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? (
                            <FormFeedback type='invalid'>{validation.errors.daysOfStockSC}</FormFeedback>
                          ) : null}
                        </FormGroup>
                      </td>
                      <td>
                        <FormGroup className='d-flex justify-content-center align-items-center pt-1'>
                          <Switch
                            checked={validation.values.manualLeadTime}
                            onCheckedChange={(checked) => validation.setFieldValue('manualLeadTime', checked)}
                            aria-label='Manual lead time'
                          />
                        </FormGroup>
                      </td>
                      <td>
                        <FormGroup>
                          <Input
                            disabled
                            type='number'
                            className='form-control fs-6'
                            placeholder='Lead Time...'
                            id='leadTimeSC'
                            name='leadTimeSC'
                            bsSize='sm'
                            value={validation.values.leadTimeSC || 0}
                          />
                        </FormGroup>
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
            <Col md={12}>
              <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                <Button disabled={isLoading} type='button' color='light' className='btn' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit' color='primary' className='btn'>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}

export default Supplier_Product_Details
