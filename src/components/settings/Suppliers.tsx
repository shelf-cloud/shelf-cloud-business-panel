import { useContext, useEffect, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import DataTable from '@components/Common/DataTableSC'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
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
      name: <span className='font-bold text-[13px]'>Name</span>,
      selector: (row: Supplier) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Email</span>,
      selector: (row: Supplier) => row.email,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Phone</span>,
      selector: (row: Supplier) => row.phone,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Address</span>,
      selector: (row: Supplier) => row.address,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Country</span>,
      selector: (row: Supplier) => row.country,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'></span>,
      selector: (row: Supplier) => {
        return (
          <div className='flex flex-row flex-nowrap justify-center items-center gap-6'>
            <i className='ri-pencil-fill text-[22.75px] text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-destructive text-[22.75px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => handleDeleteSupplier(row.suppliersId)} />
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
        <div className='flex flex-row justify-end items-end'>
          <Button type='submit' size='sm' className='m-0' onClick={handleShowAddSupplier}>
            Add New
          </Button>
        </div>
      ) : (
        <div>
          <form onSubmit={handleAddSupplier} className='flex flex-row justify-start items-center gap-4 w-full'>
            <div className='mb-3'>
              <Label htmlFor='title' className='mb-2'>
                *Supplier Name
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Name...'
                id='name'
                name='name'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.name || ''}
                aria-invalid={(validation.touched.name && validation.errors.name ? true : false) || undefined}
              />
              {validation.touched.name && validation.errors.name ? <div className='text-sm text-destructive'>{validation.errors.name}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='title' className='mb-2'>
                *Email
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Email...'
                id='email'
                name='email'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.email || ''}
                aria-invalid={(validation.touched.email && validation.errors.email ? true : false) || undefined}
              />
              {validation.touched.email && validation.errors.email ? <div className='text-sm text-destructive'>{validation.errors.email}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='title' className='mb-2'>
                *Phone
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Phone...'
                id='phone'
                name='phone'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.phone || ''}
                aria-invalid={(validation.touched.phone && validation.errors.phone ? true : false) || undefined}
              />
              {validation.touched.phone && validation.errors.phone ? <div className='text-sm text-destructive'>{validation.errors.phone}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='title' className='mb-2'>
                *Address
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Address...'
                id='address'
                name='address'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.address || ''}
                aria-invalid={(validation.touched.address && validation.errors.address ? true : false) || undefined}
              />
              {validation.touched.address && validation.errors.address ? <div className='text-sm text-destructive'>{validation.errors.address}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='title' className='mb-2'>
                *Country
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Address...'
                id='country'
                name='country'
                list='countries'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.country || ''}
                aria-invalid={(validation.touched.country && validation.errors.country ? true : false) || undefined}
              />
              {validation.touched.country && validation.errors.country ? <div className='text-sm text-destructive'>{validation.errors.country}</div> : null}
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
            </div>
            <div className='flex flex-row justify-end items-end gap-4'>
              <Button type='button' variant='light' size='sm' className='m-0' onClick={handleCancelShowAddSupplier}>
                Cancel
              </Button>
              <Button type='submit' size='sm' className='m-0'>
                Add New
              </Button>
            </div>
          </form>
        </div>
      )}

      {showEditFields && (
        <form onSubmit={handleEditSupplier} className='flex flex-row justify-start items-center gap-4 w-full'>
          <div className='mb-3'>
            <Label htmlFor='title' className='mb-2'>
              *Supplier Name
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Name...'
              id='name'
              name='name'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.name || ''}
              aria-invalid={(validationEdit.touched.name && validationEdit.errors.name ? true : false) || undefined}
            />
            {validationEdit.touched.name && validationEdit.errors.name ? <div className='text-sm text-destructive'>{validationEdit.errors.name}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='title' className='mb-2'>
              *Email
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Email...'
              id='email'
              name='email'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.email || ''}
              aria-invalid={(validationEdit.touched.email && validationEdit.errors.email ? true : false) || undefined}
            />
            {validationEdit.touched.email && validationEdit.errors.email ? <div className='text-sm text-destructive'>{validationEdit.errors.email}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='title' className='mb-2'>
              *Phone
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Phone...'
              id='phone'
              name='phone'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.phone || ''}
              aria-invalid={(validationEdit.touched.phone && validationEdit.errors.phone ? true : false) || undefined}
            />
            {validationEdit.touched.phone && validationEdit.errors.phone ? <div className='text-sm text-destructive'>{validationEdit.errors.phone}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='title' className='mb-2'>
              *Address
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Address...'
              id='address'
              name='address'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.address || ''}
              aria-invalid={(validationEdit.touched.address && validationEdit.errors.address ? true : false) || undefined}
            />
            {validationEdit.touched.address && validationEdit.errors.address ? <div className='text-sm text-destructive'>{validationEdit.errors.address}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='title' className='mb-2'>
              *Country
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Address...'
              id='country'
              name='country'
              list='countries'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.country || ''}
              aria-invalid={(validationEdit.touched.country && validationEdit.errors.country ? true : false) || undefined}
            />
            {validationEdit.touched.country && validationEdit.errors.country ? <div className='text-sm text-destructive'>{validationEdit.errors.country}</div> : null}
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
          </div>
          <div className='flex flex-row justify-end items-end gap-4'>
            <Button type='button' variant='light' size='sm' className='m-0' onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button type='submit' size='sm' className='m-0'>
              Update
            </Button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={suppliers} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Suppliers
