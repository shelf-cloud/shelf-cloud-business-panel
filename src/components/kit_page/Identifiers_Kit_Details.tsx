import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Identifier } from '@typings'
import axios from 'axios'
import { Field, FieldArray, Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, FormFeedback, FormGroup, Input } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  inventoryId?: number
  sku?: string
  upc?: string
  asin?: string
  fnsku?: string
  identifiers: Identifier[]
}

const IDENTIFIERS_TYPES = {
  '': { value: '', label: 'Select Type', options: { modified: true, delete: true } },
  EAN: { value: 'EAN', label: 'EAN', options: { modified: true, delete: true } },
  Barcode: { value: 'Barcode', label: 'Barcode', options: { modified: true, delete: true } },
  WalmartCode: { value: 'WalmartCode', label: 'Walmart Code', options: { modified: true, delete: true } },
  Other: { value: 'Other', label: 'Other', options: { modified: true, delete: true } },
  FBA: { value: 'FBA', label: 'FBA', options: { modified: false, delete: false } },
}

const Identifiers_Kit_Details = ({ inventoryId, sku, upc, asin, fnsku, identifiers }: Props) => {
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
  // const handleShowEditFields = () => {
  //   setShowEditFields(true)
  // }
  return (
    <div className='tw:py-1 tw:w-3/4'>
      {!showEditFields ? (
        <div className='tw:flex tw:flex-row tw:justify-start tw:items-start tw:gap-4'>
          <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
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
          <div className='tw:text-right'>{/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}</div>
        </div>
      ) : (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                <thead>
                  <tr className='tw:text-center'>
                    <th>Type</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody className='tw:text-center'>
                  <tr>
                    <td className='tw:align-middle'>UPC</td>
                    <td>
                      <FormGroup className='createOrder_inputs'>
                        <Input
                          disabled
                          type='text'
                          className='tw:text-[13px]'
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
                  <FieldArray name='identifiers'>
                    {({ remove, push }) => (
                      <>
                        <tr>
                          <td className='tw:text-[color:var(--bs-secondary-color)] tw:align-middle tw:text-nowrap'>Additional Identifiers</td>
                          <td></td>
                          <td className='tw:align-middle'>
                            <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-center tw:items-center tw:mb-0 tw:h-full'>
                              <i className='tw:text-[26px] tw:text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => push({ type: '', value: '' })} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className='tw:align-middle'>ASIN</td>
                          <td>
                            <FormGroup className='createOrder_inputs'>
                              <Input
                                type='text'
                                className='tw:text-[13px]'
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
                          <td className='tw:align-middle'>FNSKU</td>
                          <td>
                            <FormGroup className='createOrder_inputs'>
                              <Input
                                type='text'
                                className='tw:text-[13px]'
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
                        {values.identifiers.map((_identifiers, index) => (
                          <tr key={index}>
                            <td>
                              <Field name={`identifiers.${index}.type`}>
                                {({ meta }: any) => (
                                  <FormGroup className='createOrder_inputs'>
                                    <Input
                                      type='select'
                                      disabled={!IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.modified}
                                      className='tw:text-center tw:align-middle tw:text-[13px]'
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
                                      {Object.entries(IDENTIFIERS_TYPES).map(([_type, option]) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
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
                                      className='tw:align-middle tw:text-[13px]'
                                      disabled={!IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.modified}
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
                            <td className='tw:align-middle'>
                              <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-center tw:gap-2 tw:items-center tw:mb-0 tw:h-full'>
                                {IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.delete && (
                                  <i className='tw:align-middle tw:text-danger tw:text-[26px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                )}
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
                <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-3'>
                  <Button type='button' color='light' onClick={() => setShowEditFields(false)}>
                    Cancel
                  </Button>
                  <Button type='submit' color='primary'>
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

export default Identifiers_Kit_Details
