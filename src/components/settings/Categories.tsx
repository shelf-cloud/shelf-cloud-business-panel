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

type Category = {
  categoryId: number
  businessId: number
  name: string
}

const nameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
  .max(200, 'Name is to Long')
  .min(1, 'Enter Supplier Name')

const addCategorySchema = z.object({
  name: nameSchema,
})

const editCategorySchema = z.object({
  categoryId: z.number(),
  name: nameSchema,
})

type AddCategoryForm = z.infer<typeof addCategorySchema>
type EditCategoryForm = z.infer<typeof editCategorySchema>

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
  const validation = useForm<AddCategoryForm>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: '',
    },
  })
  const onAddSubmit = async (values: AddCategoryForm) => {
    const response = await axios.post(`/api/settings/addNewCategory?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validation.reset()
      mutate(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`)
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
  const validationEdit = useForm<EditCategoryForm>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      categoryId: 0,
      name: '',
    },
  })
  const onEditSubmit = async (values: EditCategoryForm) => {
    const response = await axios.post(`/api/settings/updateCategory?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validationEdit.reset()
      setShowEditFields(false)
      mutate(`/api/settings/getCategories?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.msg)
    }
  }
  const handleEditSupplier = validationEdit.handleSubmit(onEditSubmit)
  const handleShowEditFields = (category: Category) => {
    validationEdit.reset(category)
    setShowAddNewFields(false)
    setShowEditFields(true)
  }
  const handleCancelEdit = () => {
    validationEdit.reset({
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
      name: <span className='font-bold text-[13px]'>Name</span>,
      selector: (row: Category) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'></span>,
      selector: (row: Category) => {
        return (
          <div className='flex flex-row flex-nowrap justify-center items-center gap-6'>
            <i className='ri-pencil-fill text-[22.75px] text-secondary' style={{ cursor: 'pointer' }} onClick={() => handleShowEditFields(row)} />
            <i className='align-middle text-destructive text-[26px] las la-trash-alt' style={{ cursor: 'pointer' }} onClick={() => handleDeleteCategory(row.categoryId)} />
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
                *Category Name
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
              *Category Name
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

      <DataTable columns={columns} data={categories} progressPending={loading} striped={true} defaultSortFieldId={1} />
    </>
  )
}

export default Categories
