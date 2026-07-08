import React, { useContext, useEffect, useMemo, useState } from 'react'

// import Animation from '@components/Common/Animation'
import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { convertLabelZPLToPDF } from '@lib/convertZPLToPDF'
import { OrderItem, ReturnOrder } from '@typesTs/returns/returns'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CameraIcon } from 'lucide-react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardHeader, CardContent } from '@shadcn/ui/card'
import { Textarea } from '@shadcn/ui/textarea'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

import { Button as ShadcnButton } from '../shadcn/ui/button'
import ShowBiggerImageDialog, { SelectedUnsellableImage } from './ShowBiggerImageDialog'
import ShowReturnItemImagesDialog from './ShowReturnItemImagesDialog'

type Props = {
  data: ReturnOrder
  apiMutateLink?: string
}

const returnNoteSchema = z.object({
  comment: z.string().max(300, 'Title is to Long'),
})

type ReturnNoteForm = z.infer<typeof returnNoteSchema>

const ReturnExpandedType: React.FC<ExpanderComponentProps<ReturnOrder>> = ({ data, apiMutateLink }: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showEditNote, setShowEditNote] = useState(false)
  const OrderId = CleanSpecialCharacters(data.orderId!)
  const [loadingLabel, setLoadingLabel] = useState(false)

  const [imagesDialogItem, setImagesDialogItem] = useState<OrderItem | null>(null)
  const [selectedImage, setSelectedImage] = useState<SelectedUnsellableImage | null>(null)

  const serviceFee = useMemo(() => {
    if (data.chargesFees) {
      switch (true) {
        case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`
        case !data.isIndividualUnits && data.carrierService == 'LTL':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet + ${FormatCurrency(state.currentRegion, 0.3)} per item`
        case data.isIndividualUnits:
          return `
              ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.individualUnitCost!)} per unit
              ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box
              ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet
              `
        default:
          return `${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(state.currentRegion, data.chargesFees.extraItemOrderCost!)} addt'l.`
      }
    }
    return ''
  }, [data, state.currentRegion])

  const handlePrintingLabel = async () => {
    const printingLabel = toast.loading('Generating label...')
    setLoadingLabel(true)
    const { data: labelinfo }: { data: { error: boolean; message: string; label?: string } } = await axios(
      `/api/createLabelForOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${data.id}`
    )

    if (!labelinfo.label || labelinfo.error) {
      toast.update(printingLabel, {
        render: labelinfo.message || 'Error generating label',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      setLoadingLabel(false)
      return
    }

    const labelData = await convertLabelZPLToPDF(labelinfo.label)

    const blob = new Blob([labelData], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    const fileName = data.orderNumber + '-shipLabel.pdf'

    downloadLink.href = url
    downloadLink.download = fileName
    downloadLink.click()
    URL.revokeObjectURL(url)

    toast.update(printingLabel, {
      render: 'Label generated successfully',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    })

    mutate(apiMutateLink)
    setLoadingLabel(false)
  }

  const validationNote = useForm<ReturnNoteForm>({
    resolver: zodResolver(returnNoteSchema),
    defaultValues: {
      comment: data.extraComment || '',
    },
  })

  useEffect(() => {
    validationNote.reset({ comment: data.extraComment || '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.extraComment])

  const onSubmitNote = async (values: ReturnNoteForm) => {
    setLoading(true)

    const response = await axios.post(`/api/returns/editReturnComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      returnId: data.id,
      comment: values.comment,
    })

    if (!response.data.error) {
      toast.success(response.data.msg)

      mutate(apiMutateLink)
      setShowEditNote(false)
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  const handleAddComment = validationNote.handleSubmit(onSubmitNote)

  const openImagesDialog = (item: OrderItem) => {
    setImagesDialogItem(item)
    setSelectedImage(null)
  }

  const resetImagesDialog = () => {
    setImagesDialogItem(null)
    setSelectedImage(null)
  }

  const handleImagesDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetImagesDialog()
    }
  }
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full xl:w-4/12'>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Return</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    <tr>
                      <td className='text-muted-foreground whitespace-nowrap'>Service Requested:</td>
                      <td className='font-semibold w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground whitespace-nowrap'>Service Used:</td>
                      <td className='font-semibold w-full'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground whitespace-nowrap'>Customer Name:</td>
                      <td className='font-semibold w-full'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground whitespace-nowrap'># Of Pallets:</td>
                      <td className='font-semibold w-full'>{data.numberPallets}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-muted-foreground flex flex-row justify-start items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-muted-foreground' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-muted-foreground'>Shipping Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-muted-foreground'>Extra Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-4 flex justify-between items-center'>
                <h5 className='font-semibold m-0'>Order Comment</h5>
                <button
                  type='button'
                  aria-label='Edit order comment'
                  className={'border-0 bg-transparent text-primary m-0 p-0 ' + (showEditNote && 'hidden')}
                  onClick={() => setShowEditNote(true)}>
                  <i className='las la-edit text-[22.75px] m-0 p-0' />
                </button>
              </CardHeader>
              <CardContent>
                {showEditNote ? (
                  <form onSubmit={handleAddComment}>
                    <div className='px-3 w-full'>
                      <div className='m-0'>
                        <Label htmlFor='comment' className='mb-2'>
                          Edit Comment
                        </Label>
                        <Textarea
                          className='text-xs'
                          placeholder=''
                          id='comment'
                          aria-invalid={Boolean(validationNote.formState.errors.comment) || undefined}
                          {...validationNote.register('comment')}
                        />
                        {validationNote.formState.errors.comment ? <div className='text-sm text-destructive'>{validationNote.formState.errors.comment.message}</div> : null}
                      </div>
                      <div className='flex flex-row justify-end items-center gap-4'>
                        <Button type='button' disabled={loading} variant='light' size='sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} size='sm'>
                          {loading ? <Spinner className='text-white' /> : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p>{data.extraComment}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='px-3 w-full xl:w-8/12'>
          <Card>
            <CardHeader className='py-4'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th scope='col' aria-label='Item images'></th>
                      <th scope='col'>Condition</th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: OrderItem, key) => (
                      <tr key={key} className='border-b border-[color:var(--border)]'>
                        <td className='w-1/2 font-semibold'>{product.title ? product.title : product.name}</td>
                        <td className='text-muted-foreground'>{product.sku}</td>
                        <td>
                          {product.images && product.images.length > 0 ? (
                            <ShadcnButton
                              type='button'
                              variant={'outline'}
                              size={'icon'}
                              className='text-xs rounded-lg!'
                              onClick={() => openImagesDialog(product)}
                              aria-label='View item images'>
                              <CameraIcon className='text-destructive size-5' />
                            </ShadcnButton>
                          ) : null}
                        </td>
                        <td className='text-muted-foreground capitalize'>{product.state}</td>
                        <td className='text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} aria-label='Total label spacer'></td>
                      <td className='text-left text-[13px] font-bold whitespace-nowrap'>Total</td>
                      <td className='text-center text-[13px] text-primary'>
                        {data.orderItems.reduce((total, item: OrderItem) => total + (item.qtyReceived ? item.qtyReceived : item.quantity), 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full flex justify-end items-end'>
          {data.returnOrigin === 'shipment' && (
            <Card className='m-0'>
              {loadingLabel ? (
                <Button variant='secondary' className='btn-label'>
                  <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                  <Spinner className='text-white' />
                </Button>
              ) : (
                <Button variant='secondary' className='btn-label' onClick={() => handlePrintingLabel()}>
                  <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                  Print Label
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
      <ShowReturnItemImagesDialog
        imagesDialogItem={imagesDialogItem}
        imagesDialogImages={imagesDialogItem?.images || []}
        handleImagesDialogOpenChange={handleImagesDialogOpenChange}
        setSelectedImage={setSelectedImage}
      />
      <ShowBiggerImageDialog selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
    </div>
  )
}

export default ReturnExpandedType
