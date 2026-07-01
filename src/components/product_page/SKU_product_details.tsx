import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Row, UncontrolledTooltip } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

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

  const { generate_new_forecast_products } = useRPNewForecast()

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
        generate_new_forecast_products({
          skus: [sku || ''],
          productIds: [inventoryId || 0],
        })
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
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
    <div className='tw:py-1 tw:w-full'>
      {!showEditFields ? (
        <div>
          <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
            <thead>
              <tr className='tw:text-center'>
                <th>SKU</th>
                <th>UPC</th>
                <th>HTS Code</th>
                <th>Default Price</th>
                <th id='msrpHead'>MSRP</th>
                <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                  {`Manufacturer's Suggested Retail Price`}
                </UncontrolledTooltip>
                <th id='mapHead'>MAP</th>
                <UncontrolledTooltip placement='top' target='mapHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                  {`Minimum Advertised Price`}
                </UncontrolledTooltip>
                <th id='minSalePriceHead'>Floor</th>
                <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                  {`Minimum Sale Price`}
                </UncontrolledTooltip>
                <th id='maxSalePriceHead'>Ceilling</th>
                <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                  {`Maximum Sale Price`}
                </UncontrolledTooltip>
                <th scope='col' aria-label='SKU row actions'></th>
              </tr>
            </thead>
            <tbody>
              <tr className='tw:text-center tw:text-nowrap'>
                <td>{sku}</td>
                <td>{upc}</td>
                <td>{htsCode}</td>
                <td>{FormatCurrency(state.currentRegion, defaultPrice)}</td>
                <td>{FormatCurrency(state.currentRegion, msrp)}</td>
                <td>{FormatCurrency(state.currentRegion, map)}</td>
                <td>{FormatCurrency(state.currentRegion, floor)}</td>
                <td>{FormatCurrency(state.currentRegion, ceilling)}</td>
                <td>
                  <div className='tw:text-right'>
                    <button type='button' aria-label='Edit SKU details' onClick={handleShowEditFields} className='tw:p-0 tw:border-0 tw:bg-transparent'>
                      <i className='ri-pencil-fill tw:text-[16.25px] tw:text-primary tw:m-0 tw:p-0'></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Form onSubmit={handleAddProduct}>
          <Row>
            <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
              <thead>
                <tr className='tw:text-center'>
                  <th>SKU</th>
                  <th>UPC</th>
                  <th>HTS Code</th>
                  <th>Default Price</th>
                  <th id='msrpHead'>MSRP</th>
                  <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                    {`Manufacturer's Suggested Retail Price`}
                  </UncontrolledTooltip>
                  <th id='mapHead'>MAP</th>
                  <UncontrolledTooltip placement='top' target='mapHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                    {`Minimum Advertised Price`}
                  </UncontrolledTooltip>
                  <th id='minSalePriceHead'>Floor</th>
                  <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                    {`Minimum Sale Price`}
                  </UncontrolledTooltip>
                  <th id='maxSalePriceHead'>Ceilling</th>
                  <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                    {`Maximum Sale Price`}
                  </UncontrolledTooltip>
                </tr>
              </thead>
              <tbody>
                <tr className='tw:text-center'>
                  <td>
                    <FormGroup>
                      <Input
                        disabled
                        type='text'
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
                        className='tw:text-[13px]'
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
              <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-3'>
                <Button disabled={isLoading} type='button' color='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit' color='primary'>
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
