import { useContext, useEffect, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import DataTable from '@components/Common/DataTableSC'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import useSWR from 'swr'
import { useSWRConfig } from 'swr'

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

const nameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
  .max(200, 'Name is to Long')
  .min(1, 'Enter Supplier Name')

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

  const addSupplierSchema = useMemo(
    () =>
      z.object({
        name: nameSchema,
        email: z.string().email().or(z.literal('')),
        phone: z.string(),
        address: z.string(),
        country: z.string().refine((value) => validCountries.includes(value), 'Must be a Valid Country Code'),
      }),
    [validCountries]
  )
  const editSupplierSchema = useMemo(
    () =>
      z.object({
        suppliersId: z.number(),
        name: nameSchema,
        email: z.string().email().or(z.literal('')),
        phone: z.string(),
        address: z.string(),
        country: z.string().refine((value) => validCountries.includes(value), 'Must be a Valid Country Code'),
      }),
    [validCountries]
  )
  type AddSupplierForm = z.infer<typeof addSupplierSchema>
  type EditSupplierForm = z.infer<typeof editSupplierSchema>

  // ADD NEW SUPPLIER
  const validation = useForm<AddSupplierForm>({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    },
  })
  const onAddSubmit = async (values: AddSupplierForm) => {
    const response = await axios.post(`/api/settings/addNewSupplier?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.message)
      validation.reset()
      mutate(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
  }
  const handleAddSupplier = validation.handleSubmit(onAddSubmit)
  const handleShowAddSupplier = () => {
    setShowAddNewFields(true)
    setShowEditFields(false)
  }
  const handleCancelShowAddSupplier = () => {
    setShowAddNewFields(false)
    setShowEditFields(false)
  }

  // EDIT CURRENT SUPPLIER
  const validationEdit = useForm<EditSupplierForm>({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      suppliersId: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      country: '',
    },
  })
  const onEditSubmit = async (values: EditSupplierForm) => {
    const response = await axios.post(`/api/settings/updateSupplier?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validationEdit.reset()
      setShowEditFields(false)
      mutate(`/api/settings/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }
  const handleEditSupplier = validationEdit.handleSubmit(onEditSubmit)
  const handleShowEditFields = (supplier: Supplier) => {
    validationEdit.reset(supplier)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }
  const handleCancelEdit = () => {
    validationEdit.reset({
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
              <Label htmlFor='name' className='mb-2'>
                *Supplier Name
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Name...'
                id='name'
                aria-invalid={Boolean(validation.formState.errors.name) || undefined}
                {...validation.register('name')}
              />
              {validation.formState.errors.name ? <div className='text-sm text-destructive'>{validation.formState.errors.name.message}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='email' className='mb-2'>
                *Email
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Email...'
                id='email'
                aria-invalid={Boolean(validation.formState.errors.email) || undefined}
                {...validation.register('email')}
              />
              {validation.formState.errors.email ? <div className='text-sm text-destructive'>{validation.formState.errors.email.message}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='phone' className='mb-2'>
                *Phone
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Phone...'
                id='phone'
                aria-invalid={Boolean(validation.formState.errors.phone) || undefined}
                {...validation.register('phone')}
              />
              {validation.formState.errors.phone ? <div className='text-sm text-destructive'>{validation.formState.errors.phone.message}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='address' className='mb-2'>
                *Address
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Address...'
                id='address'
                aria-invalid={Boolean(validation.formState.errors.address) || undefined}
                {...validation.register('address')}
              />
              {validation.formState.errors.address ? <div className='text-sm text-destructive'>{validation.formState.errors.address.message}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='country' className='mb-2'>
                *Country
              </Label>
              <Input
                type='text'
                className='text-[13px] h-8 text-xs'
                placeholder='Address...'
                id='country'
                list='countries'
                aria-invalid={Boolean(validation.formState.errors.country) || undefined}
                {...validation.register('country')}
              />
              {validation.formState.errors.country ? <div className='text-sm text-destructive'>{validation.formState.errors.country.message}</div> : null}
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
            <Label htmlFor='name' className='mb-2'>
              *Supplier Name
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Name...'
              id='name'
              aria-invalid={Boolean(validationEdit.formState.errors.name) || undefined}
              {...validationEdit.register('name')}
            />
            {validationEdit.formState.errors.name ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.name.message}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='email' className='mb-2'>
              *Email
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Email...'
              id='email'
              aria-invalid={Boolean(validationEdit.formState.errors.email) || undefined}
              {...validationEdit.register('email')}
            />
            {validationEdit.formState.errors.email ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.email.message}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='phone' className='mb-2'>
              *Phone
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Phone...'
              id='phone'
              aria-invalid={Boolean(validationEdit.formState.errors.phone) || undefined}
              {...validationEdit.register('phone')}
            />
            {validationEdit.formState.errors.phone ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.phone.message}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='address' className='mb-2'>
              *Address
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Address...'
              id='address'
              aria-invalid={Boolean(validationEdit.formState.errors.address) || undefined}
              {...validationEdit.register('address')}
            />
            {validationEdit.formState.errors.address ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.address.message}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='country' className='mb-2'>
              *Country
            </Label>
            <Input
              type='text'
              className='text-[13px] h-8 text-xs'
              placeholder='Address...'
              id='country'
              list='countries'
              aria-invalid={Boolean(validationEdit.formState.errors.country) || undefined}
              {...validationEdit.register('country')}
            />
            {validationEdit.formState.errors.country ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.country.message}</div> : null}
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
