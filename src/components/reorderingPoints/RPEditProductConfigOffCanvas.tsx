import { useContext, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { RPProductUpdateConfig } from '@hooks/reorderingPoints/useRPProductsInfo'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@shadcn/ui/sheet'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  rpProductConfig: RPProductConfig
  setRPProductConfig: (cb: (prev: RPProductConfig) => RPProductConfig) => void
  handleSaveProductConfig: ({
    inventoryId,
    sku,
    orderFrequency,
    leadTimeSC,
    leadTimeFBA,
    leadTimeAWD,
    daysOfStockSC,
    daysOfStockFBA,
    daysOfStockAWD,
    sellerCost,
    buffer,
  }: RPProductUpdateConfig) => Promise<void>
}

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const productConfigSchema = z.object({
  orderFrequency: z.preprocess(toNumber, z.number({ error: 'Enter Order Frequency' }).min(0, 'Minimum of 0')),
  leadTimeSC: z.preprocess(toNumber, z.number({ error: 'Enter Lead Time' }).min(0, 'Minimum of 0')),
  leadTimeFBA: z.preprocess(toNumber, z.number({ error: 'Enter Lead Time' }).min(0, 'Minimum of 0')),
  leadTimeAWD: z.preprocess(toNumber, z.number({ error: 'Enter Lead Time' }).min(0, 'Minimum of 0')),
  daysOfStockSC: z.preprocess(toNumber, z.number({ error: 'Enter Days of Stock SC' }).min(0, 'Minimum of 0')),
  daysOfStockFBA: z.preprocess(toNumber, z.number({ error: 'Enter Days of Stock FBA' }).min(0, 'Minimum of 0')),
  daysOfStockAWD: z.preprocess(toNumber, z.number({ error: 'Enter Days of Stock AWD' }).min(0, 'Minimum of 0')),
  buffer: z.preprocess(toNumber, z.number({ error: 'Enter Buffer' }).min(0, 'Minimum of 0')),
  sellerCost: z.preprocess(toNumber, z.number({ error: 'Enter Seller Cost' }).min(0, 'Minimum of 0')),
})

type ProductConfigInput = z.input<typeof productConfigSchema>
type ProductConfigValues = z.output<typeof productConfigSchema>

const RPEditProductConfigOffCanvas = ({ rpProductConfig, setRPProductConfig, handleSaveProductConfig }: Props) => {
  const { state }: any = useContext(AppContext)

  const { isOpen, product } = rpProductConfig
  const [loading, setLoading] = useState(false)

  const handleCloseCanvas = () => {
    setRPProductConfig((prev) => {
      return { ...prev, isOpen: false }
    })
  }

  const getDefaultValues = (): ProductConfigValues => ({
    orderFrequency: product.orderFrequency || 0,
    leadTimeSC: product.leadTimeSC,
    leadTimeFBA: product.leadTimeFBA || 0,
    leadTimeAWD: product.leadTimeAWD || 0,
    daysOfStockSC: product.daysOfStockSC,
    daysOfStockFBA: product.daysOfStockFBA || 0,
    daysOfStockAWD: product.daysOfStockAWD || 0,
    buffer: product.buffer || 0,
    sellerCost: product.sellerCost || 0,
  })

  const validation = useForm<ProductConfigInput, any, ProductConfigValues>({
    resolver: zodResolver(productConfigSchema),
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    validation.reset(getDefaultValues())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const onSubmit = async (values: ProductConfigValues) => {
    setLoading(true)
    await handleSaveProductConfig({
      inventoryId: product.inventoryId,
      sku: product.sku,
      orderFrequency: values.orderFrequency,
      leadTimeSC: values.leadTimeSC,
      leadTimeFBA: values.leadTimeFBA,
      leadTimeAWD: values.leadTimeAWD,
      daysOfStockSC: values.daysOfStockSC,
      daysOfStockFBA: values.daysOfStockFBA,
      daysOfStockAWD: values.daysOfStockAWD,
      buffer: values.buffer,
      sellerCost: values.sellerCost,
    }).finally(() => {
      validation.reset()
      handleCloseCanvas()
      setLoading(false)
    })
  }

  const { errors, touchedFields } = validation.formState

  return (
    <Sheet open={!!isOpen} onOpenChange={(open) => { if (!open) handleCloseCanvas() }}>
      <SheetContent side='right' aria-describedby={undefined} className='overflow-y-auto sm:max-w-md'>
        <SheetHeader className='pr-10 pb-2'>
          <SheetTitle>Product Config</SheetTitle>
        </SheetHeader>
        <div className='px-4 pb-4 pt-0'>
        <div className='flex flex-col'>
          <p className='text-[16.25px] font-bold m-0 p-0'>
            SKU: <span className='text-primary'>{rpProductConfig.product.sku}</span>
          </p>
          <p className='text-[13px] m-0 p-0 font-semibold'>{rpProductConfig.product.title}</p>
          <p className='text-[11.2px] text-muted-foreground'>Here you can edit some configurations related to the product to adjust the forecast.</p>
          <form onSubmit={validation.handleSubmit(onSubmit)}>
            <h5 className='text-[16.25px] font-bold'>Warehouse</h5>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-10/12'>
                <Label htmlFor='orderFrequency' className='text-[11.2px] mb-2'>
                  Order Frequency (Weeks)
                </Label>
                <div className='flex flex-row justify-start items-center gap-2'>
                  <Input
                    type='number'
                    className='text-[13px] h-8 text-xs'
                    id='orderFrequency'
                    aria-invalid={touchedFields.orderFrequency && errors.orderFrequency ? true : false || undefined}
                    {...validation.register('orderFrequency')}
                  />
                  <span>Weeks</span>
                </div>
                {touchedFields.orderFrequency && errors.orderFrequency ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.orderFrequency.message}</p> : null}
              </div>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-10/12'>
                <Label htmlFor='leadTimeSC' className='text-[11.2px] mb-2'>
                  Lead Time
                </Label>
                <div className='flex flex-row justify-start items-center gap-2'>
                  <Input
                    type='number'
                    className='text-[13px] h-8 text-xs'
                    id='leadTimeSC'
                    aria-invalid={touchedFields.leadTimeSC && errors.leadTimeSC ? true : false || undefined}
                    {...validation.register('leadTimeSC')}
                  />
                  <span>Days</span>
                </div>
                {touchedFields.leadTimeSC && errors.leadTimeSC ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.leadTimeSC.message}</p> : null}
              </div>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-10/12 mb-4'>
                <Label htmlFor='daysOfStockSC' className='text-[11.2px] mb-2'>
                  *Days of Stock after Lead Time
                </Label>
                <div className='flex flex-row justify-start items-center gap-2'>
                  <Input
                    type='number'
                    className='text-[13px] h-8 text-xs'
                    id='daysOfStockSC'
                    aria-invalid={touchedFields.daysOfStockSC && errors.daysOfStockSC ? true : false || undefined}
                    {...validation.register('daysOfStockSC')}
                  />
                  <span>Days</span>
                </div>
                {touchedFields.daysOfStockSC && errors.daysOfStockSC ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.daysOfStockSC.message}</p> : null}
              </div>
            </div>
            {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
              <>
                <h5 className='text-[16.25px] font-bold'>Amazon FBA</h5>
                <div className='flex flex-wrap -mx-3'>
                  <div className='px-3 w-full md:w-10/12'>
                    <Label htmlFor='leadTimeFBA' className='text-[11.2px] mb-2'>
                      Lead Time
                    </Label>
                    <div className='flex flex-row justify-start items-center gap-2'>
                      <Input
                        type='number'
                        className='text-[13px] h-8 text-xs'
                        id='leadTimeFBA'
                        aria-invalid={touchedFields.leadTimeFBA && errors.leadTimeFBA ? true : false || undefined}
                        {...validation.register('leadTimeFBA')}
                      />
                      <span>Days</span>
                    </div>
                    {touchedFields.leadTimeFBA && errors.leadTimeFBA ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.leadTimeFBA.message}</p> : null}
                  </div>
                </div>
                <div className='flex flex-wrap -mx-3'>
                  <div className='px-3 w-full md:w-10/12 mb-4'>
                    <Label htmlFor='daysOfStockFBA' className='text-[11.2px] mb-2'>
                      *Days of Stock after Lead Time
                    </Label>
                    <div className='flex flex-row justify-start items-center gap-2'>
                      <Input
                        type='number'
                        className='text-[13px] h-8 text-xs'
                        id='daysOfStockFBA'
                        aria-invalid={touchedFields.daysOfStockFBA && errors.daysOfStockFBA ? true : false || undefined}
                        {...validation.register('daysOfStockFBA')}
                      />
                      <span>Days</span>
                    </div>
                    {touchedFields.daysOfStockFBA && errors.daysOfStockFBA ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.daysOfStockFBA.message}</p> : null}
                  </div>
                </div>
              </>
            )}
            {state.user[state.currentRegion]?.rpShowAWD && (
              <>
                <h5 className='text-[16.25px] font-bold'>Amazon AWD</h5>
                <div className='flex flex-wrap -mx-3'>
                  <div className='px-3 w-full md:w-10/12'>
                    <Label htmlFor='leadTimeAWD' className='text-[11.2px] mb-2'>
                      Lead Time
                    </Label>
                    <div className='flex flex-row justify-start items-center gap-2'>
                      <Input
                        type='number'
                        className='text-[13px] h-8 text-xs'
                        id='leadTimeAWD'
                        aria-invalid={touchedFields.leadTimeAWD && errors.leadTimeAWD ? true : false || undefined}
                        {...validation.register('leadTimeAWD')}
                      />
                      <span>Days</span>
                    </div>
                    {touchedFields.leadTimeAWD && errors.leadTimeAWD ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.leadTimeAWD.message}</p> : null}
                  </div>
                </div>
                <div className='flex flex-wrap -mx-3'>
                  <div className='px-3 w-full md:w-10/12 mb-4'>
                    <Label htmlFor='daysOfStockAWD' className='text-[11.2px] mb-2'>
                      *Days of Stock after Lead Time
                    </Label>
                    <div className='flex flex-row justify-start items-center gap-2'>
                      <Input
                        type='number'
                        className='text-[13px] h-8 text-xs'
                        id='daysOfStockAWD'
                        aria-invalid={touchedFields.daysOfStockAWD && errors.daysOfStockAWD ? true : false || undefined}
                        {...validation.register('daysOfStockAWD')}
                      />
                      <span>Days</span>
                    </div>
                    {touchedFields.daysOfStockAWD && errors.daysOfStockAWD ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.daysOfStockAWD.message}</p> : null}
                  </div>
                </div>
              </>
            )}
            <h5 className='text-[16.25px] font-bold'>Extra Config</h5>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-10/12'>
                <Label htmlFor='buffer' className='text-[11.2px] mb-2'>
                  Buffer
                </Label>
                <Input
                  type='number'
                  className='text-[13px] h-8 text-xs'
                  id='buffer'
                  aria-invalid={touchedFields.buffer && errors.buffer ? true : false || undefined}
                  {...validation.register('buffer')}
                />
                {touchedFields.buffer && errors.buffer ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.buffer.message}</p> : null}
              </div>
            </div>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full md:w-10/12 mb-4'>
                <Label htmlFor='sellerCost' className='text-[11.2px] mb-2'>
                  Seller Cost
                </Label>
                <div className='flex flex-row justify-start items-center gap-2'>
                  <span>$</span>
                  <Input
                    type='number'
                    className='text-[13px] h-8 text-xs'
                    id='sellerCost'
                    aria-invalid={touchedFields.sellerCost && errors.sellerCost ? true : false || undefined}
                    {...validation.register('sellerCost')}
                  />
                </div>
                {touchedFields.sellerCost && errors.sellerCost ? <p className='m-0 p-0 text-[11.2px] text-danger'>{errors.sellerCost.message}</p> : null}
              </div>
            </div>
            <p className='text-[11.2px] text-muted-foreground'>*The number of days you want to have of stock in addition to the lead time.</p>
            <div className='flex flex-wrap -mx-3 mt-4'>
              <div className='px-3 md:w-full'>
                <div className='text-right'>
                  <Button disabled={loading} type='submit' variant='success' className='text-[11.2px]'>
                    {loading ? (
                      <span>
                        <Spinner className='text-white' /> Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RPEditProductConfigOffCanvas
