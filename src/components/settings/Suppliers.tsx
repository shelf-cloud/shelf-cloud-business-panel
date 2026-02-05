import { useContext, useEffect, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import useSWR from 'swr'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {}

type Supplier = {
  suppliersId: number
  businessId: number
  name: string
  email: string
  phone: string
  address: string
  country: string
}

const Suppliers = ({}: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`, fetcher)
  const loading = !data
  const suppliers = useMemo(() => {
    if (data?.error) return [] as Supplier[]
    return (data?.suppliers ?? []) as Supplier[]
  }, [data])
  const validCountries = useMemo(() => {
    if (data?.error) return [] as string[]
    return (data?.validCountries ?? []) as string[]
  }, [data])
  const countries = useMemo(() => {
    if (data?.error) return [] as { name: string; code: string }[]
    return (data?.countries ?? []) as { name: string; code: string }[]
  }, [data])
  const [showAddNewFields, setShowAddNewFields] = useState(false)
  const [showEditFields, setShowEditFields] = useState(false)
  useEffect(() => {
    if (data?.error) {
      toast.error(data?.message)
    }
  }, [data])

  // ADD NEW SUPPLIER
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
      email: Yup.string().email(),
      phone: Yup.string(),
      address: Yup.string(),
      country: Yup.string().oneOf(validCountries, 'Must be a Valid Country Code'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/addNewSupplier?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.message)
        resetForm()
        mutate(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.message)
      }
    },
  })
  const handleAddSupplier = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }
  const handleShowAddSupplier = () => {
    setShowAddNewFields(true)
    setShowEditFields(false)
  }
  const handleCancelShowAddSupplier = () => {
    setShowAddNewFields(false)
    setShowEditFields(false)
  }

  // EDIT CURRENT SUPPLIER
  const validationEdit = useFormik({
    enableReinitialize: true,
    initialValues: {
      suppliersId: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
      email: Yup.string().email(),
      phone: Yup.string(),
      address: Yup.string(),
      country: Yup.string().oneOf(validCountries, 'Must be a Valid Country Code'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/updateSupplier?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        setShowEditFields(false)
        mutate(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    },
  })
  const handleEditSupplier = (event: any) => {
    event.preventDefault()
    validationEdit.handleSubmit()
  }
  const handleShowEditFields = (supplier: Supplier) => {
    validationEdit.setValues(supplier)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }
  const handleCancelEdit = () => {
    validationEdit.setValues({
      suppliersId: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    })
    setShowEditFields(false)
  }

  const handleDeleteSupplier = async (suppliersId: number) => {
    const response = await axios.delete(`/api/settings/deleteSupplier?region=${state.currentRegion}&businessId=${state.user.businessId}&suppliersId=${suppliersId}`)
    if (!response.data.error) {
      toast.success(response.data.msg)
      setShowEditFields(false)
      mutate(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }

  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>Name</span>,
      selector: (row: Supplier) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Email</span>,
      selector: (row: Supplier) => row.email,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Phone</span>,
      selector: (row: Supplier) => row.phone,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Address</span>,
      selector: (row: Supplier) => row.address,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Country</span>,
      selector: (row: Supplier) => row.country,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'></span>,
      selector: (row: Supplier) => {
        return (
          <div className='d-flex flex-row flex-nowrap justify-content-center align-items-center gap-4'>
            <i className='ri-pencil-fill fs-3 text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-danger fs-3 las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => handleDeleteSupplier(row.suppliersId)} />
          </div>
        )
      },
      sortable: true,
      center: true,
    },
  ]

  return (
    <>
      {!showAddNewFields ? (
        <div className='d-flex flex-row justify-content-end align-items-end'>
          <Button type='submit' color='primary' className='btn btn-sm m-0' onClick={handleShowAddSupplier}>
            Add New
          </Button>
        </div>
      ) : (
        <div>
          <Form onSubmit={handleAddSupplier} className='d-flex flex-row justify-content-start align-items-center gap-3 w-100'>
            <FormGroup>
              <Label htmlFor='title' className='form-label'>
                *Supplier Name
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Name...'
                id='name'
                name='name'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.name || ''}
                invalid={validation.touched.name && validation.errors.name ? true : false}
              />
              {validation.touched.name && validation.errors.name ? <FormFeedback type='invalid'>{validation.errors.name}</FormFeedback> : null}
            </FormGroup>
            <FormGroup>
              <Label htmlFor='title' className='form-label'>
                *Email
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Email...'
                id='email'
                name='email'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.email || ''}
                invalid={validation.touched.email && validation.errors.email ? true : false}
              />
              {validation.touched.email && validation.errors.email ? <FormFeedback type='invalid'>{validation.errors.email}</FormFeedback> : null}
            </FormGroup>
            <FormGroup>
              <Label htmlFor='title' className='form-label'>
                *Phone
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Phone...'
                id='phone'
                name='phone'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.phone || ''}
                invalid={validation.touched.phone && validation.errors.phone ? true : false}
              />
              {validation.touched.phone && validation.errors.phone ? <FormFeedback type='invalid'>{validation.errors.phone}</FormFeedback> : null}
            </FormGroup>
            <FormGroup>
              <Label htmlFor='title' className='form-label'>
                *Address
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Address...'
                id='address'
                name='address'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.address || ''}
                invalid={validation.touched.address && validation.errors.address ? true : false}
              />
              {validation.touched.address && validation.errors.address ? <FormFeedback type='invalid'>{validation.errors.address}</FormFeedback> : null}
            </FormGroup>
            <FormGroup>
              <Label htmlFor='title' className='form-label'>
                *Country
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Address...'
                id='country'
                name='country'
                list='countries'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.country || ''}
                invalid={validation.touched.country && validation.errors.country ? true : false}
              />
              {validation.touched.country && validation.errors.country ? <FormFeedback type='invalid'>{validation.errors.country}</FormFeedback> : null}
              <datalist id='countries'>
                {countries.map(
                  (
                    country: {
                      name: string
                      code: string
                    },
                    index
                  ) => (
                    <option key={`country${index}`} value={country.code}>
                      {country.name} / {country.code}
                    </option>
                  )
                )}
              </datalist>
            </FormGroup>
            <div className='d-flex flex-row justify-content-end align-items-end gap-3'>
              <Button type='button' color='light' className='btn btn-sm m-0' onClick={handleCancelShowAddSupplier}>
                Cancel
              </Button>
              <Button type='submit' color='primary' className='btn btn-sm m-0'>
                Add New
              </Button>
            </div>
          </Form>
        </div>
      )}

      {showEditFields && (
        <Form onSubmit={handleEditSupplier} className='d-flex flex-row justify-content-start align-items-center gap-3 w-100'>
          <FormGroup>
            <Label htmlFor='title' className='form-label'>
              *Supplier Name
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Name...'
              id='name'
              name='name'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.name || ''}
              invalid={validationEdit.touched.name && validationEdit.errors.name ? true : false}
            />
            {validationEdit.touched.name && validationEdit.errors.name ? <FormFeedback type='invalid'>{validationEdit.errors.name}</FormFeedback> : null}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='title' className='form-label'>
              *Email
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Email...'
              id='email'
              name='email'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.email || ''}
              invalid={validationEdit.touched.email && validationEdit.errors.email ? true : false}
            />
            {validationEdit.touched.email && validationEdit.errors.email ? <FormFeedback type='invalid'>{validationEdit.errors.email}</FormFeedback> : null}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='title' className='form-label'>
              *Phone
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Phone...'
              id='phone'
              name='phone'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.phone || ''}
              invalid={validationEdit.touched.phone && validationEdit.errors.phone ? true : false}
            />
            {validationEdit.touched.phone && validationEdit.errors.phone ? <FormFeedback type='invalid'>{validationEdit.errors.phone}</FormFeedback> : null}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='title' className='form-label'>
              *Address
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Address...'
              id='address'
              name='address'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.address || ''}
              invalid={validationEdit.touched.address && validationEdit.errors.address ? true : false}
            />
            {validationEdit.touched.address && validationEdit.errors.address ? <FormFeedback type='invalid'>{validationEdit.errors.address}</FormFeedback> : null}
          </FormGroup>
          <FormGroup>
            <Label htmlFor='title' className='form-label'>
              *Country
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Address...'
              id='country'
              name='country'
              list='countries'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.country || ''}
              invalid={validationEdit.touched.country && validationEdit.errors.country ? true : false}
            />
            {validationEdit.touched.country && validationEdit.errors.country ? <FormFeedback type='invalid'>{validationEdit.errors.country}</FormFeedback> : null}
            <datalist id='countries'>
              {countries.map(
                (
                  country: {
                    name: string
                    code: string
                  },
                  index
                ) => (
                  <option key={`country${index}`} value={country.code}>
                    {country.name} / {country.code}
                  </option>
                )
              )}
            </datalist>
          </FormGroup>
          <div className='d-flex flex-row justify-content-end align-items-end gap-3'>
            <Button type='button' color='light' className='btn btn-sm m-0' onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button type='submit' color='primary' className='btn btn-sm m-0'>
              Update
            </Button>
          </div>
        </Form>
      )}

      <DataTable columns={columns} data={suppliers} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Suppliers
