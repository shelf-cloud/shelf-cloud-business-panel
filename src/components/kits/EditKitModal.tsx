 
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import { useContext, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { useCreateKit } from '@hooks/kits/useCreateKit'
import axios from 'axios'
import { Field, FieldArray, Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import useSWR from 'swr'
import * as Yup from 'yup'

interface EditKitDetails {
  kitId: number
  businessId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnsku: string
  boxqty: number
  note: string
  children: KitChildren[]
}

interface KitChildren {
  qty: string
  sku: string
  title: string
  inventoryId: number
}

type EditKitResponse = EditKitDetails

type Props = {
  mutateKits: () => void
}

const fetcher = async (endPoint: string) => axios.get<EditKitResponse>(endPoint).then((res) => res.data)

function EditKitModal({ mutateKits }: Props) {
  const { state, setShowEditKitModal } = useContext(AppContext)
  const { skus, validSkus, skuInfo, isLoading } = useCreateKit()
  const [updatingKit, setUpdatingKit] = useState(false)

  const { data, isValidating } = useSWR(
    state.user.businessId ? `/api/kits/getKitDetails?region=${state.currentRegion}&kitId=${state.modalKitDetails.kitId}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  const initialValues = data
    ? data
    : {
        kitId: '',
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
            inventoryId: 0,
          },
        ],
      }

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
          sku: Yup.string().oneOf(validSkus, 'Invalid SKU').required('Required SKU'),
          title: Yup.string().max(100, 'Name is to Long').required('Required Name'),
          qty: Yup.number().positive().integer('Qty must be an integer').min(1, 'Quantity must be greater than 0').required('Required Quantity'),
        })
      )
      .required('Must have products'),
  })

  const handleSubmit = async (values: any) => {
    setUpdatingKit(true)
    const updatingKit = toast.loading('Updating Kit...')

    const ChildrenSkus: String[] = await values.children.map((child: any) => {
      return child.sku
    })

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
      toast.update(updatingKit, {
        render: 'Duplicate SKUs found in Children List',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      return
    }

    const { data } = await axios.post(`/api/kits/updateKitDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!data.error) {
      toast.update(updatingKit, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutateKits()
      setShowEditKitModal(false)
    } else {
      toast.update(updatingKit, {
        render: data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setUpdatingKit(false)
  }

  return (
    <Modal
      size='xl'
      id='EditKitModal'
      isOpen={state.showEditKitModal}
      toggle={() => {
        setShowEditKitModal(!state.showEditKitModal)
      }}>
      <ModalHeader
        toggle={() => {
          setShowEditKitModal(!state.showEditKitModal)
        }}>
        Edit Kit: <span className='text-primary'>{state.modalKitDetails.sku}</span>
      </ModalHeader>
      <ModalBody>
        {!isLoading && !isValidating ? (
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <Form>
                <Row>
                  <h4 className='fs-5 mb-3 fw-bolder'>Kit Details</h4>
                  <Col md={6} className='d-none'>
                    <FormGroup>
                      <Label htmlFor='kitId' className='form-label mb-1'>
                        *kitId
                      </Label>
                      <Input
                        disabled
                        type='number'
                        className='form-control form-control-sm fs-6'
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
                  <Col md={6}>
                    <FormGroup>
                      <Label htmlFor='title' className='form-label mb-1'>
                        *Title
                      </Label>
                      <Input
                        type='text'
                        className='form-control form-control-sm fs-6'
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
                    <FormGroup>
                      <Label htmlFor='sku' className='form-label mb-1'>
                        *SKU
                      </Label>
                      <Input
                        type='text'
                        className='form-control form-control-sm fs-6'
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
                    <FormGroup>
                      <Label htmlFor='asin' className='form-label mb-1'>
                        ASIN
                      </Label>
                      <Input
                        type='text'
                        className='form-control form-control-sm fs-6'
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
                    <FormGroup>
                      <Label htmlFor='fnsku' className='form-label mb-1'>
                        FNSKU
                      </Label>
                      <Input
                        type='text'
                        className='form-control form-control-sm fs-6'
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
                    <FormGroup>
                      <Label htmlFor='barcode' className='form-label mb-1'>
                        UPC / Barcode
                      </Label>
                      <Input
                        type='text'
                        className='form-control form-control-sm fs-6'
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
                      <FormGroup>
                        <Label htmlFor='image' className='form-label mb-1'>
                          Product Image
                        </Label>
                        <Input
                          type='text'
                          className='form-control form-control-sm fs-6'
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
                      <FormGroup>
                        <Label htmlFor='boxqty' className='form-label mb-1'>
                          *Master Box Quantity
                        </Label>
                        <Input
                          type='number'
                          className='form-control form-control-sm fs-6'
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
                    <FormGroup>
                      <Label htmlFor='note' className='form-label mb-1'>
                        Kit Note
                      </Label>
                      <Input
                        type='textarea'
                        className='form-control form-control-sm fs-6'
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
                    <h5 className='fs-5 mb-1 fw-bolder'>Kit Children</h5>
                    <Col xl={12} className='p-0 mt-1'>
                      <table className='table table-hover align-middle table-nowrap'>
                        <thead>
                          <tr>
                            <th scope='col' className='py-1 m-0 fw-semibold text-center bg-primary text-white'></th>
                            <th scope='col' className='py-1 m-0 fw-semibold text-center bg-primary text-white'>
                              SKU
                            </th>
                            <th scope='col' className='py-1 m-0 fw-semibold text-center bg-primary text-white'>
                              Title
                            </th>
                            <th scope='col' className='py-1 m-0 fw-semibold text-center bg-primary text-white'>
                              Qty
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <FieldArray name='children'>
                            {({ remove, push }) => (
                              <>
                                {values.children.map((_product, index) => (
                                  <tr key={index}>
                                    <td className='col-1' style={{ minWidth: '50px' }}>
                                      {index > 0 ? (
                                        <Row className='w-100 d-flex flex-row flex-nowrap justify-content-center gap-1 align-items-center mb-0'>
                                          <i
                                            className='fs-3 text-success las la-plus-circle m-0 p-0 w-auto'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() =>
                                              push({
                                                sku: '',
                                                title: '',
                                                qty: 1,
                                                inventoryId: 0,
                                              })
                                            }
                                          />
                                          <i className='text-danger fs-3 las la-minus-circle m-0 p-0 w-auto' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                        </Row>
                                      ) : (
                                        <Row className='w-100 d-flex flex-row flex-nowrap justify-content-center gap-0 align-items-center mb-0'>
                                          <i
                                            className='fs-3 text-success las la-plus-circle m-0 p-0 w-auto'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() =>
                                              push({
                                                sku: '',
                                                title: '',
                                                qty: 1,
                                                inventoryId: 0,
                                              })
                                            }
                                          />
                                        </Row>
                                      )}
                                    </td>
                                    <td className='col-12 col-md-4' style={{ minWidth: '200px' }}>
                                      <Field name={`children.${index}.sku`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <SimpleSelect
                                              selected={{ label: values.children[index].sku, value: values.children[index].sku }}
                                              options={skus.map((sku) => ({ label: sku.sku, value: sku.sku, description: sku.title }))}
                                              handleSelect={(option: any) => {
                                                if (!option) {
                                                  setFieldValue(`children.${index}.sku`, '')
                                                  setFieldValue(`children.${index}.title`, '')
                                                  setFieldValue(`children.${index}.inventoryId`, 0)
                                                  return
                                                }
                                                setFieldValue(`children.${index}.sku`, option.value)
                                                setFieldValue(`children.${index}.title`, skuInfo[option.value].title)
                                                setFieldValue(`children.${index}.inventoryId`, skuInfo[option.value].inventoryId)
                                              }}
                                              placeholder='Select SKU...'
                                              customStyle='sm'
                                              hasError={meta.error ? true : false}
                                              isClearable
                                            />
                                            {meta.error ? <ErrorInputLabel error={meta.error} marginTop='mt-0' /> : null}
                                          </FormGroup>
                                        )}
                                      </Field>
                                    </td>
                                    <td className='col-12 col-md-5' style={{ minWidth: '200px' }}>
                                      <Field name={`children.${index}.title`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='form-control form-control-sm fs-6'
                                              name={`children.${index}.title`}
                                              placeholder='Title...'
                                              readOnly
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              value={values.children[index].title || ''}
                                              invalid={meta.touched && meta.error ? true : false}
                                            />
                                            {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                          </FormGroup>
                                        )}
                                      </Field>
                                    </td>
                                    <td className='col-12 col-md-1' style={{ minWidth: '80px' }}>
                                      <Field name={`children.${index}.qty`}>
                                        {({ meta }: any) => (
                                          <FormGroup className='createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='text-center form-control form-control-sm fs-6'
                                              name={`children.${index}.qty`}
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
                                  </tr>
                                ))}
                              </>
                            )}
                          </FieldArray>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                  <p className='fs-7 text-muted'>*You must complete all required fields or you will not be able to create your product.</p>
                  <Col md={12}>
                    <div className='text-end d-flex gap-3 justify-content-end align-items-center'>
                      <Button color='light' onClick={() => setShowEditKitModal(!state.showEditKitModal)}>
                        Cancel
                      </Button>
                      <Button type='submit' disabled={updatingKit} color='primary' className='fs-7'>
                        {updatingKit ? (
                          <span className='d-flex align-items-center gap-2'>
                            <Spinner color='light' size={'sm'} /> Updating...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        ) : (
          <p className='w-full text-center d-flex align-items-center justify-content-center gap-3 fs-6'>
            <Spinner color='primary' /> <span className='fs-5 fw-normal'>Loading kit details...</span>
          </p>
        )}
      </ModalBody>
    </Modal>
  )
}

export default EditKitModal
