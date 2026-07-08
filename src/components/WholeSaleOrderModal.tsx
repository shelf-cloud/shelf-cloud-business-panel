/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import router from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import AppContext from '@context/AppContext'
import { wholesaleProductRow } from '@typings'
import axios from 'axios'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Textarea } from '@shadcn/ui/textarea'

import { FormatBytes } from '@/lib/FormatNumbers'
import { NoImageAdress } from '@/lib/assetsConstants'

import { SelectSingleValueType } from './Common/SimpleSelect'
import { FileWithPreview, HandleSubmitParams } from './modals/shared/UploadFileModal'
import { LABELS_SHIPMENT_TYPES } from './orders/wholesale/constants'
import UploadFileDropzone from './ui/UploadFileDropzone'
import SelectSingleFilter from './ui/filters/SelectSingleFilter'

type Props = {
  orderNumberStart: string
  orderProducts: wholesaleProductRow[]
}

const WholeSaleOrderModal = ({ orderNumberStart, orderProducts }: Props) => {
  const { data: session } = useSession()
  const { state, setWholeSaleOrderModal } = useContext(AppContext)

  const [orderLabel, setOrderLabel] = useState({
    files: [] as FileWithPreview[],
    acceptedFiles: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5000000,
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setOrderLabel((prev) => ({ ...prev, files: acceptedFiles as FileWithPreview[] }))
    },
    handleUploadFiles: async ({ region, businessId, selectedFiles, fileName }: HandleSubmitParams & { fileName: string }) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading Order Labels...')

      const formData = new FormData()
      formData.append('assetType', 'labels')
      formData.append('fileName', fileName)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])

      const { data } = await axios.post(`/api/assets/uploadNewAsset?region=${region}&businessId=${businessId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data.error) {
        toast.update(uploadingAsset, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: false }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading order labels',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      }
    },
    handleDeleteFile: (fileIndex: number) => {
      setOrderLabel((prev) => ({
        ...prev,
        files: prev.files.filter((_, index) => index !== fileIndex),
      }))
    },
    handleClearFiles: () => {
      setOrderLabel((prev) => ({ ...prev, files: [] }))
    },
  })

  const [orderPalletLabel, setOrderPalletLabel] = useState({
    files: [] as FileWithPreview[],
    acceptedFiles: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 5000000,
    handleAcceptedFiles: (acceptedFiles: File[]) => {
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          formattedSize: FormatBytes(file.size),
        })
      )
      setOrderPalletLabel((prev) => ({ ...prev, files: acceptedFiles as FileWithPreview[] }))
    },
    handleUploadFiles: async ({ region, businessId, selectedFiles, fileName }: HandleSubmitParams & { fileName: string }) => {
      if (selectedFiles.length === 0) {
        toast.error('Please select a file to upload')
        return { error: false }
      }

      const uploadingAsset = toast.loading('Uploading Pallet Labels...')

      const formData = new FormData()
      formData.append('assetType', 'labels')
      formData.append('fileName', fileName)
      formData.append('fileType', selectedFiles[0].type.split('/')[1])
      formData.append('file', selectedFiles[0])

      const { data } = await axios.post(`/api/assets/uploadNewAsset?region=${region}&businessId=${businessId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data.error) {
        toast.update(uploadingAsset, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: false }
      } else {
        toast.update(uploadingAsset, {
          render: data.message ?? 'Error uploading pallet labels',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return { error: true }
      }
    },
    handleDeleteFile: (fileIndex: number) => {
      setOrderPalletLabel((prev) => ({
        ...prev,
        files: prev.files.filter((_, index) => index !== fileIndex),
      }))
    },
    handleClearFiles: () => {
      setOrderPalletLabel((prev) => ({ ...prev, files: [] }))
    },
  })

  const [errorFile, setErrorFile] = useState(false)
  const [errorPalletFile, setErrorPalletFile] = useState(false)
  const [loading, setloading] = useState(false)

  const TotalMasterBoxes = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.orderQty), 0)

  const totalQuantityToShip = orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.totalToShip), 0)

  const validationSchema = z
    .object({
      orderNumber: z
        .string()
        .regex(/^[a-zA-Z0-9-]+$/, { message: `Invalid special characters: % & # " ' @ ~ , ...` })
        .max(100, { message: 'Title is to Long' })
        .min(1, { message: 'Please enter Order Number' }),
      type: z.enum(['LTL', 'Parcel Boxes'], { message: 'Please Choose a Type' }),
      numberOfPallets: z.number(),
      isThird: z.string().min(1, { message: 'Select a Shipment Payment Type' }),
      thirdInfo: z.string(),
      hasProducts: z.number().min(1, { message: 'To create an order, you must add at least one product' }),
    })
    .superRefine((values, ctx) => {
      if (values.type === 'LTL' && !(values.numberOfPallets >= 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be greater than or equal to 1',
          path: ['numberOfPallets'],
        })
      }
      if (values.isThird === 'true' && !values.thirdInfo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must enter Third Party Information',
          path: ['thirdInfo'],
        })
      }
    })

  type ValidationValues = z.infer<typeof validationSchema>

  const getDefaultValues = (): ValidationValues => ({
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    type: 'Parcel Boxes',
    numberOfPallets: 1,
    isThird: '',
    thirdInfo: '',
    hasProducts: orderProducts.length,
  })

  const validation = useForm<ValidationValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    return () => {
      validation.reset(getDefaultValues())
    }
  }, [state.wholesaleOrderProducts])

  const onSubmit = async (values: ValidationValues) => {
      setloading(true)

      const loadingToast = toast.loading('Creating Order...')

      if (values.isThird == 'false' && orderLabel.files.length == 0) {
        setErrorFile(true)
        setloading(false)
        toast.update(loadingToast, {
          render: 'Error creating Wholesale Order. Please upload the FBA Labels.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }
      setErrorFile(false)

      if (values.type == 'LTL' && orderPalletLabel.files.length == 0) {
        setErrorPalletFile(true)
        setloading(false)
        toast.update(loadingToast, {
          render: 'Error creating Wholesale Order. Please upload the Pallet Labels.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }
      setErrorPalletFile(false)

      const docTime = moment().format('DD-MM-YYYY-HH-mm-ss-a')
      const order_label_name_file = `order-labels-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`
      const order_pallet_label_name_file = `order-pallet-labels-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`

      if (values.isThird == 'false') {
        const uploadResult = await orderLabel.handleUploadFiles({
          region: state.currentRegion,
          businessId: state.user.businessId,
          selectedFiles: orderLabel.files,
          fileName: order_label_name_file,
        })
        if (uploadResult.error) {
          setErrorFile(true)
          setloading(false)
          return
        }

        if (values.type == 'LTL') {
          const uploadPalletResult = await orderPalletLabel.handleUploadFiles({
            region: state.currentRegion,
            businessId: state.user.businessId,
            selectedFiles: orderPalletLabel.files,
            fileName: order_pallet_label_name_file,
          })
          if (uploadPalletResult.error) {
            setErrorPalletFile(true)
            setloading(false)
            return
          }
        }
      }

      const { data } = await axios.post(`/api/orders/createWholesaleOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            qty: product.totalToShip,
            storeId: product.quantity.businessId,
            qtyPicked: 0,
            pickedHistory: [],
          }
        }),
        groovePackerProducts: orderProducts.map((product) => {
          return {
            sku: product.sku,
            qty: product.totalToShip,
            storeId: product.quantity.businessId,
            qtyScanned: 0,
            history: [
              {
                sku: product.sku,
                status: 'Awaiting',
                user: state.user.name,
                date: moment().format('YYYY-MM-DD h:mm:ss'),
              },
            ],
          }
        }),
        orderInfo: {
          orderNumber: values.orderNumber,
          carrierService: values.type,
          isPallets: values.type == 'LTL' ? true : false,
          numberOfPallets: values.type == 'LTL' ? values.numberOfPallets : 0,
          isthird: values.isThird == 'true' ? true : false,
          thirdInfo: values.isThird == 'true' ? values.thirdInfo : '',
          labelsName: values.isThird == 'false' ? order_label_name_file : '',
          palletLabels: values.isThird == 'false' && values.type == 'LTL' ? order_pallet_label_name_file : '',
          orderProducts: orderProducts.map((product) => {
            return {
              sku: product.sku,
              inventoryId: product.quantity.inventoryId,
              name: product.title,
              boxQty: product.qtyBox,
              quantity: product.totalToShip,
              businessId: product.quantity.businessId,
              isKit: product.isKit,
              children: product.children?.map((child) => {
                return {
                  inventoryId: child.idInventory,
                  sku: child.sku,
                  name: child.title,
                  title: child.title,
                  qtyUsed: child.qty,
                  quantity: child.qty * product.totalToShip!,
                  businessId: product.quantity.businessId,
                }
              }),
            }
          }),
        },
      })

      if (!data.error) {
        setWholeSaleOrderModal(false)
        toast.update(loadingToast, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        validation.reset(getDefaultValues())
        router.push('/Shipments')
      } else {
        toast.update(loadingToast, {
          render: data.message ?? 'Error creating Wholesale Order',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setloading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const formValues = validation.watch()
  const { errors, touchedFields } = validation.formState

  return (
    <Dialog open={!!state.showWholeSaleOrderModal} onOpenChange={(open) => { if (!open) setWholeSaleOrderModal(!state.showWholeSaleOrderModal) }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='myModal'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>
            WholeSale Order with Master Boxes
          </DialogTitle>
        </DialogHeader>
        <div>
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <p className='text-[19.5px] font-bold text-primary'>Order Details</p>
            <div className='px-3 md:w-1/2'>
              <div className='px-3 w-full'>
                <div className='mb-4'>
                  <Label htmlFor='orderNumber' className='mb-2 text-[11.2px]'>
                    *Order Number
                  </Label>
                  <InputGroup>
                    <InputGroupText className='font-semibold text-[16.25px]' style={{ padding: '0.2rem 0.9rem' }} id='bsnss-prefix'>
                      {orderNumberStart}
                    </InputGroupText>
                    <Input
                      type='text'
                      className='text-[13px] h-8 text-xs'
                      style={{ padding: '0.2rem 0.9rem' }}
                      id='orderNumber'
                      {...validation.register('orderNumber')}
                      aria-invalid={(touchedFields.orderNumber && errors.orderNumber ? true : false) || undefined}
                    />
                    {touchedFields.orderNumber && errors.orderNumber ? <div className='text-sm text-destructive'>{errors.orderNumber.message}</div> : null}
                  </InputGroup>
                </div>
              </div>
              <div className='px-3 w-full'>
                <Label htmlFor='type' className='mb-2 text-[11.2px]'>
                  *Type of Shipment
                </Label>
                <div className='flex flex-row justify-start items-center pb-4 gap-4'>
                  <Button
                    type='button'
                    className={formValues.type == 'Parcel Boxes' ? '' : 'text-muted-foreground'}
                    variant={formValues.type == 'Parcel Boxes' ? undefined : 'light'}
                    onClick={() => validation.setValue('type', 'Parcel Boxes', { shouldValidate: true, shouldDirty: true })}>
                    Parcel Boxes
                  </Button>
                  <Button
                    type='button'
                    className={formValues.type == 'LTL' ? '' : 'text-muted-foreground'}
                    variant={formValues.type == 'LTL' ? undefined : 'light'}
                    onClick={() => validation.setValue('type', 'LTL', { shouldValidate: true, shouldDirty: true })}>
                    Pallets
                  </Button>
                </div>
              </div>
              {formValues.type == 'LTL' && (
                <div className='px-3 md:w-1/2'>
                  <div className='mb-4'>
                    <Label htmlFor='numberOfPallets' className='mb-2 text-[11.2px]'>
                      *How many Pallets will be used?
                    </Label>
                    <Input
                      type='number'
                      className='text-[13px]'
                      id='numberOfPallets'
                      {...validation.register('numberOfPallets', { valueAsNumber: true })}
                      aria-invalid={(touchedFields.numberOfPallets && errors.numberOfPallets ? true : false) || undefined}
                    />
                    {touchedFields.numberOfPallets && errors.numberOfPallets ? (
                      <div className='text-sm text-destructive'>{errors.numberOfPallets.message}</div>
                    ) : null}
                  </div>
                </div>
              )}
              <div className='px-3 md:w-1/2'>
                <SelectSingleFilter
                  inputLabel={'*Select Shipment Type'}
                  inputName={'isThird'}
                  placeholder={'Select ...'}
                  selected={{ value: formValues.isThird, label: LABELS_SHIPMENT_TYPES.find((type) => type.value === formValues.isThird)?.label || 'Select...' }}
                  options={LABELS_SHIPMENT_TYPES || [{ value: '', label: '' }]}
                  handleSelect={(option: SelectSingleValueType) => {
                    validation.setValue('isThird', String(option!.value), { shouldValidate: true, shouldDirty: true })
                  }}
                  error={errors.isThird?.message}
                />
              </div>
            </div>
            <div className='px-3 md:w-1/2'>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 flex-1 basis-0'>
                  <UploadFileDropzone
                    accptedFiles={orderLabel.acceptedFiles}
                    handleAcceptedFiles={orderLabel.handleAcceptedFiles}
                    description={`Upload Shipping Labels. Drop Only PDF files here or click to upload.`}
                  />
                  <div className='list-unstyled mb-0' id='file-previews'>
                    {orderLabel.files.map((file, i) => {
                      return (
                        <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                          <div className='p-2'>
                            <div className='flex flex-wrap -mx-3 items-center'>
                              <div className='px-3 flex-1 basis-0 flex justify-between items-center gap-2'>
                                {file.type === 'application/pdf' ? (
                                  <div className='relative overflow-hidden rounded border' style={{ width: '60px', height: '60px' }}>
                                    <iframe
                                      title={`Shipping label preview for ${file.name}`}
                                      sandbox=''
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      width='400px'
                                      height='220px'
                                      style={{
                                        border: 'none',
                                        zoom: 0.35,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      margin: '0px',
                                      position: 'relative',
                                    }}>
                                    <img
                                      loading='lazy'
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      alt='File preview'
                                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                                      onLoad={() => {
                                        URL.revokeObjectURL(file.preview)
                                      }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className='text-muted-foreground m-0 text-[11.2px]'>{file.name}</p>
                                  <p className='mb-0 text-[11.2px]'>
                                    <strong>{file.formattedSize}</strong>
                                  </p>
                                </div>
                                <div>
                                  <Button variant='light' className='btn-icon' onClick={orderLabel.handleClearFiles}>
                                    <i className=' ri-close-line' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  {errorFile && <p className='text-danger m-0'>You must Upload the FBA Labels to create order.</p>}
                </div>
                <div className='px-3 flex-1 basis-0'>
                  {formValues.type == 'LTL' && (
                    <UploadFileDropzone
                      accptedFiles={orderPalletLabel.acceptedFiles}
                      handleAcceptedFiles={orderPalletLabel.handleAcceptedFiles}
                      description={`Upload Pallet Labels. Drop Only PDF files here or click to upload.`}
                    />
                  )}
                  <div className='list-unstyled mb-0' id='file-previews'>
                    {orderPalletLabel.files.map((file: any, i) => {
                      return (
                        <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                          <div className='p-2'>
                            <div className='flex flex-wrap -mx-3 items-center'>
                              <div className='px-3 flex-1 basis-0 flex justify-between items-center gap-2'>
                                {file.type === 'application/pdf' ? (
                                  <div className='relative overflow-hidden rounded border' style={{ width: '60px', height: '60px' }}>
                                    <iframe
                                      title={`Pallet label preview for ${file.name}`}
                                      sandbox=''
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      width='400px'
                                      height='220px'
                                      style={{
                                        border: 'none',
                                        zoom: 0.35,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      margin: '0px',
                                      position: 'relative',
                                    }}>
                                    <img
                                      loading='lazy'
                                      src={file.preview ? file.preview : NoImageAdress}
                                      onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                      alt='File preview'
                                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                                      onLoad={() => {
                                        URL.revokeObjectURL(file.preview)
                                      }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className='text-muted-foreground font-bold m-0 text-[11.2px]'>{file.name}</p>
                                  <p className='mb-0 text-[11.2px]'>
                                    <strong>{file.formattedSize}</strong>
                                  </p>
                                </div>
                                <div>
                                  <Button variant='light' className='btn-icon' onClick={orderPalletLabel.handleClearFiles}>
                                    <i className=' ri-close-line' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                  {errorPalletFile && <p className='text-danger m-0'>You must Upload the Pallet Labels to create order.</p>}
                </div>
              </div>
            </div>
            <div className='px-3 w-full'>
              {formValues.isThird == 'true' && (
                <>
                  <Textarea
                    id='thirdInfo'
                    placeholder='Please enter the Third Party Shipping Information: Recepient, Company, Address, City, State, Zipcode, Country.'
                    {...validation.register('thirdInfo')}
                    aria-invalid={(touchedFields.thirdInfo && errors.thirdInfo ? true : false) || undefined}
                  />
                  {touchedFields.thirdInfo && errors.thirdInfo ? <div className='text-sm text-destructive'>{errors.thirdInfo.message}</div> : null}
                  <h5 className='text-[11.2px] mb-4 text-muted-foreground'>*Additional shipping costs apply to this type of shipping.</h5>
                </>
              )}
            </div>
            <div className='px-3 w-full'>
              <p className='text-[13px] m-0'>Total SKUs in Order: {formValues.hasProducts}</p>
              {touchedFields.hasProducts && errors.hasProducts ? <p className='text-danger'>{errors.hasProducts.message}</p> : null}
              <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Type</th>
                    <th className='text-center'>Master Boxes</th>
                    <th className='text-center'>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td className='text-center'>{product.isKit ? 'Kit' : 'Product'}</td>
                      <td className='text-center'>{product.orderQty}</td>
                      <td className='text-center'>{product.totalToShip}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td aria-label='Total label spacer'></td>
                    <td className='font-bold text-center'>TOTAL</td>
                    <td className='font-bold text-center'>{TotalMasterBoxes}</td>
                    <td className='font-bold text-center'>{totalQuantityToShip}</td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            <div className='px-3 w-full'>
              <div className='text-right'>
                <Button disabled={loading} type='submit' variant='success'>
                  {loading ? <Spinner className='text-white' /> : 'Confirm Order'}
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

export default WholeSaleOrderModal
