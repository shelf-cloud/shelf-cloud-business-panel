import React, { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  inventoryId?: number
  sku?: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA?: number
}

const Supplier_Product_Details = ({ inventoryId, sku, sellerCost, inboundShippingCost, otherCosts, productionTime, transitTime, shippingToFBA }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const landedCost = sellerCost + inboundShippingCost + otherCosts || 0
  const totalLeadTime = productionTime + transitTime

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
    },
    validationSchema: Yup.object({
      sellerCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      inboundShippingCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      otherCosts: Yup.number().min(0, 'Minimum of 0'),
      productionTime: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
      transitTime: Yup.number().min(0, 'Minimum of 0'),
      shippingToFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
    }),
    onSubmit: async (values) => {
      setisLoading(true)
      const response = await axios.post(`/api/productDetails/supplierProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
      setisLoading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
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
                <th>{`Production Time (Days)`}</th>
                <th>{`Transit Time (Days)`}</th>
                <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                  {`Total Days from Production and Transit`}
                </UncontrolledTooltip>
                <th>Shipping To FBA Cost</th>
                <th></th>
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
                <td className={productionTime ? '' : 'text-muted fw-light fst-italic'}>{`${productionTime ?? 'No'} Days`}</td>
                <td className={transitTime ? '' : 'text-muted fw-light fst-italic'}>{`${transitTime ?? 'No'} Days`}</td>
                <td className={totalLeadTime ? '' : 'text-muted fw-light fst-italic'}>{`${totalLeadTime ?? 'No'} Days`}</td>
                <td className={shippingToFBA ? '' : 'text-muted fw-light fst-italic'}>{shippingToFBA ? FormatCurrency(state.currentRegion, shippingToFBA) : 'No Cost'}</td>
                <td>
                  <div className='text-end'>
                    <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Form onSubmit={HandleAddProduct}>
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
                  <th>{`Production Time (Days)`}</th>
                  <th>{`Transit Time (Days)`}</th>
                  <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                  <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                    {`Total Days from Production and Transit`}
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
