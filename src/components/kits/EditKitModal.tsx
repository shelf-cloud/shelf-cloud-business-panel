 
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import { useContext, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { useCreateKit } from '@hooks/kits/useCreateKit'
import axios from 'axios'
import { Field, FieldArray, Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
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
    <Dialog
      open={!!state.showEditKitModal}
      onOpenChange={(open) => {
        if (!open) setShowEditKitModal(!state.showEditKitModal)
      }}>
      <DialogContent id='EditKitModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle>
            Edit Kit: <span className='text-primary'>{state.modalKitDetails.sku}</span>
          </DialogTitle>
        </DialogHeader>
        <div>
        {!isLoading && !isValidating ? (
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <Form>
                <div className='flex flex-wrap -mx-3'>
                  <h4 className='text-[16.25px] mb-4 font-extrabold'>Kit Details</h4>
                  <div className='px-3 md:w-6/12 hidden'>
                    <div className='mb-3'>
                      <Label htmlFor='kitId' className='mb-1'>
                        *kitId
                      </Label>
                      <Input
                        disabled
                        type='number'
                        className='text-[13px]'
                        id='kitId'
                        name='kitId'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.kitId || ''}
                        aria-invalid={touched.kitId && errors.kitId ? true : false || undefined}
                      />
                      {touched.kitId && errors.kitId ? <div className='text-sm text-destructive'>{errors.kitId}</div> : null}
                    </div>
                  </div>
                  <div className='px-3 md:w-6/12'>
                    <div className='mb-3'>
                      <Label htmlFor='title' className='mb-1'>
                        *Title
                      </Label>
                      <Input
                        type='text'
                        className='text-[13px]'
                        placeholder='Title...'
                        id='title'
                        name='title'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.title || ''}
                        aria-invalid={touched.title && errors.title ? true : false || undefined}
                      />
                      {touched.title && errors.title ? <div className='text-sm text-destructive'>{errors.title}</div> : null}
                    </div>
                  </div>
                  <div className='px-3 md:w-6/12'>
                    <div className='mb-3'>
                      <Label htmlFor='sku' className='mb-1'>
                        *SKU
                      </Label>
                      <Input
                        type='text'
                        className='text-[13px]'
                        placeholder='Sku...'
                        id='sku'
                        name='sku'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.sku || ''}
                        aria-invalid={touched.sku && errors.sku ? true : false || undefined}
                      />
                      {touched.sku && errors.sku ? <div className='text-sm text-destructive'>{errors.sku}</div> : null}
                    </div>
                  </div>
                  <div className='px-3 md:w-4/12'>
                    <div className='mb-3'>
                      <Label htmlFor='asin' className='mb-1'>
                        ASIN
                      </Label>
                      <Input
                        type='text'
                        className='text-[13px]'
                        placeholder='Asin...'
                        id='asin'
                        name='asin'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.asin || ''}
                        aria-invalid={touched.asin && errors.asin ? true : false || undefined}
                      />
                      {touched.asin && errors.asin ? <div className='text-sm text-destructive'>{errors.asin}</div> : null}
                    </div>
                  </div>
                  <div className='px-3 md:w-4/12'>
                    <div className='mb-3'>
                      <Label htmlFor='fnsku' className='mb-1'>
                        FNSKU
                      </Label>
                      <Input
                        type='text'
                        className='text-[13px]'
                        placeholder='Fnsku...'
                        id='fnsku'
                        name='fnsku'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.fnsku || ''}
                        aria-invalid={touched.fnsku && errors.fnsku ? true : false || undefined}
                      />
                      {touched.fnsku && errors.fnsku ? <div className='text-sm text-destructive'>{errors.fnsku}</div> : null}
                    </div>
                  </div>
                  <div className='px-3 md:w-4/12'>
                    <div className='mb-3'>
                      <Label htmlFor='barcode' className='mb-1'>
                        UPC / Barcode
                      </Label>
                      <Input
                        type='text'
                        className='text-[13px]'
                        placeholder='Barcode...'
                        id='barcode'
                        name='barcode'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.barcode || ''}
                        aria-invalid={touched.barcode && errors.barcode ? true : false || undefined}
                      />
                      {touched.barcode && errors.barcode ? <div className='text-sm text-destructive'>{errors.barcode}</div> : null}
                    </div>
                  </div>
                  <div className='flex flex-wrap -mx-3'>
                    <div className='px-3 md:w-9/12'>
                      <div className='mb-3'>
                        <Label htmlFor='image' className='mb-1'>
                          Product Image
                        </Label>
                        <Input
                          type='text'
                          className='text-[13px]'
                          placeholder='Image URL...'
                          id='image'
                          name='image'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.image || ''}
                          aria-invalid={touched.image && errors.image ? true : false || undefined}
                        />
                        {touched.image && errors.image ? <div className='text-sm text-destructive'>{errors.image}</div> : null}
                      </div>
                    </div>
                    <div className='px-3 md:w-3/12'>
                      <div className='mb-3'>
                        <Label htmlFor='boxqty' className='mb-1'>
                          *Master Box Quantity
                        </Label>
                        <Input
                          type='number'
                          className='text-[13px]'
                          placeholder='Box Qty...'
                          id='boxqty'
                          name='boxqty'
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.boxqty || ''}
                          aria-invalid={touched.boxqty && errors.boxqty ? true : false || undefined}
                        />
                        {touched.boxqty && errors.boxqty ? <div className='text-sm text-destructive'>{errors.boxqty}</div> : null}
                      </div>
                    </div>
                  </div>
                  <div className='px-3 md:w-full'>
                    <div className='mb-3'>
                      <Label htmlFor='note' className='mb-1'>
                        Kit Note
                      </Label>
                      <Input
                        type='textarea'
                        className='text-[13px]'
                        placeholder=''
                        id='note'
                        name='note'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.note || ''}
                        aria-invalid={touched.note && errors.note ? true : false || undefined}
                      />
                      {touched.image && errors.image ? <div className='text-sm text-destructive'>{errors.image}</div> : null}
                    </div>
                  </div>
                  <div className='flex flex-wrap -mx-3'>
                    <h5 className='text-[16.25px] mb-1 font-extrabold'>Kit Children</h5>
                    <div className='px-3 xl:w-full p-0 mt-1'>
                      <table className='table table-hover align-middle table-nowrap'>
                        <thead>
                          <tr>
                            <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'></th>
                            <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
                              SKU
                            </th>
                            <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
                              Title
                            </th>
                            <th scope='col' className='py-1 m-0 font-semibold text-center bg-primary text-white'>
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
                                    <td style={{ minWidth: '50px' }}>
                                      {index > 0 ? (
                                        <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
                                          <i
                                            className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
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
                                          <i className='text-danger text-[22.75px] las la-minus-circle m-0 p-0 w-auto' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                        </div>
                                      ) : (
                                        <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
                                          <i
                                            className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
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
                                        </div>
                                      )}
                                    </td>
                                    <td style={{ minWidth: '200px' }}>
                                      <Field name={`children.${index}.sku`}>
                                        {({ meta }: any) => (
                                          <div className='mb-3 createOrder_inputs'>
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
                                          </div>
                                        )}
                                      </Field>
                                    </td>
                                    <td style={{ minWidth: '200px' }}>
                                      <Field name={`children.${index}.title`}>
                                        {({ meta }: any) => (
                                          <div className='mb-3 createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='text-[13px]'
                                              name={`children.${index}.title`}
                                              placeholder='Title...'
                                              readOnly
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              value={values.children[index].title || ''}
                                              aria-invalid={meta.touched && meta.error ? true : false || undefined}
                                            />
                                            {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                          </div>
                                        )}
                                      </Field>
                                    </td>
                                    <td style={{ minWidth: '80px' }}>
                                      <Field name={`children.${index}.qty`}>
                                        {({ meta }: any) => (
                                          <div className='mb-3 createOrder_inputs'>
                                            <Input
                                              type='text'
                                              className='text-center text-[13px]'
                                              name={`children.${index}.qty`}
                                              placeholder='Qty...'
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              value={values.children[index].qty || ''}
                                              aria-invalid={meta.touched && meta.error ? true : false || undefined}
                                            />
                                            {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                          </div>
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
                    </div>
                  </div>
                  <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>*You must complete all required fields or you will not be able to create your product.</p>
                  <div className='px-3 md:w-full'>
                    <div className='text-right flex gap-4 justify-end items-center'>
                      <Button variant='light' onClick={() => setShowEditKitModal(!state.showEditKitModal)}>
                        Cancel
                      </Button>
                      <Button type='submit' disabled={updatingKit} className='text-[11.2px]'>
                        {updatingKit ? (
                          <span className='flex items-center gap-2'>
                            <Spinner className='text-white' /> Updating...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <p className='w-full text-center flex items-center justify-center gap-4 text-[13px]'>
            <Spinner className='size-6 text-primary' /> <span className='text-[16.25px] font-normal'>Loading kit details...</span>
          </p>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditKitModal
