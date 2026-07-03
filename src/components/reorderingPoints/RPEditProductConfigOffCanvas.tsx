import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { RPProductUpdateConfig } from '@hooks/reorderingPoints/useRPProductsInfo'
import { useFormik } from 'formik'
import * as Yup from 'yup'

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

const RPEditProductConfigOffCanvas = ({ rpProductConfig, setRPProductConfig, handleSaveProductConfig }: Props) => {
  const { state }: any = useContext(AppContext)

  const { isOpen, product } = rpProductConfig
  const [loading, setLoading] = useState(false)

  const handleCloseCanvas = () => {
    setRPProductConfig((prev) => {
      return { ...prev, isOpen: false }
    })
  }

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      orderFrequency: product.orderFrequency || 0,
      leadTimeSC: product.leadTimeSC,
      leadTimeFBA: product.leadTimeFBA || 0,
      leadTimeAWD: product.leadTimeAWD || 0,
      daysOfStockSC: product.daysOfStockSC,
      daysOfStockFBA: product.daysOfStockFBA || 0,
      daysOfStockAWD: product.daysOfStockAWD || 0,
      buffer: product.buffer || 0,
      sellerCost: product.sellerCost || 0,
    },
    validationSchema: Yup.object({
      orderFrequency: Yup.number().min(0, 'Minimum of 0').required('Enter Order Frequency'),
      leadTimeSC: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      leadTimeFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      leadTimeAWD: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      daysOfStockSC: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock SC'),
      daysOfStockFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock FBA'),
      daysOfStockAWD: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock AWD'),
      buffer: Yup.number().min(0, 'Minimum of 0').required('Enter Buffer'),
      sellerCost: Yup.number().min(0, 'Minimum of 0').required('Enter Seller Cost'),
    }),
    onSubmit: async (values, { resetForm }) => {
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
        resetForm()
        handleCloseCanvas()
        setLoading(false)
      })
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

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
          <form onSubmit={handleAddProduct}>
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
                    name='orderFrequency'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderFrequency}
                    aria-invalid={validation.touched.orderFrequency && validation.errors.orderFrequency ? true : false || undefined}
                  />
                  <span>Weeks</span>
                </div>
                {validation.touched.orderFrequency && validation.errors.orderFrequency ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.orderFrequency}</p> : null}
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
                    name='leadTimeSC'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.leadTimeSC}
                    aria-invalid={validation.touched.leadTimeSC && validation.errors.leadTimeSC ? true : false || undefined}
                  />
                  <span>Days</span>
                </div>
                {validation.touched.leadTimeSC && validation.errors.leadTimeSC ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.leadTimeSC}</p> : null}
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
                    name='daysOfStockSC'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.daysOfStockSC || ''}
                    aria-invalid={validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? true : false || undefined}
                  />
                  <span>Days</span>
                </div>
                {validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.daysOfStockSC}</p> : null}
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
                        name='leadTimeFBA'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.leadTimeFBA}
                        aria-invalid={validation.touched.leadTimeFBA && validation.errors.leadTimeFBA ? true : false || undefined}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.leadTimeFBA && validation.errors.leadTimeFBA ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.leadTimeFBA}</p> : null}
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
                        name='daysOfStockFBA'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.daysOfStockFBA || ''}
                        aria-invalid={validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? true : false || undefined}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.daysOfStockFBA}</p> : null}
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
                        name='leadTimeAWD'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.leadTimeAWD}
                        aria-invalid={validation.touched.leadTimeAWD && validation.errors.leadTimeAWD ? true : false || undefined}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.leadTimeAWD && validation.errors.leadTimeAWD ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.leadTimeAWD}</p> : null}
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
                        name='daysOfStockAWD'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.daysOfStockAWD || ''}
                        aria-invalid={validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? true : false || undefined}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.daysOfStockAWD}</p> : null}
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
                  name='buffer'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.buffer || ''}
                  aria-invalid={validation.touched.buffer && validation.errors.buffer ? true : false || undefined}
                />
                {validation.touched.buffer && validation.errors.buffer ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.buffer}</p> : null}
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
                    name='sellerCost'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.sellerCost || ''}
                    aria-invalid={validation.touched.sellerCost && validation.errors.sellerCost ? true : false || undefined}
                  />
                </div>
                {validation.touched.sellerCost && validation.errors.sellerCost ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.sellerCost}</p> : null}
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
