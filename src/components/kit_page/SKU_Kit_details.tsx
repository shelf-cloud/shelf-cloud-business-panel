import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  inventoryId?: number
  sku?: string
  upc?: string
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
}

const SKU_Kit_details = ({ inventoryId, sku, upc, defaultPrice, msrp, map, floor, ceilling }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      upc,
      defaultPrice,
      msrp,
      map,
      floor,
      ceilling,
    },
    validationSchema: Yup.object({
      htsCode: Yup.string(),
      defaultPrice: Yup.number().min(0, 'Minimum of 0').required('Enter Price'),
      msrp: Yup.number().min(0, 'Minimum of 0').required('Enter MSRP'),
      map: Yup.number().min(0, 'Minimum of 0').required('Enter MAP'),
      floor: Yup.number().min(0, 'Minimum of 0').required('Enter Floor'),
      ceilling: Yup.number().min(0, 'Minimum of 0').required('Enter Ceilling'),
    }),
    onSubmit: async (values) => {
      const response = await axios.post(`/api/productDetails/skuProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  // const handleShowEditFields = () => {
  //   validation.setValues({
  //     inventoryId,
  //     sku,
  //     upc,
  //     defaultPrice,
  //     msrp,
  //     map,
  //     floor,
  //     ceilling,
  //   })
  //   setShowEditFields(true)
  // }
  return (
    <div className='py-1 w-full'>
      {!showEditFields ? (
        <div>
          <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead>
              <tr className='text-center'>
                <th>SKU</th>
                <th>UPC</th>
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
              <tr className='text-center'>
                <td>{sku}</td>
                <td>{upc}</td>
                <td>{FormatCurrency(state.currentRegion, defaultPrice)}</td>
                <td>{FormatCurrency(state.currentRegion, msrp)}</td>
                <td>{FormatCurrency(state.currentRegion, map)}</td>
                <td>{FormatCurrency(state.currentRegion, floor)}</td>
                <td>{FormatCurrency(state.currentRegion, ceilling)}</td>
                <td>
                  <div className='text-right'>{/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 text-primary m-0 p-0' style={{ cursor: 'pointer' }}></i> */}</div>
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
                        placeholder='sku...'
                        id='sku'
                        name='sku'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sku || ''}
                        aria-invalid={Boolean(validation.touched.sku && validation.errors.sku) || undefined}
                      />
                      {validation.touched.sku && validation.errors.sku ? <div className='text-sm text-destructive'>{validation.errors.sku}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        disabled
                        type='text'
                        className='h-8 text-xs'
                        placeholder='upc...'
                        id='upc'
                        name='upc'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.upc || ''}
                        aria-invalid={Boolean(validation.touched.upc && validation.errors.upc) || undefined}
                      />
                      {validation.touched.upc && validation.errors.upc ? <div className='text-sm text-destructive'>{validation.errors.upc}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='defaultPrice...'
                        id='defaultPrice'
                        name='defaultPrice'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.defaultPrice || 0}
                        aria-invalid={Boolean(validation.touched.defaultPrice && validation.errors.defaultPrice) || undefined}
                      />
                      {validation.touched.defaultPrice && validation.errors.defaultPrice ? <div className='text-sm text-destructive'>{validation.errors.defaultPrice}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='msrp...'
                        id='msrp'
                        name='msrp'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.msrp || 0}
                        aria-invalid={Boolean(validation.touched.msrp && validation.errors.msrp) || undefined}
                      />
                      {validation.touched.msrp && validation.errors.msrp ? <div className='text-sm text-destructive'>{validation.errors.msrp}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='map...'
                        id='map'
                        name='map'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.map || 0}
                        aria-invalid={Boolean(validation.touched.map && validation.errors.map) || undefined}
                      />
                      {validation.touched.map && validation.errors.map ? <div className='text-sm text-destructive'>{validation.errors.map}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='floor...'
                        id='floor'
                        name='floor'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.floor || 0}
                        aria-invalid={Boolean(validation.touched.floor && validation.errors.floor) || undefined}
                      />
                      {validation.touched.floor && validation.errors.floor ? <div className='text-sm text-destructive'>{validation.errors.floor}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='h-8 text-xs'
                        placeholder='ceilling...'
                        id='ceilling'
                        name='ceilling'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.ceilling || 0}
                        aria-invalid={Boolean(validation.touched.ceilling && validation.errors.ceilling) || undefined}
                      />
                      {validation.touched.ceilling && validation.errors.ceilling ? <div className='text-sm text-destructive'>{validation.errors.ceilling}</div> : null}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className='px-3 w-full'>
              <div className='flex flex-row justify-end items-center gap-3'>
                <Button type='button' variant='light' onClick={() => setShowEditFields(false)}>
                  Cancel
                </Button>
                <Button type='submit'>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default SKU_Kit_details
