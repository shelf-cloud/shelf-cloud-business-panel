import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { AmzDimensions, Dimensions } from '@typesTs/amazon/fulfillments'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

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

const numberField = (label: string, min: number, max: number, requiredMessage: string) =>
  z.preprocess((val: string | number | undefined | null) => {
    if (val === '' || val === null || val === undefined) return undefined
    const num = typeof val === 'number' ? val : parseFloat(val)
    return Number.isNaN(num) ? undefined : num
  }, z.number(requiredMessage).min(min, `${label} must be greater than or equal to ${min}`).max(max, `${label} must be less than or equal to ${max}`))

const AmazonFulfillmentDimensions = ({ dimensionsModal, setdimensionsModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const { mutate } = useSWRConfig()
  const amzItemVolume = dimensionsModal.amazonDimensions.length.value * dimensionsModal.amazonDimensions.width.value * dimensionsModal.amazonDimensions.height.value
  const amzBoxVolume = amzItemVolume * dimensionsModal.boxQty
  const amzBoxTenPercent = amzBoxVolume * 0.1

  const boxWeightMax = dimensionsModal.boxQty > 1 ? 50 : 100
  const boxLengthMax =
    dimensionsModal.amazonDimensions.length.value > 25 ||
    dimensionsModal.amazonDimensions.width.value > 25 ||
    dimensionsModal.amazonDimensions.height.value > 25 ||
    dimensionsModal.boxQty === 1
      ? 150
      : 25
  const boxWidthMax = dimensionsModal.boxQty > 1 ? 25 : 150
  const boxHeightMax = dimensionsModal.boxQty > 1 ? 25 : 150

  const schema = z.object({
    boxWeight: numberField('boxWeight', 0.01, boxWeightMax, 'Please enter Box Weight'),
    boxLength: numberField('boxLength', 0.01, boxLengthMax, 'Please enter Box Length'),
    boxWidth: numberField('boxWidth', 0.01, boxWidthMax, 'Please enter Box Width'),
    boxHeight: numberField('boxHeight', 0.01, boxHeightMax, 'Please enter Box Height'),
  })

  type FormValues = z.input<typeof schema>
  type FormOutput = z.output<typeof schema>

  const getDefaultValues = (): FormValues => ({
    boxWeight: dimensionsModal.shelfCloudDimensions.boxWeight,
    boxLength: dimensionsModal.shelfCloudDimensions.boxLength,
    boxWidth: dimensionsModal.shelfCloudDimensions.boxWidth,
    boxHeight: dimensionsModal.shelfCloudDimensions.boxHeight,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<FormValues, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    reset(getDefaultValues())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensionsModal.shelfCloudDimensions])

  const watchedValues = watch()
  const boxLengthValue = Number(watchedValues.boxLength) || 0
  const boxWidthValue = Number(watchedValues.boxWidth) || 0
  const boxHeightValue = Number(watchedValues.boxHeight) || 0

  const onSubmit = async (values: FormOutput) => {
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
      reset()
    } else {
      toast.update(updatingBoxDimensions, {
        render: response.data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setloading(false)
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

        <form onSubmit={handleSubmit(onSubmit)}>
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
                    aria-invalid={(((touchedFields.boxLength || isSubmitted) && errors.boxLength ? true : false)) || undefined}
                    {...register('boxLength')}
                  />
                  {(touchedFields.boxLength || isSubmitted) && errors.boxLength ? <div className='text-sm text-destructive'>{errors.boxLength.message}</div> : null}
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
                    aria-invalid={(((touchedFields.boxWidth || isSubmitted) && errors.boxWidth ? true : false)) || undefined}
                    {...register('boxWidth')}
                  />
                  {(touchedFields.boxWidth || isSubmitted) && errors.boxWidth ? <div className='text-sm text-destructive'>{errors.boxWidth.message}</div> : null}
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
                    aria-invalid={(((touchedFields.boxHeight || isSubmitted) && errors.boxHeight ? true : false)) || undefined}
                    {...register('boxHeight')}
                  />
                  {(touchedFields.boxHeight || isSubmitted) && errors.boxHeight ? <div className='text-sm text-destructive'>{errors.boxHeight.message}</div> : null}
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
                    aria-invalid={(((touchedFields.boxWeight || isSubmitted) && errors.boxWeight ? true : false)) || undefined}
                    {...register('boxWeight')}
                  />
                  {(touchedFields.boxWeight || isSubmitted) && errors.boxWeight ? <div className='text-sm text-destructive'>{errors.boxWeight.message}</div> : null}
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
                {FormatIntPercentage(state.currentRegion, boxLengthValue * boxWidthValue * boxHeightValue)} inch3
              </span>
            </p>
            {amzBoxVolume - amzBoxTenPercent > boxLengthValue * boxWidthValue * boxHeightValue && (
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
