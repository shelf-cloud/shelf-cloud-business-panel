import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { AmzDimensions, Dimensions } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  dimensionsModal: {
    show: boolean
    inventoryId: number
    isKit: boolean
    msku: string
    asin: string
    scSKU: string
    boxQty: number
    shelfCloudDimensions: AmzDimensions
    amazonDimensions: Dimensions
  }
  setdimensionsModal: (dimensionsModal: any) => void
}

const AmazonFulfillmentDimensions = ({ dimensionsModal, setdimensionsModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const { mutate } = useSWRConfig()
  const amzItemVolume = dimensionsModal.amazonDimensions.length.value * dimensionsModal.amazonDimensions.width.value * dimensionsModal.amazonDimensions.height.value
  const amzBoxVolume = amzItemVolume * dimensionsModal.boxQty
  const amzBoxTenPercent = amzBoxVolume * 0.1

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      boxWeight: dimensionsModal.shelfCloudDimensions.boxWeight,
      boxLength: dimensionsModal.shelfCloudDimensions.boxLength,
      boxWidth: dimensionsModal.shelfCloudDimensions.boxWidth,
      boxHeight: dimensionsModal.shelfCloudDimensions.boxHeight,
    },
    validationSchema: Yup.object({
      boxWeight: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 50 : 100)
        .required('Please enter Box Weight'),
      boxLength: Yup.number()
        .min(0.01)
        .max(
          dimensionsModal.amazonDimensions.length.value > 25 ||
            dimensionsModal.amazonDimensions.width.value > 25 ||
            dimensionsModal.amazonDimensions.height.value > 25 ||
            dimensionsModal.boxQty === 1
            ? 150
            : 25
        )
        .required('Please enter Box Length'),
      boxWidth: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 25 : 150)
        .required('Please enter Box Width'),
      boxHeight: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 25 : 150)
        .required('Please enter Box Height'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)
      const updatingBoxDimensions = toast.loading('Saving new Box Dimensions...')

      const response = await axios.post(`/api/amazon/fullfilments/masterBoxes/saveAmazonBoxDimensions?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        inventoryId: dimensionsModal.inventoryId,
        isKit: dimensionsModal.isKit,
        amzDimensions: {
          boxLength: values.boxLength,
          boxWidth: values.boxWidth,
          boxHeight: values.boxHeight,
          boxWeight: values.boxWeight,
        },
      })
      if (!response.data.error) {
        toast.update(updatingBoxDimensions, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setdimensionsModal({
          show: false,
          inventoryId: 0,
          isKit: false,
          msku: '',
          asin: '',
          scSKU: '',
          boxQty: 0,
          shelfCloudDimensions: {},
          amazonDimensions: {},
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getAmazonFbaSkus/${state.currentRegion}/${state.user.businessId}`)
        resetForm()
      } else {
        toast.update(updatingBoxDimensions, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }

      setloading(false)
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const closeModal = () => {
    setdimensionsModal({
      show: false,
      inventoryId: 0,
      isKit: false,
      msku: '',
      asin: '',
      scSKU: '',
      boxQty: 0,
      shelfCloudDimensions: {},
      amazonDimensions: {},
    })
  }

  return (
    <Dialog
      open={!!dimensionsModal.show}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>Listing Box Dimensions</DialogTitle>
        </DialogHeader>
        <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>Amazon Listing:</h5>
        <p className='m-0 p-0 text-muted-foreground'>
          MSKU: <span className='text-black font-semibold'>{dimensionsModal.msku}</span>
        </p>
        <p className='m-0 p-0 text-muted-foreground'>
          ASIN: <span className='text-black font-semibold'>{dimensionsModal.asin}</span>
        </p>
        <p className='m-0 p-0 text-muted-foreground'>
          ShelfCloud SKU: <span className='text-black font-semibold'>{dimensionsModal.scSKU}</span>
        </p>

        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3 my-4'>
            <div className='px-3 md:w-3/12'>
              <div className='mb-4'>
                <Label htmlFor='boxLength' className='mb-2'>
                  *Box Length (inch)
                </Label>
                <div>
                  <Input
                    type='number'
                    className='h-8 text-xs'
                    id='boxLength'
                    name='boxLength'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxLength || ''}
                    aria-invalid={(validation.touched.boxLength && validation.errors.boxLength ? true : false) || undefined}
                  />
                  {validation.touched.boxLength && validation.errors.boxLength ? <div className='text-sm text-destructive'>{validation.errors.boxLength}</div> : null}
                </div>
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-4'>
                <Label htmlFor='boxWidth' className='mb-2'>
                  *Box Width (inch)
                </Label>
                <div>
                  <Input
                    type='number'
                    className='h-8 text-xs'
                    id='boxWidth'
                    name='boxWidth'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxWidth || ''}
                    aria-invalid={(validation.touched.boxWidth && validation.errors.boxWidth ? true : false) || undefined}
                  />
                  {validation.touched.boxWidth && validation.errors.boxWidth ? <div className='text-sm text-destructive'>{validation.errors.boxWidth}</div> : null}
                </div>
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-4'>
                <Label htmlFor='boxHeight' className='mb-2'>
                  *Box Height (inch)
                </Label>
                <div>
                  <Input
                    type='number'
                    className='h-8 text-xs'
                    id='boxHeight'
                    name='boxHeight'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxHeight || ''}
                    aria-invalid={(validation.touched.boxHeight && validation.errors.boxHeight ? true : false) || undefined}
                  />
                  {validation.touched.boxHeight && validation.errors.boxHeight ? <div className='text-sm text-destructive'>{validation.errors.boxHeight}</div> : null}
                </div>
              </div>
            </div>
            <div className='px-3 md:w-3/12'>
              <div className='mb-4'>
                <Label htmlFor='boxWeight' className='mb-2'>
                  *Box Weight (lb)
                </Label>
                <div>
                  <Input
                    type='number'
                    className='h-8 text-xs'
                    id='boxWeight'
                    name='boxWeight'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxWeight || ''}
                    aria-invalid={(validation.touched.boxWeight && validation.errors.boxWeight ? true : false) || undefined}
                  />
                  {validation.touched.boxWeight && validation.errors.boxWeight ? <div className='text-sm text-destructive'>{validation.errors.boxWeight}</div> : null}
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap -mx-3 mb-2 mt-0'>
            <p className='m-0 text-[16.25px] font-semibold'>Expected Dimensions</p>
            <p className='m-0 text-muted-foreground text-nowrap'>
              Amazon Minimum Expected Box Volume: <span className='text-black font-semibold'>{FormatIntPercentage(state.currentRegion, amzBoxVolume - amzBoxTenPercent)} inch3</span>
            </p>
            <p className='m-0 text-muted-foreground text-nowrap'>
              ShelfCloud Box Volume:{' '}
              <span className='text-black font-semibold'>
                {FormatIntPercentage(state.currentRegion, validation.values.boxLength * validation.values.boxWidth * validation.values.boxHeight)} inch3
              </span>
            </p>
            {amzBoxVolume - amzBoxTenPercent > validation.values.boxLength * validation.values.boxWidth * validation.values.boxHeight && (
              <span className='m-0 mt-1 text-danger'>
                ShelfCloud Box dimensions do not meet the expected minimum volume for Amazon. Please adjust the Box Dimensions to meet the minimum volume requirements.
              </span>
            )}
          </div>
          <div className='flex flex-wrap -mx-3 mt-4'>
            <div className='text-right mt-2 flex flex-row gap-6 justify-end'>
              <div className='flex flex-row gap-4'>
                <Button
                  type='button'
                  variant='light'
                  onClick={closeModal}>
                  Cancel
                </Button>
                <Button disabled={loading} type='submit' variant='success'>
                  {loading ? <Spinner className='text-white' /> : 'Save Box Dimensions'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AmazonFulfillmentDimensions
