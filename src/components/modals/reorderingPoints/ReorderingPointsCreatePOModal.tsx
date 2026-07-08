/* eslint-disable @next/next/no-img-element */
import router from 'next/router'
import { useContext, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import SimpleSelect from '@components/Common/SimpleSelect'
import { RECEIVING_SHIPMENT_TYPES } from '@components/constants/receivings'
import DownloadExcelReorderingPointsOrder from '@components/reorderingPoints/DownloadExcelReorderingPointsOrder'
import PrintReorderingPointsOrder from '@components/reorderingPoints/PrintReorderingPointsOrder'
import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { useFilterWarehousesByShipmentType } from '@hooks/warehouses/useFilterWarehousesByShipmentType'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { DebounceInput } from 'react-debounce-input'
import { toast } from '@/lib/toast'
import { useSWRConfig } from 'swr'

import { Button } from '@shadcn/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { ChevronDownIcon } from 'lucide-react'
import { z } from 'zod'

export type Splits = {
  isSplitting: boolean
  splitsQty: number
}

const MD_WIDTH_12THS: { [key: number]: string } = {
  1: 'md:w-1/12',
  2: 'md:w-2/12',
  3: 'md:w-3/12',
  4: 'md:w-4/12',
  5: 'md:w-5/12',
  6: 'md:w-6/12',
  7: 'md:w-7/12',
  8: 'md:w-8/12',
  9: 'md:w-9/12',
  10: 'md:w-10/12',
  11: 'md:w-11/12',
  12: 'md:w-full',
}

type poItem = {
  sku: string
  name: string
  boxQty: number
  orderQty: number
  inboundQty: number
  sellerCost: number
  inventoryId: number
  receivedQty: number
  arrivalHistory: never[]
}

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  selectedSupplier: string
  showPOModal: boolean
  setshowPOModal: (showPOModal: boolean) => void
  username: string
  splits: Splits
  splitNames: SplitNames
}

const optionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const createPOSchema = (splits: Splits) =>
  z
    .object({
      orderNumber: z
        .string()
        .regex(/^[a-zA-Z0-9-]+$/, { message: `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces` })
        .max(50, { message: 'Order Number is to Long' })
        .min(1, { message: 'Required Order Number' }),
      destinationSC: optionSchema,
      shipmentType: optionSchema,
      splitDestinations: z.record(z.string(), optionSchema),
      splitShipmentTypes: z.record(z.string(), optionSchema),
    })
    .superRefine((values, ctx) => {
      if (!splits.isSplitting) {
        if (!values.destinationSC.value) {
          ctx.addIssue({ code: 'custom', message: 'Destination Required', path: ['destinationSC', 'value'] })
        }
        if (!values.shipmentType.value) {
          ctx.addIssue({ code: 'custom', message: 'Shipment Type Required', path: ['shipmentType', 'value'] })
        }
      } else {
        const destValues: string[] = []
        for (let i = 0; i < splits.splitsQty; i++) {
          const dest = values.splitDestinations[`${i}`]
          if (!dest || dest.value === '' || !(Number(dest.value) >= 0)) {
            ctx.addIssue({ code: 'custom', message: `Required Split #${i + 1} Destination`, path: ['splitDestinations', `${i}`, 'value'] })
          } else {
            destValues.push(dest.value)
          }
          const shipType = values.splitShipmentTypes[`${i}`]
          if (!shipType || !shipType.value) {
            ctx.addIssue({ code: 'custom', message: `Required Split #${i + 1} Shipment Type`, path: ['splitShipmentTypes', `${i}`, 'value'] })
          }
        }
        if (new Set(destValues).size !== destValues.length) {
          ctx.addIssue({ code: 'custom', message: 'Splits must have unique destinations', path: ['splitDestinations'] })
        }
      }
    })

type CreatePOValues = z.infer<ReturnType<typeof createPOSchema>>

function ReorderingPointsCreatePOModal({ reorderingPointsOrder, selectedSupplier, showPOModal, setshowPOModal, username, splits, splitNames }: Props) {
  const { state } = useContext(AppContext)
  const { warehouses, isLoading } = useWarehouses()
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [orderComment, setorderComment] = useState('')
  const [savingComment, setsavingComment] = useState(false)
  const [printColumns, setprintColumns] = useState({
    comments: true,
    qtyPerBox: true,
    volume: true,
    cost: true,
  })

  const { generate_new_forecast_products } = useRPNewForecast()

  const orderNumberStart = `${username.substring(0, 3).toUpperCase()}-`

  const getDefaultValues = (): CreatePOValues => ({
    orderNumber: state.currentRegion == 'us' ? `00${state.user.orderNumber.us}` : `00${state.user.orderNumber.eu}`,
    destinationSC: { value: '', label: 'Select ...' },
    shipmentType: { value: '', label: 'Select ...' },
    splitDestinations: splits.isSplitting ? Object.fromEntries(Array.from({ length: splits.splitsQty }, (_, index) => [index, { value: '', label: 'Select ...' }])) : {},
    splitShipmentTypes: splits.isSplitting ? Object.fromEntries(Array.from({ length: splits.splitsQty }, (_, index) => [index, { value: '', label: 'Select ...' }])) : {},
  })

  const validation = useForm<CreatePOValues>({
    resolver: zodResolver(createPOSchema(splits)),
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    validation.reset(getDefaultValues())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splits.isSplitting, splits.splitsQty, state.currentRegion])

  const onSubmit = async (values: CreatePOValues) => {
    setLoading(true)

    const createNewPurchaseOrder = toast.loading('Creating Purchase Order...')

    const poItems: poItem[] = []
    for await (const product of Object.values(reorderingPointsOrder.products)) {
      poItems.push({
        sku: product.sku,
        name: product.title,
        boxQty: product.boxQty,
        orderQty: product.useOrderAdjusted ? product.orderAdjusted : product.order,
        inboundQty: 0,
        sellerCost: product.sellerCost,
        inventoryId: product.inventoryId,
        receivedQty: 0,
        arrivalHistory: [],
      })
    }

    const hasSplitting = splits.isSplitting

    const splitsInfo = {} as { [split: string]: { splitId: number; splitName: string; destination: { id: number; label: string }; items: poItem[]; name3PL: string | null } }
    if (splits.isSplitting) {
      for await (const product of Object.values(reorderingPointsOrder.products)) {
        for (let i = 0; i < splits.splitsQty; i++) {
          if (!splitsInfo[i])
            splitsInfo[i] = {
              splitId: i,
              splitName: splitNames[`${i}`],
              destination: { id: parseInt(values.splitDestinations[i].value), label: values.splitDestinations[i].label },
              items: [],
              name3PL: warehouses.find((w) => w.warehouseId === parseInt(values.splitDestinations[i].value))?.name3PL || null,
            }
          splitsInfo[i].items.push({
            sku: product.sku,
            name: product.title,
            boxQty: product.boxQty,
            orderQty: product.useOrderAdjusted ? product.orderSplits[`${i}`].orderAdjusted : product.orderSplits[`${i}`].order,
            inboundQty: 0,
            sellerCost: product.sellerCost,
            inventoryId: product.inventoryId,
            receivedQty: 0,
            arrivalHistory: [],
          })
        }
      }
    }

    const selectedWarehouse = warehouses.find((w) => w.warehouseId === parseInt(values.destinationSC.value))

    const response = await axios.post(`/api/reorderingPoints/createNewPurchaseOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderNumber: values.orderNumber,
      destinationSC: hasSplitting ? 0 : warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
      warehouseId: hasSplitting ? 0 : parseInt(values.destinationSC.value),
      poItems,
      hasSplitting,
      splits: splitsInfo,
      selectedSupplier: selectedSupplier,
      name3PL: hasSplitting ? null : selectedWarehouse?.name3PL,
    })

    if (!response.data.error) {
      setshowPOModal(false)
      toast.update(createNewPurchaseOrder, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

      generate_new_forecast_products({
        skus: poItems.map((item) => item.sku),
        productIds: poItems.map((item) => item.inventoryId),
      })

      await mutate('/api/getuser').then(() => {
        router.push('/purchaseOrders?status=pending&organizeBy=suppliers')
      })
    } else {
      toast.update(createNewPurchaseOrder, {
        render: response.data.message ?? 'Error creating Purchase Order',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setLoading(false)
  }

  const handleAddComment = async (comment: string, sku: string, inventoryId: number) => {
    setsavingComment(true)
    if (comment === '') reorderingPointsOrder.products[sku].note = ''
    else reorderingPointsOrder.products[sku].note = comment

    await axios
      .post(`/api/reorderingPoints/setNewComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        note: comment,
        inventoryId: inventoryId,
      })
      .then(() => {
        setsavingComment(false)
      })
  }

  const values = validation.watch()
  const { errors, touchedFields } = validation.formState

  const { filteredWarehouses, splitFilteredWarehouses } = useFilterWarehousesByShipmentType(warehouses, values.shipmentType.value)

  return (
    <Dialog
      open={!!showPOModal}
      onOpenChange={(open) => {
        if (!open) setshowPOModal(false)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='unitsSoldDetailsModal'>
      <form onSubmit={validation.handleSubmit(onSubmit)}>
        <DialogHeader className='pr-6'>
          <DialogTitle asChild>
            <div>
              <p className='m-0 p-0 mb-1 font-bold text-[16.25px]'>Purchase Order</p>
              <p className='m-0 p-0 font-normal text-[13px]'>Supplier: {selectedSupplier}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className='overflow-auto' style={{ minHeight: '60dvh' }}>
          <div className='flex flex-wrap -mx-3 mb-2'>
            <div className='px-3 w-full md:w-4/12'>
              <div className='mb-3 createOrder_inputs'>
                <Label htmlFor='lastNameinput' className='mb-1 text-[11.2px]'>
                  *Purchase Order Number
                </Label>
                <InputGroup>
                  <InputGroupText className='font-semibold text-[13px]' style={{ padding: '0.2rem 0.9rem' }} id='basic-addon1'>
                    {orderNumberStart}
                  </InputGroupText>
                  <Input
                    type='text'
                    className='text-[13px] h-8 text-xs'
                    style={{ padding: '0.2rem 0.9rem' }}
                    placeholder='Order Number...'
                    aria-describedby='basic-addon1'
                    id='orderNumber'
                    aria-invalid={touchedFields.orderNumber && errors.orderNumber ? true : undefined}
                    {...validation.register('orderNumber')}
                  />
                  {touchedFields.orderNumber && errors.orderNumber ? <div className='text-sm text-destructive'>{errors.orderNumber.message}</div> : null}
                </InputGroup>
              </div>
            </div>
            {!splits.isSplitting && (
              <>
                <div className='px-3 w-full md:w-4/12'>
                  <Label htmlFor='shipmentType' className='mb-2 text-[11.2px]'>
                    *Shipment Type
                  </Label>
                  <SimpleSelect
                    options={RECEIVING_SHIPMENT_TYPES}
                    selected={values.shipmentType}
                    handleSelect={(selected) => {
                      validation.setValue('shipmentType', selected as any, { shouldValidate: true, shouldTouch: true })
                      validation.setValue('destinationSC', { value: '', label: 'Select ...' }, { shouldValidate: true, shouldTouch: true })
                    }}
                    placeholder={'Select ...'}
                    customStyle='sm'
                  />
                  {errors.shipmentType && touchedFields.shipmentType ? (
                    <div className='m-0 p-0 text-danger text-[11.2px]'>*{errors.shipmentType.value?.message}</div>
                  ) : null}
                </div>
                <div className='px-3 w-full md:w-4/12'>
                  <Label htmlFor='destinationSC' className='mb-2 text-[11.2px]'>
                    *Select Destination
                  </Label>
                  <SimpleSelect
                    options={filteredWarehouses}
                    selected={values.destinationSC}
                    handleSelect={(selected) => {
                      validation.setValue('destinationSC', selected as any, { shouldValidate: true, shouldTouch: true })
                    }}
                    placeholder={isLoading ? 'Loading...' : 'Select ...'}
                    customStyle='sm'
                  />
                  {errors.destinationSC && touchedFields.destinationSC ? (
                    <div className='m-0 p-0 text-danger text-[11.2px]'>*{errors.destinationSC.value?.message}</div>
                  ) : null}
                </div>
              </>
            )}
          </div>
          {splits.isSplitting && (
            <div className='flex flex-wrap -mx-3 mb-4'>
              <Label className='mb-1 text-[13px] font-semibold'>*Select Split Destination</Label>
              {Object.entries(values.splitShipmentTypes).map(([key, split]) => (
                <div
                  className={`px-3 w-full ${MD_WIDTH_12THS[Math.round(12 / Object.entries(values.splitShipmentTypes).length)]} mb-2`}
                  key={`splitShipmentType-${key}`}>
                  <Label htmlFor={`splitShipmentType-${key}`} className='mb-1 text-[11.2px]'>
                    <span className='font-normal'>Shipment Type To: </span>
                    <span className='font-semibold'>{splitNames[`${key}`]}</span>
                  </Label>
                  <SimpleSelect
                    options={RECEIVING_SHIPMENT_TYPES}
                    selected={split}
                    handleSelect={(selected) => {
                      validation.setValue(`splitShipmentTypes.${key}` as any, selected as any, { shouldValidate: true, shouldTouch: true })
                      validation.setValue(`splitDestinations.${key}` as any, { value: '', label: 'Select ...' } as any, { shouldValidate: true, shouldTouch: true })
                    }}
                    placeholder={'Select ...'}
                    customStyle='sm'
                  />
                  {(errors.splitShipmentTypes as any)?.[key]?.value && touchedFields.splitShipmentTypes ? (
                    <div className='m-0 p-0 text-danger text-[11.2px]'>{`*${(errors.splitShipmentTypes as any)[key]?.value?.message}`}</div>
                  ) : null}
                </div>
              ))}
              {Object.entries(values.splitDestinations).map(([key, split]) => (
                <div className={`px-3 w-full ${MD_WIDTH_12THS[Math.round(12 / Object.entries(values.splitDestinations).length)]}`} key={`splitDestination-${key}`}>
                  <Label htmlFor={`splitDestination-${key}`} className='mb-1 text-[11.2px]'>
                    <span className='font-normal'>Split:: </span>
                    <span className='font-semibold'>{splitNames[`${key}`]}</span>
                  </Label>
                  <SimpleSelect
                    options={splitFilteredWarehouses(values.splitShipmentTypes[`${key}`]?.value)}
                    selected={split}
                    handleSelect={(selected) => {
                      validation.setValue(`splitDestinations.${key}` as any, selected as any, { shouldValidate: true, shouldTouch: true })
                    }}
                    placeholder={isLoading ? 'Loading...' : 'Select ...'}
                    customStyle='sm'
                  />
                  {(errors.splitDestinations as any)?.[key]?.value && touchedFields.splitDestinations ? (
                    <div className='m-0 p-0 text-danger text-[11.2px]'>{`*${(errors.splitDestinations as any)[key]?.value?.message}`}</div>
                  ) : null}
                </div>
              ))}
              {errors.splitDestinations?.root && touchedFields.splitDestinations ? (
                <p className='mb-0 mt-1 text-danger text-[11.2px]'>{`*${errors.splitDestinations.root.message}`}</p>
              ) : null}
            </div>
          )}
          <span className='text-[11.2px] text-muted-foreground'>*Select the columns you wish to print.</span>
          <div className='flex flex-row justify-evenly items-start'>
            <table className='w-full align-middle mb-0 border border-[color:var(--border)] text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[color:var(--border)] [&_td]:border [&_td]:border-[color:var(--border)] [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] [&_tbody_tr:hover]:bg-[color-mix(in_srgb,var(--vz-light)_60%,transparent)]'>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>
                    Product Comment{' '}
                    <input
                      type='checkbox'
                      className='size-4 shrink-0 border border-input-border accent-primary rounded-sm text-[11.2px]'
                      checked={printColumns.comments}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, comments: !printColumns.comments }
                        })
                      }
                    />
                  </th>
                  <th className='text-center'>
                    Qty Per Box{' '}
                    <input
                      type='checkbox'
                      className='size-4 shrink-0 border border-input-border accent-primary rounded-sm text-[11.2px]'
                      checked={printColumns.qtyPerBox}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, qtyPerBox: !printColumns.qtyPerBox }
                        })
                      }
                    />
                  </th>
                  {splits.isSplitting &&
                    Array(splits.splitsQty)
                      .fill('')
                      .map((_, splitIndex) => (
                        <th key={`splitHeader-${splitIndex}`} className='text-center'>
                          {splitNames[`${splitIndex}`]}
                        </th>
                      ))}
                  <th className='text-center'>Order Qty</th>
                  <th className='text-center'>
                    Volume{' '}
                    <input
                      type='checkbox'
                      className='size-4 shrink-0 border border-input-border accent-primary rounded-sm text-[11.2px]'
                      checked={printColumns.volume}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, volume: !printColumns.volume }
                        })
                      }
                    />
                  </th>
                  <th className='text-center'>
                    Cost{' '}
                    <input
                      type='checkbox'
                      className='size-4 shrink-0 border border-input-border accent-primary rounded-sm text-[11.2px]'
                      checked={printColumns.cost}
                      onChange={() =>
                        setprintColumns((prev) => {
                          return { ...prev, cost: !printColumns.cost }
                        })
                      }
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(reorderingPointsOrder.products).map((product) => {
                  const productVolume = product.useOrderAdjusted ? product.orderAdjusted * product.itemVolume : product.order * product.itemVolume

                  return (
                    <tr key={product.sku}>
                      <td className='text-nowrap'>{product.sku}</td>
                      <td>
                        <div
                          style={{
                            width: '40px',
                            minWidth: '30px',
                            height: '40px',
                            margin: '0px',
                            position: 'relative',
                          }}>
                          <img
                            loading='lazy'
                            src={product.image ? product.image : NoImageAdress}
                            onError={(e) => (e.currentTarget.src = NoImageAdress)}
                            alt='product Image'
                            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                          />
                        </div>
                      </td>
                      <td className='w-1/4 text-[11.2px]'>
                        {product.title}
                        <br />
                        <span className='text-[11.2px] text-muted-foreground'>{`UPC: ${product.barcode}`}</span>
                      </td>
                      <td className='flex flex-row justify-center items-end gap-1'>
                        <DebounceInput
                          element='textarea'
                          minLength={6}
                          debounceTimeout={1000}
                          className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px]'
                          style={{ scrollbarWidth: 'none' }}
                          rows={product.note === '' ? 1 : 2}
                          placeholder='Add comment...'
                          id='search-options'
                          value={product.note}
                          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                          onChange={(e) => handleAddComment(e.target.value, product.sku, product.inventoryId)}
                        />
                        {savingComment ? <Spinner className='text-success' /> : <i className={`mdi mdi-check-all text-[16.25px] m-0 p-0 text-success`} />}
                      </td>
                      <td className='text-center align-middle'>{product.boxQty}</td>
                      {splits.isSplitting &&
                        Array(splits.splitsQty)
                          .fill('')
                          .map((_, splitIndex) => (
                            <td key={`splitProduct-${product.sku}-${splitIndex}`} className='text-center align-middle'>
                              {FormatIntNumber(
                                state.currentRegion,
                                product.useOrderAdjusted ? product.orderSplits[`${splitIndex}`].orderAdjusted : product.orderSplits[`${splitIndex}`].order
                              )}
                            </td>
                          ))}
                      <td className='text-center align-middle'>{FormatIntNumber(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted : product.order)}</td>
                      <td className='text-center align-middle'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? productVolume / 61020 : productVolume / 1000000)} m³`}</td>

                      <td className='text-center align-middle'>
                        {FormatCurrency(state.currentRegion, product.useOrderAdjusted ? product.orderAdjusted * product.sellerCost : product.order * product.sellerCost)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className='font-semibold'>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className='text-center'>TOTAL</td>
                  {splits.isSplitting &&
                    Array(splits.splitsQty)
                      .fill('')
                      .map((_, splitIndex) => (
                        <td key={`splitFooter-${splitIndex}`} className='text-center align-middle'>
                          {FormatIntNumber(
                            state.currentRegion,
                            Object.values(reorderingPointsOrder.products).reduce(
                              (total, product) =>
                                total + (product.useOrderAdjusted ? product.orderSplits[`${splitIndex}`].orderAdjusted : product.orderSplits[`${splitIndex}`].order),
                              0
                            )
                          )}
                        </td>
                      ))}
                  <td className='text-center'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</td>
                  <td className='text-center'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</td>
                  <td className='text-center'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className='flex flex-wrap -mx-3 my-1'>
            <div className='px-3 w-full md:w-6/12'>
              <Label className='mb-0 text-[11.2px]'>Order Comment</Label>
              <DebounceInput
                element='textarea'
                minLength={5}
                debounceTimeout={800}
                className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px]'
                rows={1}
                placeholder='Add comment...'
                id='order-comment'
                // value={searchValue}
                onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                onChange={(e) => setorderComment(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className='items-center flex flex-row justify-end items-center gap-2'>
          <Button type='button' variant='light' onClick={() => setshowPOModal(false)}>
            Close
          </Button>
          <DropdownMenu>
            <div className='relative inline-block'>
            <DropdownMenuTrigger asChild>
              <button type='button' className='inline-flex items-center bg-primary text-white rounded px-3 py-2 text-[13px]'>
                Actions
                <ChevronDownIcon className='ml-1 size-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <PrintReorderingPointsOrder
                reorderingPointsOrder={reorderingPointsOrder}
                orderDetails={values}
                selectedSupplier={selectedSupplier}
                username={username}
                orderComment={orderComment}
                printColumns={printColumns}
                splits={splits}
                splitNames={splitNames}
              />
              <DownloadExcelReorderingPointsOrder
                reorderingPointsOrder={reorderingPointsOrder}
                orderDetails={values}
                selectedSupplier={selectedSupplier}
                username={username}
                orderComment={orderComment}
                splits={splits}
                splitNames={splitNames}
              />
            </DropdownMenuContent>
            </div>
          </DropdownMenu>
          <Button disabled={loading || savingComment} type='submit' variant='success'>
            {loading ? (
              <span>
                <Spinner className='text-white' /> Creating PO
              </span>
            ) : (
              'Create PO'
            )}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReorderingPointsCreatePOModal
