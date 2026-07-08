import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Switch } from '@shadcn/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

type Props = {
  inventoryId?: number
  sku?: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA?: number
  hideReorderingPoints?: boolean
  orderFrequency?: number
  daysOfStockSC?: number
  manualLeadTime?: boolean
  leadTimeSC?: number
}

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const Supplier_Product_Details = ({
  inventoryId,
  sku,
  sellerCost,
  inboundShippingCost,
  otherCosts,
  productionTime,
  transitTime,
  shippingToFBA,
  hideReorderingPoints,
  orderFrequency,
  daysOfStockSC,
  manualLeadTime,
  leadTimeSC,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const { generate_new_forecast_products } = useRPNewForecast()

  const showReorderingPoints = Boolean(state.user[state.currentRegion]?.showReorderingPoints)
  const landedCost = sellerCost + inboundShippingCost + otherCosts || 0
  const totalLeadTime = productionTime + transitTime
  const productPageDetailsKey = `/api/products/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`

  const schema = z.object({
    inventoryId: z.number().optional(),
    sku: z.string().optional(),
    sellerCost: z.preprocess(toNumber, z.number({ error: 'Enter Cost' }).min(0, 'Minimum of 0')),
    inboundShippingCost: z.preprocess(toNumber, z.number({ error: 'Enter Cost' }).min(0, 'Minimum of 0')),
    otherCosts: z.preprocess(toNumber, z.number().min(0, 'Minimum of 0').optional()),
    productionTime: z.preprocess(toNumber, z.number({ error: 'Enter Time' }).min(0, 'Minimum of 0')),
    transitTime: z.preprocess(toNumber, z.number().min(0, 'Minimum of 0').optional()),
    shippingToFBA: z.preprocess(toNumber, z.number({ error: 'Enter Time' }).min(0, 'Minimum of 0')),
    orderFrequency: z.preprocess(toNumber, z.number({ error: 'Enter Order Frequency' }).min(0, 'Minimum of 0')),
    daysOfStockSC: z.preprocess(toNumber, z.number({ error: 'Enter Days of Stock' }).min(0, 'Minimum of 0')),
    leadTimeSC: z.preprocess(toNumber, z.number().min(0, 'Minimum of 0').optional()),
    hideReorderingPoints: z.boolean(),
    manualLeadTime: z.boolean(),
  })

  const defaultFormValues = {
    inventoryId,
    sku,
    sellerCost,
    inboundShippingCost,
    otherCosts,
    productionTime,
    transitTime,
    shippingToFBA,
    hideReorderingPoints: Boolean(hideReorderingPoints),
    orderFrequency: orderFrequency ?? 0,
    daysOfStockSC: daysOfStockSC ?? 0,
    manualLeadTime: Boolean(manualLeadTime),
    leadTimeSC: leadTimeSC ?? 0,
  }

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
  })

  useEffect(() => {
    validation.reset(defaultFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inventoryId,
    sku,
    sellerCost,
    inboundShippingCost,
    otherCosts,
    productionTime,
    transitTime,
    shippingToFBA,
    hideReorderingPoints,
    orderFrequency,
    daysOfStockSC,
    manualLeadTime,
    leadTimeSC,
  ])

  const onSubmit = async (values: z.output<typeof schema>) => {
    setisLoading(true)
    const response = await axios.post(`/api/productDetails/supplierProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      generate_new_forecast_products({
        skus: [sku || ''],
        productIds: [inventoryId || 0],
      })
      toast.success(response.data.msg)
      mutate(productPageDetailsKey)
      setShowEditFields(false)
    } else {
      toast.error(response.data.msg)
    }
    setisLoading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const handleShowEditFields = () => {
    validation.reset(defaultFormValues)
    setShowEditFields(true)
  }

  const sellerCostValue = Number(validation.watch('sellerCost')) || 0
  const inboundShippingCostValue = Number(validation.watch('inboundShippingCost')) || 0
  const otherCostsValue = Number(validation.watch('otherCosts')) || 0
  const productionTimeValue = Number(validation.watch('productionTime')) || 0
  const transitTimeValue = Number(validation.watch('transitTime')) || 0
  const hideReorderingPointsValue = validation.watch('hideReorderingPoints')
  const manualLeadTimeValue = validation.watch('manualLeadTime')
  const leadTimeSCValue = Number(validation.watch('leadTimeSC')) || 0

  return (
    <div className='py-1 w-full'>
      {!showEditFields ? (
        <div>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr className='text-center'>
                <th>Seller Cost</th>
                <th>Inbound Shipping Cost</th>
                <th>Other Costs</th>
                <th id='landedCostHead'>Landed Cost</th>
                <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                  {`Total of Seller, Inbound and Other Costs`}
                </UncontrolledTooltip>
                <th>Shipping To FBA Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center'>
                <td className={sellerCost ? '' : 'text-muted-foreground font-light italic'}>{sellerCost ? FormatCurrency(state.currentRegion, sellerCost) : 'No Cost'}</td>
                <td className={inboundShippingCost ? '' : 'text-muted-foreground font-light italic'}>
                  {inboundShippingCost ? FormatCurrency(state.currentRegion, inboundShippingCost) : 'No Cost'}
                </td>
                <td className={otherCosts ? '' : 'text-muted-foreground font-light italic'}>{otherCosts ? FormatCurrency(state.currentRegion, otherCosts) : 'No Cost'}</td>
                <td className={landedCost ? '' : 'text-muted-foreground font-light italic'}>{landedCost ? FormatCurrency(state.currentRegion, landedCost) : 'No Cost'}</td>
                <td className={shippingToFBA ? '' : 'text-muted-foreground font-light italic'}>{shippingToFBA ? FormatCurrency(state.currentRegion, shippingToFBA) : 'No Cost'}</td>
              </tr>
            </tbody>
          </table>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr className='text-center'>
                <th>{`Production Time (Days)`}</th>
                <th>{`Transit Time (Days)`}</th>
                <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                  {`Total Days from Production and Transit`}
                </UncontrolledTooltip>
                {showReorderingPoints && (
                  <>
                    <th>RP Visibility</th>
                    <th>Order Frequency</th>
                    <th>Days Of Stock After Lead Time</th>
                    <th>Manual Lead Time</th>
                    <th>Lead Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className='text-center'>
                <td className={productionTime ? '' : 'text-muted-foreground font-light italic'}>{`${productionTime ?? 'No'} Days`}</td>
                <td className={transitTime ? '' : 'text-muted-foreground font-light italic'}>{`${transitTime ?? 'No'} Days`}</td>
                <td className={totalLeadTime ? '' : 'text-muted-foreground font-light italic'}>{`${totalLeadTime ?? 'No'} Days`}</td>
                {showReorderingPoints && (
                  <>
                    <td>
                      <Badge variant={hideReorderingPoints ? 'warning' : 'success'}>{hideReorderingPoints ? 'Hidden' : 'Visible'}</Badge>
                    </td>
                    <td>{`${orderFrequency ?? 0} Weeks`}</td>
                    <td>{`${daysOfStockSC ?? 0} Days`}</td>
                    <td>{manualLeadTime ? 'On' : 'Off'}</td>
                    <td>{`${leadTimeSC ?? 0} Days`}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
          <div className='flex flex-row justify-end items-center gap-3'>
            <Button type='button' aria-label='Edit supplier details' onClick={handleShowEditFields} size='sm'>
              <i className='ri-pencil-fill text-[16.25px] m-0 p-0' />
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
              <thead>
                <tr className='text-center'>
                  <th>Seller Cost</th>
                  <th>Inbound Shipping Cost</th>
                  <th>Other Costs</th>
                  <th id='landedCostHead'>Landed Cost</th>
                  <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                    {`Total of Seller, Inbound and Other Costs`}
                  </UncontrolledTooltip>
                  <th>Shipping To FBA Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        style={{ minWidth: '60px' }}
                        placeholder='Seller Cost...'
                        id='sellerCost'
                        step={0.01}
                        aria-invalid={validation.formState.touchedFields.sellerCost && validation.formState.errors.sellerCost ? true : undefined}
                        {...validation.register('sellerCost')}
                      />
                      {validation.formState.touchedFields.sellerCost && validation.formState.errors.sellerCost ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.sellerCost.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Shipping Cost...'
                        id='inboundShippingCost'
                        step={0.01}
                        aria-invalid={validation.formState.touchedFields.inboundShippingCost && validation.formState.errors.inboundShippingCost ? true : undefined}
                        {...validation.register('inboundShippingCost')}
                      />
                      {validation.formState.touchedFields.inboundShippingCost && validation.formState.errors.inboundShippingCost ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.inboundShippingCost.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Other Cost...'
                        id='otherCosts'
                        step={0.01}
                        aria-invalid={validation.formState.touchedFields.otherCosts && validation.formState.errors.otherCosts ? true : undefined}
                        {...validation.register('otherCosts')}
                      />
                      {validation.formState.touchedFields.otherCosts && validation.formState.errors.otherCosts ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.otherCosts.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        disabled
                        type='number'
                        className='text-[13px]'
                        style={{ minWidth: '60px' }}
                        placeholder='Seller Cost...'
                        id='landedCost'
                        name='landedCost'
                        step={0.01}
                        value={Number((sellerCostValue || 0) + (inboundShippingCostValue || 0) + (otherCostsValue || 0)).toFixed(2) || 0}
                        readOnly
                      />
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='FBA Cost...'
                        id='shippingToFBA'
                        step={0.01}
                        aria-invalid={validation.formState.touchedFields.shippingToFBA && validation.formState.errors.shippingToFBA ? true : undefined}
                        {...validation.register('shippingToFBA')}
                      />
                      {validation.formState.touchedFields.shippingToFBA && validation.formState.errors.shippingToFBA ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.shippingToFBA.message}</div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
              <thead>
                <tr className='text-center'>
                  <th>{`Production Time (Days)`}</th>
                  <th>{`Transit Time (Days)`}</th>
                  <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                  <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                    {`Total Days from Production and Transit`}
                  </UncontrolledTooltip>
                  {showReorderingPoints && (
                    <>
                      <th>RP Visibility</th>
                      <th>Order Frequency</th>
                      <th>Days Of Stock After Lead Time</th>
                      <th>Manual Lead Time</th>
                      <th>Lead Time</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Production...'
                        id='productionTime'
                        aria-invalid={validation.formState.touchedFields.productionTime && validation.formState.errors.productionTime ? true : undefined}
                        {...validation.register('productionTime')}
                      />
                      {validation.formState.touchedFields.productionTime && validation.formState.errors.productionTime ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.productionTime.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Transit...'
                        id='transitTime'
                        aria-invalid={validation.formState.touchedFields.transitTime && validation.formState.errors.transitTime ? true : undefined}
                        {...validation.register('transitTime')}
                      />
                      {validation.formState.touchedFields.transitTime && validation.formState.errors.transitTime ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.transitTime.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        disabled
                        type='number'
                        className='text-[13px]'
                        placeholder='Transit...'
                        id='totalTime'
                        name='totalTime'
                        value={Number((productionTimeValue || 0) + (transitTimeValue || 0)) || 0}
                        readOnly
                      />
                    </div>
                  </td>
                  {showReorderingPoints && (
                    <>
                      <td>
                        <div className='mb-3 flex justify-center items-center pt-1'>
                          <Switch
                            checked={!hideReorderingPointsValue}
                            onCheckedChange={(checked) => validation.setValue('hideReorderingPoints', !checked, { shouldValidate: true, shouldDirty: true })}
                            aria-label='Reordering points visibility'
                          />
                        </div>
                      </td>
                      <td>
                        <div className='mb-3'>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Frequency...'
                            id='orderFrequency'
                            aria-invalid={validation.formState.touchedFields.orderFrequency && validation.formState.errors.orderFrequency ? true : undefined}
                            {...validation.register('orderFrequency')}
                          />
                          {validation.formState.touchedFields.orderFrequency && validation.formState.errors.orderFrequency ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.orderFrequency.message}</div>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className='mb-3'>
                          <Input
                            type='number'
                            className='text-[13px]'
                            placeholder='Days...'
                            id='daysOfStockSC'
                            aria-invalid={validation.formState.touchedFields.daysOfStockSC && validation.formState.errors.daysOfStockSC ? true : undefined}
                            {...validation.register('daysOfStockSC')}
                          />
                          {validation.formState.touchedFields.daysOfStockSC && validation.formState.errors.daysOfStockSC ? (
                            <div className='text-sm text-destructive'>{validation.formState.errors.daysOfStockSC.message}</div>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className='mb-3 flex justify-center items-center pt-1'>
                          <Switch
                            checked={manualLeadTimeValue}
                            onCheckedChange={(checked) => validation.setValue('manualLeadTime', checked, { shouldValidate: true, shouldDirty: true })}
                            aria-label='Manual lead time'
                          />
                        </div>
                      </td>
                      <td>
                        <div className='mb-3'>
                          <Input disabled type='number' className='text-[13px]' placeholder='Lead Time...' id='leadTimeSC' name='leadTimeSC' value={leadTimeSCValue || 0} readOnly />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
            <div className='px-3 md:w-full'>
              <div className='flex flex-row justify-end items-center gap-3'>
                <Button disabled={isLoading} type='button' variant='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit'>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default Supplier_Product_Details
