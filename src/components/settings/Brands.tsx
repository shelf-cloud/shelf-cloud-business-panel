import { useContext, useEffect, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import DataTable from '@components/Common/DataTableSC'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import useSWR from 'swr'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

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
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`, fetcher)
  const loading = !data
  const brands = useMemo(() => {
    if (data?.error) return [] as Brand[]
    return (data ?? []) as Brand[]
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
  const handleCancelEdit = () => {
    validationEdit.setValues({
      brandId: 0,
      name: '',
      logo: '',
    })
    setShowEditFields(false)
  }

  const handleDeleteBrand = async (brandId: number) => {
    const response = await axios.delete(`/api/settings/deleteBrand?region=${state.currentRegion}&businessId=${state.user.businessId}&brandId=${brandId}`)
    if (!response.data.error) {
      toast.success(response.data.msg)
      setShowEditFields(false)
      mutate(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }

  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Name</span>,
      selector: (row: Brand) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Logo Link</span>,
      selector: (row: Brand) => row.logo,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'></span>,
      selector: (row: Brand) => {
        return (
          <div className='flex flex-row flex-nowrap justify-center items-center gap-6'>
            <i className='ri-pencil-fill text-[22.75px] text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-destructive text-[22.75px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => handleDeleteBrand(row.brandId)} />
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
              <Label htmlFor='title' className='form-label'>
                *Brand Name
              </Label>
              <Input
                type='text'
                className='text-[13px]'
                placeholder='Name...'
                id='name'
                name='name'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.name || ''}
                aria-invalid={Boolean(validation.touched.name && validation.errors.name) || undefined}
              />
              {validation.touched.name && validation.errors.name ? <div className='text-sm text-destructive'>{validation.errors.name}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='title' className='form-label'>
                *Logo
              </Label>
              <Input
                type='text'
                className='text-[13px]'
                placeholder='Logo...'
                id='logo'
                name='logo'
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.logo || ''}
                aria-invalid={Boolean(validation.touched.logo && validation.errors.logo) || undefined}
              />
              {validation.touched.logo && validation.errors.logo ? <div className='text-sm text-destructive'>{validation.errors.logo}</div> : null}
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
            <Label htmlFor='title' className='form-label'>
              *Supplier Name
            </Label>
            <Input
              type='text'
              className='text-[13px]'
              placeholder='Name...'
              id='name'
              name='name'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.name || ''}
              aria-invalid={Boolean(validationEdit.touched.name && validationEdit.errors.name) || undefined}
            />
            {validationEdit.touched.name && validationEdit.errors.name ? <div className='text-sm text-destructive'>{validationEdit.errors.name}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='title' className='form-label'>
              *Logo
            </Label>
            <Input
              type='text'
              className='text-[13px]'
              placeholder='Logo...'
              id='logo'
              name='logo'
              onChange={validationEdit.handleChange}
              onBlur={validationEdit.handleBlur}
              value={validationEdit.values.logo || ''}
              aria-invalid={Boolean(validationEdit.touched.logo && validationEdit.errors.logo) || undefined}
            />
            {validationEdit.touched.logo && validationEdit.errors.logo ? <div className='text-sm text-destructive'>{validationEdit.errors.logo}</div> : null}
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

      <DataTable columns={columns} data={brands} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Brands
