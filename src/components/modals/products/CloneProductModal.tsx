

import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { z } from 'zod'

type CloneProductModal = {
  isOpen: boolean
  originalId: number
  originalName: string
  originalSku: string
}

type Props = {
  cloneProductModal: CloneProductModal
  setcloneProductModal: (prev: CloneProductModal) => void
}

const CloneProductModal = ({ cloneProductModal, setcloneProductModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()

  const schema = z.object({
    title: z.string().max(100, 'Title is to Long.').min(1, 'Please Enter Your Title'),
    sku: z
      .string()
      .max(50, 'SKU is to Long.')
      .min(1, 'Please Enter Sku')
      .refine((value) => value !== cloneProductModal.originalSku, { message: 'SKU cannot be the same as the original SKU' }),
    upc: z.string().max(50, 'UPC is to Long.').min(1, 'Please Enter UPC'),
  })

  const validation = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: cloneProductModal.originalName,
      sku: '',
      upc: '',
    },
  })

  const skuField = validation.register('sku')
  const upcField = validation.register('upc')

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true)
    const cloneProduct = toast.loading('Cloning Product...')

    try {
      const response = await axios
        .post(`/api/products/cloneProduct?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          title: values.title,
          sku: values.sku,
          upc: values.upc,
          originalId: cloneProductModal.originalId,
          originalSku: cloneProductModal.originalSku,
        })
        .then((res) => res.data)

      if (!response.error) {
        toast.update(cloneProduct, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
        router.push(`/product/${response.newInventoryId}/${response.newSku}`)
      } else {
        toast.update(cloneProduct, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(cloneProduct, {
        render: 'Error cloning product',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setLoading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  return (
    <Dialog
      open={!!cloneProductModal.isOpen}
      onOpenChange={(open) => {
        if (!open) setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Clone Product</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleAddProduct}>
            <div className='flex flex-wrap -mx-3'>
              <p className='m-0 font-bold text-[16.25px] text-primary'>Cloning From:</p>
              <p className='m-0 font-light'>{cloneProductModal.originalName}</p>
              <p className='m-0 font-semibold'>{cloneProductModal.originalSku}</p>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <h5 className='text-[16.25px] m-0 mt-4 mb-2 font-semibold text-primary'>New Product Details:</h5>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='firstNameinput' className='mb-2'>
                    *Title
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px]'
                    placeholder='Title...'
                    id='title'
                    aria-invalid={Boolean(validation.formState.touchedFields.title && validation.formState.errors.title) || undefined}
                    {...validation.register('title')}
                  />
                  {validation.formState.touchedFields.title && validation.formState.errors.title ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.title.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='lastNameinput' className='mb-2'>
                    *SKU
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px] uppercase'
                    placeholder='Sku...'
                    id='sku'
                    aria-invalid={Boolean(validation.formState.touchedFields.sku && validation.formState.errors.sku) || undefined}
                    {...skuField}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      skuField.onChange(e)
                    }}
                  />
                  {validation.formState.touchedFields.sku && validation.formState.errors.sku ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.sku.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='lastNameinput' className='mb-2'>
                    *UPC
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px] uppercase'
                    placeholder='UPC...'
                    id='upc'
                    aria-invalid={Boolean(validation.formState.touchedFields.upc && validation.formState.errors.upc) || undefined}
                    {...upcField}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      upcField.onChange(e)
                    }}
                  />
                  {validation.formState.touchedFields.upc && validation.formState.errors.upc ? (
                    <div className='text-sm text-destructive'>{validation.formState.errors.upc.message}</div>
                  ) : null}
                </div>
              </div>
              <div className='px-3 w-full'>
                <div className='mt-6 flex flex-row gap-4 justify-end'>
                  <Button
                    disabled={isLoading}
                    type='button'
                    variant='light'
                    onClick={() => {
                      setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
                    }}>
                    Cancel
                  </Button>
                  <Button type='submit' variant='success'>
                    {isLoading ? (
                      <span>
                        <Spinner className='text-white' /> Cloning...
                      </span>
                    ) : (
                      'Clone'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CloneProductModal
