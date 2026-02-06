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

type Category = {
  categoryId: number
  businessId: number
  name: string
}

const Categories = ({}: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`, fetcher)
  const loading = !data
  const categories = useMemo(() => {
    if (data?.error) return [] as Category[]
    return (data ?? []) as Category[]
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
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/addNewCategory?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        mutate(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`)
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
      categoryId: 0,
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required('Enter Supplier Name'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/updateCategory?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        setShowEditFields(false)
        mutate(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    },
  })
  const handleEditSupplier = (event: any) => {
    event.preventDefault()
    validationEdit.handleSubmit()
  }
  const handleShowEditFields = (category: Category) => {
    validationEdit.setValues(category)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }
  const handleCancelEdit = () => {
    validationEdit.setValues({
      categoryId: 0,
      name: '',
    })
    setShowEditFields(false)
  }

  const handleDeleteCategory = async (categoryId: number) => {
    const response = await axios.delete(`/api/settings/deleteCategory?region=${state.currentRegion}&businessId=${state.user.businessId}&categoryId=${categoryId}`)
    if (!response.data.error) {
      toast.success(response.data.msg)
      setShowEditFields(false)
      mutate(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }

  const columns: any = [
    {
      name: <span className='font-weight-bold fs-13'>Name</span>,
      selector: (row: Category) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-weight-bold fs-13'></span>,
      selector: (row: Category) => {
        return (
          <div className='d-flex flex-row flex-nowrap justify-content-center align-items-center gap-4'>
            <i className='ri-pencil-fill fs-3 text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-danger fs-2 las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => handleDeleteCategory(row.categoryId)} />
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
                *Category Name
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
              *Category Name
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

      <DataTable columns={columns} data={categories} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Categories
