import AppContext from '@context/AppContext'
import { Identifier } from '@typings'
import React, { useContext, useState } from 'react'
import * as Yup from 'yup'
import { Field, FieldArray, Formik, Form } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { Button, Col, FormFeedback, FormGroup, Input } from 'reactstrap'

type Props = {
  inventoryId?: number
  sku?: string
  upc?: string
  asin?: string
  fnsku?: string
  identifiers: Identifier[]
}

const Identifiers_Product_Details = ({ inventoryId, sku, upc, asin, fnsku, identifiers }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)

  const initialValues = {
    inventoryId,
    sku,
    asin,
    fnsku,
    identifiers: identifiers.length > 0 ? identifiers : [],
  }
  const validationSchema = Yup.object({
    asin: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Asin is to Long'),
    fnsku: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'FNSKU is to Long'),
    identifiers: Yup.array().of(
      Yup.object({
        type: Yup.string().required('Select Type'),
        value: Yup.string()
          .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
          .required('Insert Value'),
      })
    ),
  })
  const handleSubmit = async (values: any) => {
    console.log(values)
    const response = await axios.post(`/api/productDetails/identifiersProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      setShowEditFields(false)
    } else {
      toast.error(response.data.msg)
    }
  }
  const handleShowEditFields = () => {
    setShowEditFields(true)
  }
  return (
    <div className='py-1 w-75'>
      {!showEditFields ? (
        <div className='d-flex flex-row justify-content-start align-items-top gap-4'>
          <table className='table table-sm'>
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {upc && (
                <tr>
                  <td>UPC</td>
                  <td>{upc}</td>
                </tr>
              )}
              {asin && (
                <tr>
                  <td>ASIN</td>
                  <td>{asin}</td>
                </tr>
              )}
              {fnsku && (
                <tr>
                  <td>FNSKU</td>
                  <td>{fnsku}</td>
                </tr>
              )}
              {identifiers.length > 0 &&
                identifiers.map((identifier) => (
                  <tr key={identifier.value}>
                    <td>{identifier.type}</td>
                    <td>{identifier.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className='text-end'>
            <i onClick={handleShowEditFields} className='ri-pencil-fill fs-4 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i>
          </div>
        </div>
      ) : (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <table className='table table-sm'>
                <thead>
                  <tr className='text-center'>
                    <th>Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody className='text-center'>
                  <tr>
                    <td className='align-middle'>UPC</td>
                    <td>
                      <FormGroup className='createOrder_inputs'>
                        <Input
                          disabled
                          type='text'
                          className='form-control fs-6'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Upc...'
                          id='upc'
                          name='upc'
                          bsSize='sm'
                          value={upc || ''}
                        />
                      </FormGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className='align-middle'>ASIN</td>
                    <td>
                      <FormGroup className='createOrder_inputs'>
                        <Input
                          type='text'
                          className='form-control fs-6'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Asin...'
                          id='asin'
                          name='asin'
                          bsSize='sm'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.asin || ''}
                          invalid={touched.asin && errors.asin ? true : false}
                        />
                        {touched.asin && errors.asin ? <FormFeedback type='invalid'>{errors.asin}</FormFeedback> : null}
                      </FormGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className='align-middle'>FNSKU</td>
                    <td>
                      <FormGroup className='createOrder_inputs'>
                        <Input
                          type='text'
                          className='form-control fs-6'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='FNSKU...'
                          id='fnsku'
                          name='fnsku'
                          bsSize='sm'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.fnsku || ''}
                          invalid={touched.fnsku && errors.fnsku ? true : false}
                        />
                        {touched.fnsku && errors.fnsku ? <FormFeedback type='invalid'>{errors.fnsku}</FormFeedback> : null}
                      </FormGroup>
                    </td>
                  </tr>

                  <FieldArray name='identifiers'>
                    {({ remove, push }) => (
                      <>
                        <tr>
                          <td className='text-muted align-middle'>Additional Identifiers</td>
                          <td></td>
                          <td className='align-middle'>
                            <div className='d-flex flex-row flex-nowrap justify-content-center align-items-center mb-0 h-100'>
                              <i className='fs-2 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => push({ type: '', value: '' })} />
                            </div>
                          </td>
                        </tr>
                        {values.identifiers.map((_identifiers, index) => (
                          <tr key={index}>
                            <td>
                              <Field name={`identifiers.${index}.type`}>
                                {({ meta }: any) => (
                                  <FormGroup className='createOrder_inputs'>
                                    <Input
                                      type='select'
                                      className='form-select text-center align-middle fs-6'
                                      style={{
                                        padding: '0.2rem 0.9rem',
                                      }}
                                      name={`identifiers.${index}.type`}
                                      bsSize='sm'
                                      placeholder='Type...'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.identifiers[index].type || ''}
                                      invalid={meta.touched && meta.error ? true : false}>
                                      <option value={''}>Select Type...</option>
                                      <option value={'EAN'}>EAN</option>
                                      <option value={'Barcode'}>Barcode</option>
                                      <option value={'WalmartCode'}>Walmart Code</option>
                                      <option value={'Other'}>Other</option>
                                    </Input>
                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                  </FormGroup>
                                )}
                              </Field>
                            </td>
                            <td>
                              <Field name={`identifiers.${index}.value`}>
                                {({ meta }: any) => (
                                  <FormGroup className='createOrder_inputs'>
                                    <Input
                                      type='text'
                                      className='form-control align-middle fs-6'
                                      style={{
                                        padding: '0.2rem 0.9rem',
                                      }}
                                      bsSize='sm'
                                      name={`identifiers.${index}.value`}
                                      placeholder='Value...'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.identifiers[index].value || ''}
                                      invalid={meta.touched && meta.error ? true : false}
                                    />
                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                  </FormGroup>
                                )}
                              </Field>
                            </td>
                            <td className='align-middle'>
                              <div className='d-flex flex-row flex-nowrap justify-content-center gap-2 align-items-center mb-0 h-100'>
                                <i className='align-middle text-danger fs-2 las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </FieldArray>
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
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default Identifiers_Product_Details
