import AppContext from '@context/AppContext'
import React, { useContext, useState } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Row } from 'reactstrap'

type Props = {
  inventoryId?: number
  sku?: string
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
}

const Measure_Product_Details = ({ inventoryId, sku, weight, length, width, height, boxQty, boxWeight, boxLength, boxWidth, boxHeight }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [showEditButton, setShowEditButton] = useState({ display: 'none' })

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      weight,
      length,
      width,
      height,
      boxQty,
      boxWeight,
      boxLength,
      boxWidth,
      boxHeight,
    },
    validationSchema: Yup.object({
      weight: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter weight'),
      length: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter length'),
      width: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter width'),
      height: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter height'),
      boxQty: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter box Qty'),
      boxWeight: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter box Weight'),
      boxLength: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter box Length'),
      boxWidth: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter box Width'),
      boxHeight: Yup.number().min(0.1, 'Minimum of 0.1').required('Enter box Height'),
    }),
    onSubmit: async (values) => {
      const response = await axios.post(`/api/productDetails/measureProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
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
      weight,
      length,
      width,
      height,
      boxQty,
      boxWeight,
      boxLength,
      boxWidth,
      boxHeight,
    })
    setShowEditFields(true)
  }

  return (
    <div className='py-1 w-100' onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
      {!showEditFields ? (
        <div>
          <table className='table table-sm'>
            <thead>
              <tr className='text-center'>
                <th>Description</th>
                <th>Qty</th>
                <th>Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}</th>
                <th>Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
                <th>Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
                <th>Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center'>
                <td className='fw-semibold'>Each</td>
                <td>1</td>
                <td>
                  {weight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
                </td>
                <td>
                  {length} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
                <td>
                  {width} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
                <td>
                  {height} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
              </tr>
              <tr className='text-center'>
                <td className='fw-semibold'>Master Box</td>
                <td>{boxQty}</td>
                <td>
                  {boxWeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
                </td>
                <td>
                  {boxLength} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
                <td>
                  {boxWidth} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
                <td>
                  {boxHeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
                </td>
              </tr>
            </tbody>
          </table>
          <div className='text-end' style={showEditButton}>
            <i onClick={handleShowEditFields} className='ri-pencil-fill fs-3 text-secondary' style={{ cursor: 'pointer' }}></i>
          </div>
        </div>
      ) : (
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <table className='table table-sm table-borderless'>
              <thead>
                <tr className='text-center'>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}</th>
                  <th>Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
                  <th>Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
                  <th>Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td className='fw-semibold'>Each</td>
                  <td>1</td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Weight...'
                        id='weight'
                        name='weight'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.weight || 0}
                        invalid={validation.touched.weight && validation.errors.weight ? true : false}
                      />
                      {validation.touched.weight && validation.errors.weight ? <FormFeedback type='invalid'>{validation.errors.weight}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Length...'
                        id='length'
                        name='length'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.length || 0}
                        invalid={validation.touched.length && validation.errors.length ? true : false}
                      />
                      {validation.touched.length && validation.errors.length ? <FormFeedback type='invalid'>{validation.errors.length}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Width...'
                        id='width'
                        name='width'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.width || 0}
                        invalid={validation.touched.width && validation.errors.width ? true : false}
                      />
                      {validation.touched.width && validation.errors.width ? <FormFeedback type='invalid'>{validation.errors.width}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Height...'
                        id='height'
                        name='height'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.height || 0}
                        invalid={validation.touched.height && validation.errors.height ? true : false}
                      />
                      {validation.touched.height && validation.errors.height ? <FormFeedback type='invalid'>{validation.errors.height}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                </tr>
                <tr className='text-center'>
                  <td className='fw-semibold'>Master Box</td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Box Qty...'
                        id='boxQty'
                        name='boxQty'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.boxQty || 0}
                        invalid={validation.touched.boxQty && validation.errors.boxQty ? true : false}
                      />
                      {validation.touched.boxQty && validation.errors.boxQty ? <FormFeedback type='invalid'>{validation.errors.boxQty}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Box Weight...'
                        id='boxWeight'
                        name='boxWeight'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.boxWeight || 0}
                        invalid={validation.touched.boxWeight && validation.errors.boxWeight ? true : false}
                      />
                      {validation.touched.boxWeight && validation.errors.boxWeight ? <FormFeedback type='invalid'>{validation.errors.boxWeight}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Box Length...'
                        id='boxLength'
                        name='boxLength'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.boxLength || 0}
                        invalid={validation.touched.boxLength && validation.errors.boxLength ? true : false}
                      />
                      {validation.touched.boxLength && validation.errors.boxLength ? <FormFeedback type='invalid'>{validation.errors.boxLength}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Box Width...'
                        id='boxWidth'
                        name='boxWidth'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.boxWidth || 0}
                        invalid={validation.touched.boxWidth && validation.errors.boxWidth ? true : false}
                      />
                      {validation.touched.boxWidth && validation.errors.boxWidth ? <FormFeedback type='invalid'>{validation.errors.boxWidth}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        placeholder='Box Height...'
                        id='boxHeight'
                        name='boxHeight'
                        bsSize='sm'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.boxHeight || 0}
                        invalid={validation.touched.boxHeight && validation.errors.boxHeight ? true : false}
                      />
                      {validation.touched.boxHeight && validation.errors.boxHeight ? <FormFeedback type='invalid'>{validation.errors.boxHeight}</FormFeedback> : null}
                    </FormGroup>
                  </td>
                </tr>
              </tbody>
            </table>
            <Col md={12}>
              <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                <Button type='button' color='light' className='btn' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button type='submit' color='primary' className='btn'>
                  Save Changes
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </div>
  )
}

export default Measure_Product_Details
