import React, { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { toast } from 'react-toastify'
import DataTable from 'react-data-table-component'
import { Button, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useSWRConfig } from 'swr'
type Props = {}

type Brand = {
  brandId: number
  businessId: number
  name: string
  logo: string
}

const Brands = ({}: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  const [showAddNewFields, setShowAddNewFields] = useState(false)
  const [showEditFields, setShowEditFields] = useState(false)
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`, fetcher)

  useEffect(() => {
    if (data?.error) {
      setBrands([])
      setloading(false)
      toast.error(data?.message)
    } else if (data) {
      setBrands(data)

      setloading(false)
    }
  }, [data])

  // ADD NEW SUPPLIER
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
      logo: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
      logo: Yup.string().url(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/addNewBrand?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        mutate(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
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
      brandId: 0,
      name: '',
      logo: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
      logo: Yup.string().url(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/updateBrand?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        setShowEditFields(false)
        mutate(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    },
  })
  const handleEditSupplier = (event: any) => {
    event.preventDefault()
    validationEdit.handleSubmit()
  }
  const handleShowEditFields = (brand: Brand) => {
    validationEdit.setValues(brand)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }

  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>Name</span>,
      selector: (row: Brand) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'>Logo Link</span>,
      selector: (row: Brand) => row.logo,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'></span>,
      selector: (row: Brand) => {
        return (
          <div className='d-flex flex-row flex-nowrap justify-content-center align-items-center gap-4'>
            <i className='ri-pencil-fill fs-3 text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-danger fs-2 las la-trash-alt' style={{ cursor: 'pointer' }} />
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
                *Brand Name
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
                *Logo
              </Label>
              <Input
                type='text'
                className='form-control fs-6'
                placeholder='Logo...'
                id='logo'
                name='logo'
                bsSize='sm'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.logo || ''}
                invalid={validation.touched.logo && validation.errors.logo ? true : false}
              />
              {validation.touched.logo && validation.errors.logo ? <FormFeedback type='invalid'>{validation.errors.logo}</FormFeedback> : null}
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
              *Logo
            </Label>
            <Input
              type='text'
              className='form-control fs-6'
              placeholder='Logo...'
              id='logo'
              name='logo'
              bsSize='sm'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.logo || ''}
              invalid={validationEdit.touched.logo && validationEdit.errors.logo ? true : false}
            />
            {validationEdit.touched.logo && validationEdit.errors.logo ? <FormFeedback type='invalid'>{validationEdit.errors.logo}</FormFeedback> : null}
          </FormGroup>
          <div className='d-flex flex-row justify-content-end align-items-end'>
            <Button type='submit' color='primary' className='btn btn-sm m-0'>
              Update
            </Button>
          </div>
        </Form>
      )}

      <DataTable columns={columns} data={brands} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Brands
