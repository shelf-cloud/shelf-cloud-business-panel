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

type Brand = {
  brandId: number
  businessId: number
  name: string
  logo: string
}

const nameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
  .max(200, 'Name is to Long')
  .min(1, 'Enter Supplier Name')

const addBrandSchema = z.object({
  name: nameSchema,
  logo: z.string().url('logo must be a valid URL').or(z.literal('')),
})

const editBrandSchema = z.object({
  brandId: z.number(),
  name: nameSchema,
  logo: z.string().url('logo must be a valid URL').or(z.literal('')),
})

type AddBrandForm = z.infer<typeof addBrandSchema>
type EditBrandForm = z.infer<typeof editBrandSchema>

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
  const validation = useForm<AddBrandForm>({
    resolver: zodResolver(addBrandSchema),
    defaultValues: {
      name: '',
      logo: '',
    },
  })
  const onAddSubmit = async (values: AddBrandForm) => {
    const response = await axios.post(`/api/settings/addNewBrand?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validation.reset()
      mutate(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
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
  const validationEdit = useForm<EditBrandForm>({
    resolver: zodResolver(editBrandSchema),
    defaultValues: {
      brandId: 0,
      name: '',
      logo: '',
    },
  })
  const onEditSubmit = async (values: EditBrandForm) => {
    const response = await axios.post(`/api/settings/updateBrand?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validationEdit.reset()
      setShowEditFields(false)
      mutate(`/api/settings/getBrands?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }
  const handleEditSupplier = validationEdit.handleSubmit(onEditSubmit)
  const handleShowEditFields = (brand: Brand) => {
    validationEdit.reset(brand)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }
  const handleCancelEdit = () => {
    validationEdit.reset({
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
              <Label htmlFor='name' className='mb-2'>
                *Brand Name
              </Label>
              <Input
                type='text'
                className='text-[13px]'
                placeholder='Name...'
                id='name'
                aria-invalid={Boolean(validation.formState.errors.name) || undefined}
                {...validation.register('name')}
              />
              {validation.formState.errors.name ? <div className='text-sm text-destructive'>{validation.formState.errors.name.message}</div> : null}
            </div>
            <div className='mb-3'>
              <Label htmlFor='logo' className='mb-2'>
                *Logo
              </Label>
              <Input
                type='text'
                className='text-[13px]'
                placeholder='Logo...'
                id='logo'
                aria-invalid={Boolean(validation.formState.errors.logo) || undefined}
                {...validation.register('logo')}
              />
              {validation.formState.errors.logo ? <div className='text-sm text-destructive'>{validation.formState.errors.logo.message}</div> : null}
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
              className='text-[13px]'
              placeholder='Name...'
              id='name'
              aria-invalid={Boolean(validationEdit.formState.errors.name) || undefined}
              {...validationEdit.register('name')}
            />
            {validationEdit.formState.errors.name ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.name.message}</div> : null}
          </div>
          <div className='mb-3'>
            <Label htmlFor='logo' className='mb-2'>
              *Logo
            </Label>
            <Input
              type='text'
              className='text-[13px]'
              placeholder='Logo...'
              id='logo'
              aria-invalid={Boolean(validationEdit.formState.errors.logo) || undefined}
              {...validationEdit.register('logo')}
            />
            {validationEdit.formState.errors.logo ? <div className='text-sm text-destructive'>{validationEdit.formState.errors.logo.message}</div> : null}
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
