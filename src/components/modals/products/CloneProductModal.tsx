 
 
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import * as Yup from 'yup'

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
  const validation = useFormik({
    initialValues: {
      title: cloneProductModal.originalName,
      sku: '',
      upc: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().max(100, 'Title is to Long.').required('Please Enter Your Title'),
      sku: Yup.string().max(50, 'SKU is to Long.').notOneOf([cloneProductModal.originalSku], 'SKU cannot be the same as the original SKU').required('Please Enter Sku'),
      upc: Yup.string().max(50, 'UPC is to Long.').required('Please Enter UPC'),
    }),
    onSubmit: async (values) => {
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
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Dialog
      open={!!cloneProductModal.isOpen}
      onOpenChange={(open) => {
        if (!open) setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
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
                  <Label htmlFor='firstNameinput' className='form-label'>
                    *Title
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px]'
                    placeholder='Title...'
                    id='title'
                    name='title'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.title || ''}
                    aria-invalid={Boolean(validation.touched.title && validation.errors.title) || undefined}
                  />
                  {validation.touched.title && validation.errors.title ? <div className='text-sm text-destructive'>{validation.errors.title}</div> : null}
                </div>
              </div>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    *SKU
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px] uppercase'
                    placeholder='Sku...'
                    id='sku'
                    name='sku'
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      validation.handleChange(e)
                    }}
                    onBlur={validation.handleBlur}
                    value={validation.values.sku || ''}
                    aria-invalid={Boolean(validation.touched.sku && validation.errors.sku) || undefined}
                  />
                  {validation.touched.sku && validation.errors.sku ? <div className='text-sm text-destructive'>{validation.errors.sku}</div> : null}
                </div>
              </div>
              <div className='px-3 w-full md:w-6/12'>
                <div className='mb-4'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    *UPC
                  </Label>
                  <Input
                    type='text'
                    className='text-[11.2px] uppercase'
                    placeholder='UPC...'
                    id='upc'
                    name='upc'
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      validation.handleChange(e)
                    }}
                    onBlur={validation.handleBlur}
                    value={validation.values.upc || ''}
                    aria-invalid={Boolean(validation.touched.upc && validation.errors.upc) || undefined}
                  />
                  {validation.touched.upc && validation.errors.upc ? <div className='text-sm text-destructive'>{validation.errors.upc}</div> : null}
                </div>
              </div>
              <div className='px-3 w-full'>
                <div className='mt-6 flex flex-row gap-4 justify-end'>
                  <Button
                    disabled={isLoading}
                    type='button'
                    variant='light'
                    className='btn'
                    onClick={() => {
                      setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
                    }}>
                    Cancel
                  </Button>
                  <Button type='submit' variant='success' className='btn'>
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
