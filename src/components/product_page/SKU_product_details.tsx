import { useContext, useState } from 'react'

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
  upc?: string
  htsCode: string
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
}

const SKU_product_details = ({ inventoryId, sku, upc, htsCode, defaultPrice, msrp, map, floor, ceilling }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      upc,
      htsCode,
      defaultPrice,
      msrp,
      map,
      floor,
      ceilling,
    },
    validationSchema: Yup.object({
      htsCode: Yup.string(),
      defaultPrice: Yup.number().min(0, 'Minimum of 0').required('Enter Price'),
      msrp: Yup.number().min(0, 'Minimum of 0').required('Enter MSRP'),
      map: Yup.number().min(0, 'Minimum of 0').required('Enter MAP'),
      floor: Yup.number().min(0, 'Minimum of 0').required('Enter Floor'),
      ceilling: Yup.number().min(0, 'Minimum of 0').required('Enter Ceilling'),
    }),
    onSubmit: async (values) => {
      setisLoading(true)
      const response = await axios.post(`/api/productDetails/skuProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
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
      upc,
      htsCode,
      defaultPrice,
      msrp,
      map,
      floor,
      ceilling,
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
                <th>SKU</th>
                <th>UPC</th>
                <th>HTS Code</th>
                <th>Default Price</th>
                <th id='msrpHead'>MSRP</th>
                <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='bg-white text-primary shadow'>
                  {`Manufacturer's Suggested Retail Price`}
                </UncontrolledTooltip>
                <th id='mapHead'>MAP</th>
                <UncontrolledTooltip placement='top' target='mapHead' innerClassName='bg-white text-primary shadow'>
                  {`Minimum Advertised Price`}
                </UncontrolledTooltip>
                <th id='minSalePriceHead'>Floor</th>
                <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='bg-white text-primary shadow'>
                  {`Minimum Sale Price`}
                </UncontrolledTooltip>
                <th id='maxSalePriceHead'>Ceilling</th>
                <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='bg-white text-primary shadow'>
                  {`Maximum Sale Price`}
                </UncontrolledTooltip>
                <th></th>
              </tr>
            </thead>
            <tbody className='fs-7'>
              <tr className='text-center text-nowrap'>
                <td>{sku}</td>
                <td>{upc}</td>
                <td>{htsCode}</td>
                <td>{FormatCurrency(state.currentRegion, defaultPrice)}</td>
                <td>{FormatCurrency(state.currentRegion, msrp)}</td>
                <td>{FormatCurrency(state.currentRegion, map)}</td>
                <td>{FormatCurrency(state.currentRegion, floor)}</td>
                <td>{FormatCurrency(state.currentRegion, ceilling)}</td>
                <td>
                  <div className='text-end'>
                    <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 text-primary m-0 p-0' style={{ cursor: 'pointer' }}></i>
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
                  <th>SKU</th>
                  <th>UPC</th>
                  <th>HTS Code</th>
                  <th>Default Price</th>
                  <th id='msrpHead'>MSRP</th>
                  <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='bg-white text-primary shadow'>
                    {`Manufacturer's Suggested Retail Price`}
                  </UncontrolledTooltip>
                  <th id='mapHead'>MAP</th>
                  <UncontrolledTooltip placement='top' target='mapHead' innerClassName='bg-white text-primary shadow'>
                    {`Minimum Advertised Price`}
                  </UncontrolledTooltip>
                  <th id='minSalePriceHead'>Floor</th>
                  <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='bg-white text-primary shadow'>
                    {`Minimum Sale Price`}
                  </UncontrolledTooltip>
                  <th id='maxSalePriceHead'>Ceilling</th>
                  <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='bg-white text-primary shadow'>
                    {`Maximum Sale Price`}
                  </UncontrolledTooltip>
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <FormGroup>
                      <Input
                        disabled
                        type='text'
                        className='form-control fs-6'
                        style={{ minWidth: '80px' }}
                        placeholder='sku...'
                        id='sku'
                        name='sku'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sku || ''}
                        invalid={validation.touched.sku && validation.errors.sku ? true : false}
                      />
                      {validation.touched.sku && validation.errors.sku ? <FormFeedback type='invalid'>{validation.errors.sku}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        disabled
                        type='text'
                        className='form-control fs-6'
                        style={{ minWidth: '80px' }}
                        placeholder='upc...'
                        id='upc'
                        name='upc'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.upc || ''}
                        invalid={validation.touched.upc && validation.errors.upc ? true : false}
                      />
                      {validation.touched.upc && validation.errors.upc ? <FormFeedback type='invalid'>{validation.errors.upc}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='text'
                        className='form-control fs-6'
                        style={{ minWidth: '80px' }}
                        placeholder='HTS Code...'
                        id='htsCode'
                        name='htsCode'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.htsCode || ''}
                        invalid={validation.touched.htsCode && validation.errors.htsCode ? true : false}
                      />
                      {validation.touched.htsCode && validation.errors.htsCode ? <FormFeedback type='invalid'>{validation.errors.htsCode}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='defaultPrice...'
                        id='defaultPrice'
                        name='defaultPrice'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.defaultPrice || 0}
                        invalid={validation.touched.defaultPrice && validation.errors.defaultPrice ? true : false}
                      />
                      {validation.touched.defaultPrice && validation.errors.defaultPrice ? <FormFeedback type='invalid'>{validation.errors.defaultPrice}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='msrp...'
                        id='msrp'
                        name='msrp'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.msrp || 0}
                        invalid={validation.touched.msrp && validation.errors.msrp ? true : false}
                      />
                      {validation.touched.msrp && validation.errors.msrp ? <FormFeedback type='invalid'>{validation.errors.msrp}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='map...'
                        id='map'
                        name='map'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.map || 0}
                        invalid={validation.touched.map && validation.errors.map ? true : false}
                      />
                      {validation.touched.map && validation.errors.map ? <FormFeedback type='invalid'>{validation.errors.map}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='floor...'
                        id='floor'
                        name='floor'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.floor || 0}
                        invalid={validation.touched.floor && validation.errors.floor ? true : false}
                      />
                      {validation.touched.floor && validation.errors.floor ? <FormFeedback type='invalid'>{validation.errors.floor}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='ceilling...'
                        id='ceilling'
                        name='ceilling'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.ceilling || 0}
                        invalid={validation.touched.ceilling && validation.errors.ceilling ? true : false}
                      />
                      {validation.touched.ceilling && validation.errors.ceilling ? <FormFeedback type='invalid'>{validation.errors.ceilling}</FormFeedback> : null}
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

export default SKU_product_details
