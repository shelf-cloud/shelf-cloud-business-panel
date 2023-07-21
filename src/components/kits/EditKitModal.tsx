/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useState, useEffect, useContext } from 'react'
import { Button, Col, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import useSWR, { useSWRConfig } from 'swr'
import { Field, FieldArray, Formik, Form } from 'formik'

type Props = {}

function EditKitModal({}: Props) {
  const { mutate } = useSWRConfig()
  const { state, setShowEditKitModal }: any = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [skus, setSkus] = useState([])
  const [skusTitles, setSkusTitles] = useState<any>({})
  const [skuQuantities, setSkuQuantities] = useState<any>({})
  const [validSkus, setValidSkus] = useState<string[]>([])
  const [inValidSkus, setInValidSkus] = useState<string[]>([])
  const [duplicateSkus, setDuplicateSkus] = useState(false)
  const [initialValues, setinitialValues] = useState({
    kitId: '',
    businessId: '',
    title: '',
    sku: '',
    image: '',
    asin: '',
    fnsku: '',
    barcode: '',
    boxqty: '',
    note: '',
    children: [
      {
        sku: '',
        title: '',
        qty: 1,
      },
    ],
  })

  const validationSchema = Yup.object({
    title: Yup.string()
      .matches(/^[a-zA-Z0-9-Á-öø-ÿ\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(100, 'Title is to Long')
      .required('Please Enter Your Title'),
    sku: Yup.string()
      .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(50, 'SKU is to Long')
      .required('Please Enter Your Sku'),
    image: Yup.string().url(),
    asin: Yup.string().max(50, 'Asin is to Long'),
    fnsku: Yup.string().max(50, 'Fnsku is to Long'),
    boxqty: Yup.number().required('Please Enter Your Box Qty').positive('Value must be grater than 0').integer('Only integers'),
    barcode: Yup.string().max(50, 'barcode is to Long').required('Please Enter Your Barcode'),
    children: Yup.array()
      .of(
        Yup.object({
          sku: Yup.string()
            .oneOf(validSkus, 'Invalid SKU or There`s No Stock Available')
            .notOneOf(inValidSkus, 'There`s no Stock for this SKU')
            .required('Required SKU'),
          title: Yup.string().max(100, 'Name is to Long').required('Required Name'),
          qty: Yup.number().positive().integer('Qty must be an integer').min(1, 'Quantity must be greater than 0').required('Required Quantity'),
        })
      )
      .required('Must have products'),
  })

  const handleSubmit = async (values: any) => {
    const ChildrenSkus = (await values.children.map((child: any) => {
      return child.sku
    })) as String[]
    if (
      values.children.some((child: any) => {
        const count = ChildrenSkus.filter((sku) => sku == child.sku)
        if (count.length > 1) {
          return true
        } else {
          return false
        }
      })
    ) {
      setDuplicateSkus(true)
      return
    }
    setDuplicateSkus(false)
    const response = await axios.post(`api/updateKitDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutate(`/api/getBusinessKitsInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      setShowEditKitModal(false)
    } else {
      toast.error(response.data.msg)
    }
  }

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getSkus?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  useEffect(() => {
    if (data?.error) {
      setValidSkus([])
      setInValidSkus([])
      setSkus([])
      setSkusTitles({})
      setSkuQuantities({})
      // setReady(true)
      toast.error(data?.message)
    } else if (data) {
      setValidSkus(data.validSkus)
      setInValidSkus(data.invalidSkus)
      setSkus(data.skus)
      setSkusTitles(data.skuTitle)
      setSkuQuantities(data.skuQuantities)
      // setReady(true)
    }
    return () => {
      // setReady(false)
    }
  }, [data])

  useEffect(() => {
    const bringProductBins = async () => {
      const response = (await axios(
        `/api/getKitDetails?region=${state.currentRegion}&kitId=${state.modalKitDetails.kitId}&businessId=${state.user.businessId}`
      )) as any
      if (response?.error) {
        setLoading(false)
        toast.error(response.message)
      } else {
        setinitialValues(response.data)
        setLoading(false)
      }
    }
    bringProductBins()
    return () => {
      setLoading(true)
    }
  }, [state.currentRegion, state.user.businessId, state.modalKitDetails.kitId])

  return (
    <Modal
      size='xl'
      id='myModal'
      isOpen={state.showEditKitModal}
      toggle={() => {
        setShowEditKitModal(!state.showEditKitModal)
      }}>
      <ModalHeader
        toggle={() => {
          setShowEditKitModal(!state.showEditKitModal)
        }}>
        <h3 className='modal-title' id='myModalLabel'>
          Edit Kit
        </h3>
        {loading && <Spinner />}
      </ModalHeader>
      <ModalBody>
        {!loading && (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleSubmit(values)}>
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <Row>
                  <h5 className='fs-5 m-3 fw-bolder'>Kit Details</h5>
                  <Col md={6} className='d-none'>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='firstNameinput' className='form-label'>
                        *kitId
                      </Label>
                      <Input
                        disabled
                        type='number'
                        className='form-control'
                        id='kitId'
                        name='kitId'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.kitId || ''}
                        invalid={touched.kitId && errors.kitId ? true : false}
                      />
                      {touched.kitId && errors.kitId ? <FormFeedback type='invalid'>{errors.kitId}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={6} className='d-none'>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='firstNameinput' className='form-label'>
                        *BusinessId
                      </Label>
                      <Input
                        disabled
                        type='number'
                        className='form-control'
                        id='businessId'
                        name='businessId'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.businessId || ''}
                        invalid={touched.businessId && errors.businessId ? true : false}
                      />
                      {touched.businessId && errors.businessId ? <FormFeedback type='invalid'>{errors.businessId}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='firstNameinput' className='form-label'>
                        *Title
                      </Label>
                      <Input
                        type='text'
                        className='form-control'
                        placeholder='Title...'
                        id='title'
                        name='title'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.title || ''}
                        invalid={touched.title && errors.title ? true : false}
                      />
                      {touched.title && errors.title ? <FormFeedback type='invalid'>{errors.title}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='lastNameinput' className='form-label'>
                        *SKU
                      </Label>
                      <Input
                        disabled={true}
                        type='text'
                        className='form-control'
                        placeholder='Sku...'
                        id='sku'
                        name='sku'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.sku || ''}
                        invalid={touched.sku && errors.sku ? true : false}
                      />
                      {touched.sku && errors.sku ? <FormFeedback type='invalid'>{errors.sku}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='compnayNameinput' className='form-label'>
                        ASIN
                      </Label>
                      <Input
                        type='text'
                        className='form-control'
                        placeholder='Asin...'
                        id='asin'
                        name='asin'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.asin || ''}
                        invalid={touched.asin && errors.asin ? true : false}
                      />
                      {touched.asin && errors.asin ? <FormFeedback type='invalid'>{errors.asin}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='compnayNameinput' className='form-label'>
                        FNSKU
                      </Label>
                      <Input
                        type='text'
                        className='form-control'
                        placeholder='Fnsku...'
                        id='fnsku'
                        name='fnsku'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.fnsku || ''}
                        invalid={touched.fnsku && errors.fnsku ? true : false}
                      />
                      {touched.fnsku && errors.fnsku ? <FormFeedback type='invalid'>{errors.fnsku}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='compnayNameinput' className='form-label'>
                        Barcode
                      </Label>
                      <Input
                        disabled={true}
                        type='text'
                        className='form-control'
                        placeholder='Barcode...'
                        id='barcode'
                        name='barcode'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.barcode || ''}
                        invalid={touched.barcode && errors.barcode ? true : false}
                      />
                      {touched.barcode && errors.barcode ? <FormFeedback type='invalid'>{errors.barcode}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Row>
                    <Col md={9}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='lastNameinput' className='form-label'>
                          Product Image
                        </Label>
                        <Input
                          type='text'
                          className='form-control'
                          placeholder='Image URL...'
                          id='image'
                          name='image'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.image || ''}
                          invalid={touched.image && errors.image ? true : false}
                        />
                        {touched.image && errors.image ? <FormFeedback type='invalid'>{errors.image}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className='mb-3'>
                        <Label htmlFor='compnayNameinput' className='form-label'>
                          * Master Box Quantity
                        </Label>
                        <Input
                          type='number'
                          className='form-control'
                          placeholder='Box Qty...'
                          id='boxqty'
                          name='boxqty'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.boxqty || ''}
                          invalid={touched.boxqty && errors.boxqty ? true : false}
                        />
                        {touched.boxqty && errors.boxqty ? <FormFeedback type='invalid'>{errors.boxqty}</FormFeedback> : null}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Col md={12}>
                    <FormGroup className='mb-3'>
                      <Label htmlFor='lastNameinput' className='form-label'>
                        Product Note
                      </Label>
                      <Input
                        type='textarea'
                        className='form-control'
                        placeholder=''
                        id='note'
                        name='note'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.note || ''}
                        invalid={touched.note && errors.note ? true : false}
                      />
                      {touched.image && errors.image ? <FormFeedback type='invalid'>{errors.image}</FormFeedback> : null}
                    </FormGroup>
                  </Col>
                  <Row>
                    <h5 className='fs-5 m-3 mb-1 fw-bolder'>Kit Children</h5>
                    <Col xl={12} className='p-0 mt-1'>
                      <table className='table table-hover table-centered align-middle'>
                        <thead>
                          <tr>
                            <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>SKU</th>
                            <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>Title</th>
                            <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>Qty</th>
                            <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'></th>
                          </tr>
                        </thead>
                        <tbody>
                          <FieldArray name='children'>
                            {({ remove, push }) => (
                              <>
                                {values.children.map((_product, index) => (
                                  <tr key={index}>
                                    <td>
                                      <Field name={`children.${index}.sku`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='form-select'
                                              style={{
                                                padding: '0.2rem 0.9rem',
                                              }}
                                              name={`children.${index}.sku`}
                                              list='skuList'
                                              placeholder='Sku...'
                                              onChange={(e: any) => {
                                                handleChange(e)
                                                e.target.value == ''
                                                  ? (values.children[index].title = '')
                                                  : (values.children[index].title = skusTitles[e.target.value])
                                              }}
                                              // onChange={(e) => handleChangeInSKU(e.target.value, values, index)}
                                              onBlur={handleBlur}
                                              value={values.children[index].sku || ''}
                                              invalid={meta.touched && meta.error ? true : false}
                                            />
                                            {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                          </FormGroup>
                                        )}
                                      </Field>
                                      <datalist id='skuList'>
                                        {skus.map(
                                          (
                                            skus: {
                                              sku: string
                                              name: string
                                            },
                                            index
                                          ) => (
                                            <option key={`sku${index}`} value={skus.sku}>
                                              {skus.sku} / {skus.name}
                                            </option>
                                          )
                                        )}
                                      </datalist>
                                    </td>
                                    <td>
                                      <Field name={`children.${index}.title`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='form-control'
                                              style={{
                                                padding: '0.2rem 0.9rem',
                                              }}
                                              name={`children.${index}.title`}
                                              placeholder='Title...'
                                              list='skuNames'
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              value={values.children[index].title || ''}
                                              invalid={meta.touched && meta.error ? true : false}
                                            />
                                            {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                          </FormGroup>
                                        )}
                                      </Field>
                                      <datalist id='skuNames'>
                                        {skus.map(
                                          (
                                            skus: {
                                              name: string
                                            },
                                            index
                                          ) => (
                                            <option key={`skuName${index}`} value={skus.name} />
                                          )
                                        )}
                                      </datalist>
                                    </td>
                                    <td>
                                      <Field name={`children.${index}.qty`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='form-control'
                                              style={{
                                                padding: '0.2rem 0.9rem',
                                              }}
                                              name={`children.${index}.qty`}
                                              max={skuQuantities[values.children[index].sku]}
                                              placeholder='Qty...'
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              value={values.children[index].qty || ''}
                                              invalid={meta.touched && meta.error ? true : false}
                                            />
                                            {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                          </FormGroup>
                                        )}
                                      </Field>
                                    </td>
                                    <td>
                                      {index > 0 ? (
                                        <Row className='d-flex flex-row flex-nowrap justify-content-center gap-2 align-items-center mb-0'>
                                          <Button
                                            type='button'
                                            className='btn-icon btn-success'
                                            onClick={() =>
                                              push({
                                                sku: '',
                                                title: '',
                                                qty: 1,
                                              })
                                            }>
                                            <i className='fs-2 las la-plus-circle' />
                                          </Button>
                                          <Button
                                            type='button'
                                            className='btn-icon btn-danger'
                                            onClick={() => {
                                              remove(index)
                                            }}>
                                            <i className='fs-2 las la-minus-circle' />
                                          </Button>
                                        </Row>
                                      ) : (
                                        <Row className='d-flex flex-row flex-nowrap justify-content-center align-items-center mb-0'>
                                          <Button
                                            type='button'
                                            className='btn-icon btn-success'
                                            onClick={() =>
                                              push({
                                                sku: '',
                                                title: '',
                                                qty: 1,
                                              })
                                            }>
                                            <i className='fs-2 las la-plus-circle' />
                                          </Button>
                                        </Row>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            )}
                          </FieldArray>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                  {duplicateSkus && (
                    <p style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#f06548' }}>Duplicate SKUS in Children List</p>
                  )}
                  <h5 className='fs-14 mb-3 text-muted'>*You must complete all required fields or you will not be able to create your product.</h5>
                  <Col md={12}>
                    <div className='text-end'>
                      <Button type='submit' color='primary' className='btn'>
                        Save Changes
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        )}
      </ModalBody>
    </Modal>
  )
}

export default EditKitModal
