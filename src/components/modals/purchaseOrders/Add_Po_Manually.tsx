import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { useSuppliers } from '@hooks/suppliers/useSuppliers'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import axios from 'axios'
import { Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  orderNumberStart: string
}
type Supplier = {
  suppliersId: number
  name: string
}
const Add_Po_Manually = ({ orderNumberStart }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setShowCreatePoManually }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const { suppliers } = useSuppliers()
  const { warehouses, isLoading } = useWarehouses()

  const initialValues = {
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    destinationSC: { value: '', label: 'Select ...' },
    supplier: '',
    date: '',
  }

  const validationSchema = Yup.object({
    orderNumber: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Order Number is to Long')
      .required('Required Order Number'),
    destinationSC: Yup.object().shape({
      value: Yup.number().when([], {
        is: () => !false,
        then: Yup.number().required('Destination Required'),
      }),
    }),
    supplier: Yup.string().required('Required Supplier'),
    date: Yup.date().required('Required Date'),
  })

  const handleSubmit = async (values: any) => {
    setLoading(true)

    const hasSplitting = false
    const selectedWarehouse = warehouses.find((w) => w.warehouseId === parseInt(values.destinationSC.value))

    const response = await axios.post(`/api/purchaseOrders/addPoManually?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      ...values,
      destinationSC: hasSplitting ? 0 : warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
      warehouseId: hasSplitting ? 0 : parseInt(values.destinationSC.value),
      name3PL: hasSplitting ? null : selectedWarehouse?.name3PL,
    })

    if (!response.data.error) {
      mutate('/api/getuser')
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      setShowCreatePoManually(false)
    } else {
      toast.error('There were some errors creating Purchase Order.')
    }
    setLoading(false)
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='addPoFromFile'
      isOpen={state.showCreatePoManually}
      toggle={() => {
        setShowCreatePoManually(!state.showCreatePoManually)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreatePoManually(!state.showCreatePoManually)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create New Purchase Order
      </ModalHeader>
      <ModalBody>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Row>
                <Col md={6}>
                  <FormGroup className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Purchase Order Number
                    </Label>
                    <div className='input-group'>
                      <span className='input-group-text fw-semibold fs-5 m-0 px-2 py-0' id='basic-addon1'>
                        {orderNumberStart}
                      </span>
                      <Input
                        type='text'
                        className='form-control fs-6'
                        id='orderNumber'
                        name='orderNumber'
                        bsSize='sm'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.orderNumber || ''}
                        invalid={touched.orderNumber && errors.orderNumber ? true : false}
                      />
                      {touched.orderNumber && errors.orderNumber ? <FormFeedback type='invalid'>{errors.orderNumber}</FormFeedback> : null}
                    </div>
                  </FormGroup>
                  <SelectSingleFilter
                    inputLabel={'*Supplier'}
                    inputName={'supplier'}
                    placeholder={'Select ...'}
                    selected={{ value: values.supplier, label: suppliers?.find((supplier: Supplier) => supplier.suppliersId == parseInt(values.supplier))?.name || 'Select...' }}
                    options={suppliers?.map((supplier: Supplier) => ({ value: supplier.suppliersId, label: supplier.name })) || [{ value: '', label: '' }]}
                    handleSelect={(option: SelectSingleValueType) => {
                      handleChange({ target: { name: 'supplier', value: option!.value } })
                    }}
                    error={errors.supplier}
                  />
                </Col>
                <Col md={6} className='py-1'>
                  <div className='mb-2'>
                    <Label className='form-label mb-1 fs-7'>*Destination</Label>
                    <SimpleSelect
                      options={warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []}
                      selected={values.destinationSC}
                      handleSelect={(selected) => {
                        handleChange({ target: { name: 'destinationSC', value: selected } })
                      }}
                      placeholder={isLoading ? 'Loading...' : 'Select ...'}
                      customStyle='sm'
                    />
                    {errors.destinationSC && touched.destinationSC ? <div className='m-0 p-0 text-danger fs-7'>*{errors.destinationSC.value}</div> : null}
                  </div>

                  <FormGroup className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label mb-1 fs-7'>
                      *Date
                    </Label>
                    <Input
                      type='date'
                      className='form-control fs-6'
                      bsSize='sm'
                      id='date'
                      name='date'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.date || ''}
                      invalid={touched.date && errors.date ? true : false}
                    />
                    {touched.date && errors.date ? <FormFeedback type='invalid'>{errors.date}</FormFeedback> : null}
                  </FormGroup>
                </Col>
              </Row>

              <Col md={12} className='mt-4'>
                <div className='text-end'>
                  <Button disabled={loading} type='submit' color='success' className='fs-7'>
                    {loading ? (
                      <span>
                        <Spinner color='light' size={'sm'} /> Creating...
                      </span>
                    ) : (
                      'Create PO'
                    )}
                  </Button>
                </div>
              </Col>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  )
}

export default Add_Po_Manually
