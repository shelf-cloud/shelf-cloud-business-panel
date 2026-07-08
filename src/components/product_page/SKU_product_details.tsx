import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

import { useRPNewForecast } from '@/hooks/reorderingPoints/useRPNewForcast'

type Props = {
  inventoryId?: number
  sku?: string
  upc?: string
  htsCode: string
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
}

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const SKU_product_details = ({ inventoryId, sku, upc, htsCode, defaultPrice, msrp, map, floor, ceilling }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const { generate_new_forecast_products } = useRPNewForecast()

  const schema = z.object({
    inventoryId: z.number().optional(),
    sku: z.string().optional(),
    upc: z.string().optional(),
    htsCode: z.string().optional(),
    defaultPrice: z.preprocess(toNumber, z.number({ error: 'Enter Price' }).min(0, 'Minimum of 0')),
    msrp: z.preprocess(toNumber, z.number({ error: 'Enter MSRP' }).min(0, 'Minimum of 0')),
    map: z.preprocess(toNumber, z.number({ error: 'Enter MAP' }).min(0, 'Minimum of 0')),
    floor: z.preprocess(toNumber, z.number({ error: 'Enter Floor' }).min(0, 'Minimum of 0')),
    ceilling: z.preprocess(toNumber, z.number({ error: 'Enter Ceilling' }).min(0, 'Minimum of 0')),
  })

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      inventoryId,
      sku,
      upc,
      htsCode,
      defaultPrice,
      msrp,
      map,
      floor,
      ceilling,
    },
  })

  useEffect(() => {
    validation.reset({ inventoryId, sku, upc, htsCode, defaultPrice, msrp, map, floor, ceilling })
  }, [inventoryId, sku, upc, htsCode, defaultPrice, msrp, map, floor, ceilling])

  const onSubmit = async (values: z.output<typeof schema>) => {
    setisLoading(true)
    const response = await axios.post(`/api/productDetails/skuProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      productInfo: values,
    })
    if (!response.data.error) {
      generate_new_forecast_products({
        skus: [sku || ''],
        productIds: [inventoryId || 0],
      })
      toast.success(response.data.msg)
      mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      setShowEditFields(false)
    } else {
      toast.error(response.data.msg)
    }
    setisLoading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const handleShowEditFields = () => {
    validation.reset({
      inventoryId,
      sku,
      upc,
      htsCode,
      defaultPrice,
      msrp,
      map,
      floor,
      ceilling,
    })
    setShowEditFields(true)
  }
  return (
    <div className='py-1 w-full'>
      {!showEditFields ? (
        <div>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr className='text-center'>
                <th>SKU</th>
                <th>UPC</th>
                <th>HTS Code</th>
                <th>Default Price</th>
                <th id='msrpHead'>MSRP</th>
                <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='bg-white text-primary shadow'>
                  {`Manufacturer's Suggested Retail Price`}
                </UncontrolledTooltip>
                <th id='mapHead'>MAP</th>
                <UncontrolledTooltip placement='top' target='mapHead' innerClassName='bg-white text-primary shadow'>
                  {`Minimum Advertised Price`}
                </UncontrolledTooltip>
                <th id='minSalePriceHead'>Floor</th>
                <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='bg-white text-primary shadow'>
                  {`Minimum Sale Price`}
                </UncontrolledTooltip>
                <th id='maxSalePriceHead'>Ceilling</th>
                <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='bg-white text-primary shadow'>
                  {`Maximum Sale Price`}
                </UncontrolledTooltip>
                <th scope='col' aria-label='SKU row actions'></th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center text-nowrap'>
                <td>{sku}</td>
                <td>{upc}</td>
                <td>{htsCode}</td>
                <td>{FormatCurrency(state.currentRegion, defaultPrice)}</td>
                <td>{FormatCurrency(state.currentRegion, msrp)}</td>
                <td>{FormatCurrency(state.currentRegion, map)}</td>
                <td>{FormatCurrency(state.currentRegion, floor)}</td>
                <td>{FormatCurrency(state.currentRegion, ceilling)}</td>
                <td>
                  <div className='text-right'>
                    <button type='button' aria-label='Edit SKU details' onClick={handleShowEditFields} className='p-0 border-0 bg-transparent'>
                      <i className='ri-pencil-fill text-[16.25px] text-primary m-0 p-0'></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
              <thead>
                <tr className='text-center'>
                  <th>SKU</th>
                  <th>UPC</th>
                  <th>HTS Code</th>
                  <th>Default Price</th>
                  <th id='msrpHead'>MSRP</th>
                  <UncontrolledTooltip placement='top' target='msrpHead' innerClassName='bg-white text-primary shadow'>
                    {`Manufacturer's Suggested Retail Price`}
                  </UncontrolledTooltip>
                  <th id='mapHead'>MAP</th>
                  <UncontrolledTooltip placement='top' target='mapHead' innerClassName='bg-white text-primary shadow'>
                    {`Minimum Advertised Price`}
                  </UncontrolledTooltip>
                  <th id='minSalePriceHead'>Floor</th>
                  <UncontrolledTooltip placement='top' target='minSalePriceHead' innerClassName='bg-white text-primary shadow'>
                    {`Minimum Sale Price`}
                  </UncontrolledTooltip>
                  <th id='maxSalePriceHead'>Ceilling</th>
                  <UncontrolledTooltip placement='top' target='maxSalePriceHead' innerClassName='bg-white text-primary shadow'>
                    {`Maximum Sale Price`}
                  </UncontrolledTooltip>
                </tr>
              </thead>
              <tbody>
                <tr className='text-center'>
                  <td>
                    <div className='mb-3'>
                      <Input
                        disabled
                        type='text'
                        className='h-8 text-xs'
                        style={{ minWidth: '80px' }}
                        placeholder='sku...'
                        id='sku'
                        aria-invalid={Boolean(validation.formState.touchedFields.sku && validation.formState.errors.sku) || undefined}
                        {...validation.register('sku')}
                      />
                      {validation.formState.touchedFields.sku && validation.formState.errors.sku ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.sku.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        disabled
                        type='text'
                        className='h-8 text-xs'
                        style={{ minWidth: '80px' }}
                        placeholder='upc...'
                        id='upc'
                        aria-invalid={Boolean(validation.formState.touchedFields.upc && validation.formState.errors.upc) || undefined}
                        {...validation.register('upc')}
                      />
                      {validation.formState.touchedFields.upc && validation.formState.errors.upc ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.upc.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='text'
                        className='h-8 text-xs'
                        style={{ minWidth: '80px' }}
                        placeholder='HTS Code...'
                        id='htsCode'
                        aria-invalid={Boolean(validation.formState.touchedFields.htsCode && validation.formState.errors.htsCode) || undefined}
                        {...validation.register('htsCode')}
                      />
                      {validation.formState.touchedFields.htsCode && validation.formState.errors.htsCode ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.htsCode.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='defaultPrice...'
                        id='defaultPrice'
                        step={0.01}
                        aria-invalid={Boolean(validation.formState.touchedFields.defaultPrice && validation.formState.errors.defaultPrice) || undefined}
                        {...validation.register('defaultPrice')}
                      />
                      {validation.formState.touchedFields.defaultPrice && validation.formState.errors.defaultPrice ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.defaultPrice.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='msrp...'
                        id='msrp'
                        step={0.01}
                        aria-invalid={Boolean(validation.formState.touchedFields.msrp && validation.formState.errors.msrp) || undefined}
                        {...validation.register('msrp')}
                      />
                      {validation.formState.touchedFields.msrp && validation.formState.errors.msrp ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.msrp.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='map...'
                        id='map'
                        step={0.01}
                        aria-invalid={Boolean(validation.formState.touchedFields.map && validation.formState.errors.map) || undefined}
                        {...validation.register('map')}
                      />
                      {validation.formState.touchedFields.map && validation.formState.errors.map ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.map.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='floor...'
                        id='floor'
                        step={0.01}
                        aria-invalid={Boolean(validation.formState.touchedFields.floor && validation.formState.errors.floor) || undefined}
                        {...validation.register('floor')}
                      />
                      {validation.formState.touchedFields.floor && validation.formState.errors.floor ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.floor.message}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='ceilling...'
                        id='ceilling'
                        step={0.01}
                        aria-invalid={Boolean(validation.formState.touchedFields.ceilling && validation.formState.errors.ceilling) || undefined}
                        {...validation.register('ceilling')}
                      />
                      {validation.formState.touchedFields.ceilling && validation.formState.errors.ceilling ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.ceilling.message}</div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className='px-3 w-full'>
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

export default SKU_product_details
