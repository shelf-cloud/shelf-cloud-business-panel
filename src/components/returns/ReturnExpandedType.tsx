import React, { useContext, useMemo, useState } from 'react'

// import Animation from '@components/Common/Animation'
import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { convertLabelZPLToPDF } from '@lib/convertZPLToPDF'
import { OrderItem, ReturnOrder } from '@typesTs/returns/returns'
import axios from 'axios'
import { useFormik } from 'formik'
import { CameraIcon } from 'lucide-react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row, Spinner } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import { Button as ShadcnButton } from '../shadcn/ui/button'
import ShowBiggerImageDialog, { SelectedUnsellableImage } from './ShowBiggerImageDialog'
import ShowReturnItemImagesDialog from './ShowReturnItemImagesDialog'

type Props = {
  data: ReturnOrder
  apiMutateLink?: string
}

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

  const validationNote = useFormik({
    enableReinitialize: true,
    initialValues: {
      comment: data.extraComment || '',
    },
    validationSchema: Yup.object({
      comment: Yup.string().max(300, 'Title is to Long'),
    }),
    onSubmit: async (values) => {
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
    },
  })

  const handleAddComment = (event: any) => {
    event.preventDefault()
    validationNote.handleSubmit()
  }

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
      <Row>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Return</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Service Requested:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Service Used:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Customer Name:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'># Of Pallets:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 tw:text-[13px] tw:text-[var(--bs-secondary-color)]' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4 tw:flex tw:justify-between tw:items-center'>
                <h5 className='tw:font-semibold tw:m-0'>Order Comment</h5>
                <button
                  type='button'
                  aria-label='Edit order comment'
                  className={'tw:border-0 tw:bg-transparent tw:text-primary tw:m-0 tw:p-0 ' + (showEditNote && 'tw:hidden')}
                  onClick={() => setShowEditNote(true)}>
                  <i className='las la-edit tw:text-[22.75px] tw:m-0 tw:p-0' />
                </button>
              </CardHeader>
              <CardBody>
                {showEditNote ? (
                  <Form onSubmit={handleAddComment}>
                    <Col md={12}>
                      <FormGroup className='tw:m-0'>
                        <Label htmlFor='comment' className='form-label'>
                          Edit Comment
                        </Label>
                        <Input
                          type='textarea'
                          className='tw:text-[13px]'
                          placeholder=''
                          id='comment'
                          name='comment'
                          bsSize='sm'
                          onChange={validationNote.handleChange}
                          onBlur={validationNote.handleBlur}
                          value={validationNote.values.comment || ''}
                          invalid={validationNote.touched.comment && validationNote.errors.comment ? true : false}
                        />
                        {validationNote.touched.comment && validationNote.errors.comment ? <FormFeedback type='invalid'>{validationNote.errors.comment}</FormFeedback> : null}
                      </FormGroup>
                      <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-4'>
                        <Button type='button' disabled={loading} color='light' size='sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} color='primary' size='sm'>
                          {loading ? <Spinner size={'sm'} color='light' /> : 'Save Changes'}
                        </Button>
                      </div>
                    </Col>
                  </Form>
                ) : (
                  <p>{data.extraComment}</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xl={8}>
          <Card>
            <CardHeader className='tw:py-4'>
              <h5 className='tw:font-semibold tw:m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th scope='col' aria-label='Item images'></th>
                      <th scope='col'>Condition</th>
                      <th className='tw:text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: OrderItem, key) => (
                      <tr key={key} className='tw:border-b tw:border-[color:var(--border)]'>
                        <td className='tw:w-1/2 tw:font-semibold'>{product.title ? product.title : product.name}</td>
                        <td className='tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td>
                          {product.images && product.images.length > 0 ? (
                            <ShadcnButton
                              type='button'
                              variant={'outline'}
                              size={'icon'}
                              className='tw:text-xs tw:rounded-lg!'
                              onClick={() => openImagesDialog(product)}
                              aria-label='View item images'>
                              <CameraIcon className='tw:text-destructive tw:size-5' />
                            </ShadcnButton>
                          ) : null}
                        </td>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:capitalize'>{product.state}</td>
                        <td className='tw:text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} aria-label='Total label spacer'></td>
                      <td className='tw:text-left tw:text-[13px] tw:font-bold tw:whitespace-nowrap'>Total</td>
                      <td className='tw:text-center tw:text-[13px] tw:text-primary'>
                        {data.orderItems.reduce((total, item: OrderItem) => total + (item.qtyReceived ? item.qtyReceived : item.quantity), 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className='tw:flex tw:justify-end tw:items-end'>
          {data.returnOrigin === 'shipment' && (
            <Card className='tw:m-0'>
              {loadingLabel ? (
                <Button color='secondary' className='btn-label'>
                  <i className='las la-toilet-paper label-icon tw:align-middle tw:text-[22.75px] tw:me-2' />
                  <Spinner color='light' size={'sm'} />
                </Button>
              ) : (
                <Button color='secondary' className='btn-label' onClick={() => handlePrintingLabel()}>
                  <i className='las la-toilet-paper label-icon tw:align-middle tw:text-[22.75px] tw:me-2' />
                  Print Label
                </Button>
              )}
            </Card>
          )}
        </Col>
      </Row>
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
