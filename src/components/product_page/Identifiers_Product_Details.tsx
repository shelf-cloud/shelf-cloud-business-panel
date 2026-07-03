import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Identifier } from '@typings'
import axios from 'axios'
import { Field, FieldArray, Form, Formik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { NativeSelect } from '@shadcn/ui/native-select'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

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

const Identifiers_Product_Details = ({ inventoryId, sku, upc, asin, fnsku, identifiers }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const { generate_new_forecast_products } = useRPNewForecast()

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
          .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
          .required('Insert Value'),
      })
    ),
  })

  const handleSubmit = async (values: any) => {
    setisLoading(true)
    const response = await axios.post(`/api/productDetails/identifiersProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
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
  }

  const handleShowEditFields = () => {
    setShowEditFields(true)
  }
  return (
    <div className='py-1 w-3/4'>
      {!showEditFields ? (
        <div className='flex flex-row justify-start items-start gap-4'>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
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
          <div className='text-right'>
            <i onClick={handleShowEditFields} className='ri-pencil-fill text-[16.25px] m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i>
          </div>
        </div>
      ) : (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
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
                      <div className='createOrder_inputs'>
                        <Input
                          disabled
                          type='text'
                          className='text-[13px] h-8 text-xs'
                          style={{ minWidth: '150px', padding: '0.2rem 0.9rem' }}
                          placeholder='Upc...'
                          id='upc'
                          name='upc'
                          value={upc || ''}
                        />
                      </div>
                    </td>
                  </tr>
                  <FieldArray name='identifiers'>
                    {({ remove, push }) => (
                      <>
                        <tr>
                          <td className='text-muted-foreground align-middle text-nowrap'>Additional Identifiers</td>
                          <td></td>
                          <td className='align-middle'>
                            <div className='flex flex-row flex-nowrap justify-center items-center mb-0 h-full'>
                              <i className='text-[26px] text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => push({ type: '', value: '' })} />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className='align-middle'>ASIN</td>
                          <td>
                            <div className='createOrder_inputs'>
                              <Input
                                type='text'
                                className='text-[13px] h-8 text-xs'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Asin...'
                                id='asin'
                                name='asin'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.asin || ''}
                                aria-invalid={(touched.asin && errors.asin ? true : false) || undefined}
                              />
                              {touched.asin && errors.asin ? <div className='text-sm text-destructive'>{errors.asin}</div> : null}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className='align-middle'>FNSKU</td>
                          <td>
                            <div className='createOrder_inputs'>
                              <Input
                                type='text'
                                className='text-[13px] h-8 text-xs'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='FNSKU...'
                                id='fnsku'
                                name='fnsku'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.fnsku || ''}
                                aria-invalid={(touched.fnsku && errors.fnsku ? true : false) || undefined}
                              />
                              {touched.fnsku && errors.fnsku ? <div className='text-sm text-destructive'>{errors.fnsku}</div> : null}
                            </div>
                          </td>
                        </tr>
                        {values.identifiers.map((_identifiers, index) => (
                          <tr key={index}>
                            <td>
                              <Field name={`identifiers.${index}.type`}>
                                {({ meta }: any) => (
                                  <div className='createOrder_inputs'>
                                    <NativeSelect
                                      disabled={!IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.modified}
                                      className='text-center align-middle text-[13px] h-8'
                                      style={{
                                        padding: '0.2rem 0.9rem',
                                      }}
                                      name={`identifiers.${index}.type`}
                                      size='sm'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.identifiers[index].type || ''}
                                      aria-invalid={(meta.touched && meta.error ? true : false) || undefined}>
                                      {Object.entries(IDENTIFIERS_TYPES).map(([_type, option]) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </NativeSelect>
                                    {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                  </div>
                                )}
                              </Field>
                            </td>
                            <td>
                              <Field name={`identifiers.${index}.value`}>
                                {({ meta }: any) => (
                                  <div className='createOrder_inputs'>
                                    <Input
                                      type='text'
                                      className='align-middle text-[13px] h-8 text-xs'
                                      disabled={!IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.modified}
                                      style={{
                                        padding: '0.2rem 0.9rem',
                                      }}
                                      name={`identifiers.${index}.value`}
                                      placeholder='Value...'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.identifiers[index].value || ''}
                                      aria-invalid={(meta.touched && meta.error ? true : false) || undefined}
                                    />
                                    {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                  </div>
                                )}
                              </Field>
                            </td>
                            <td className='align-middle'>
                              <div className='flex flex-row flex-nowrap justify-center gap-2 items-center mb-0 h-full'>
                                {IDENTIFIERS_TYPES[values.identifiers[index].type as keyof typeof IDENTIFIERS_TYPES].options.delete && (
                                  <i className='align-middle text-destructive text-[26px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
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
              <div className='px-3 w-full'>
                <div className='flex flex-row justify-end items-center gap-3'>
                  <Button disabled={isLoading} type='button' variant='light' onClick={() => setShowEditFields(false)}>
                    Cancel
                  </Button>
                  <Button disabled={isLoading} type='submit'>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default Identifiers_Product_Details
