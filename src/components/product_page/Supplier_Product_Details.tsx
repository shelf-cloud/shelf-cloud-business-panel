import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

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
}

const Supplier_Product_Details = ({ inventoryId, sku, sellerCost, inboundShippingCost, otherCosts, productionTime, transitTime, shippingToFBA }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [isLoading, setisLoading] = useState(false)

  const { generate_new_forecast_products } = useRPNewForecast()

  const landedCost = sellerCost + inboundShippingCost + otherCosts || 0
  const totalLeadTime = productionTime + transitTime

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      sellerCost,
      inboundShippingCost,
      otherCosts,
      productionTime,
      transitTime,
      shippingToFBA,
    },
    validationSchema: Yup.object({
      sellerCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      inboundShippingCost: Yup.number().min(0, 'Minimum of 0').required('Enter Cost'),
      otherCosts: Yup.number().min(0, 'Minimum of 0'),
      productionTime: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
      transitTime: Yup.number().min(0, 'Minimum of 0'),
      shippingToFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Time'),
    }),
    onSubmit: async (values) => {
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
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
      setisLoading(false)
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleShowEditFields = () => {
    validation.setValues({
      inventoryId,
      sku,
      sellerCost,
      inboundShippingCost,
      otherCosts,
      productionTime,
      transitTime,
      shippingToFBA,
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
                <th>Seller Cost</th>
                <th>Inbound Shipping Cost</th>
                <th>Other Costs</th>
                <th id='landedCostHead'>Landed Cost</th>
                <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                  {`Total of Seller, Inbound and Other Costs`}
                </UncontrolledTooltip>
                <th>{`Production Time (Days)`}</th>
                <th>{`Transit Time (Days)`}</th>
                <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                  {`Total Days from Production and Transit`}
                </UncontrolledTooltip>
                <th>Shipping To FBA Cost</th>
                <th scope='col' aria-label='Supplier row actions'></th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center'>
                <td className={sellerCost ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{sellerCost ? FormatCurrency(state.currentRegion, sellerCost) : 'No Cost'}</td>
                <td className={inboundShippingCost ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>
                  {inboundShippingCost ? FormatCurrency(state.currentRegion, inboundShippingCost) : 'No Cost'}
                </td>
                <td className={otherCosts ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{otherCosts ? FormatCurrency(state.currentRegion, otherCosts) : 'No Cost'}</td>
                <td className={landedCost ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{landedCost ? FormatCurrency(state.currentRegion, landedCost) : 'No Cost'}</td>
                <td className={productionTime ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{`${productionTime ?? 'No'} Days`}</td>
                <td className={transitTime ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{`${transitTime ?? 'No'} Days`}</td>
                <td className={totalLeadTime ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{`${totalLeadTime ?? 'No'} Days`}</td>
                <td className={shippingToFBA ? '' : 'text-[color:var(--bs-secondary-color)] font-light italic'}>{shippingToFBA ? FormatCurrency(state.currentRegion, shippingToFBA) : 'No Cost'}</td>
                <td>
                  <div className='text-right'>
                    <button type='button' aria-label='Edit supplier details' onClick={handleShowEditFields} className='p-0 border-0 bg-transparent'>
                      <i className='ri-pencil-fill text-[16.25px] m-0 p-0 text-primary'></i>
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
                  <th>Seller Cost</th>
                  <th>Inbound Shipping Cost</th>
                  <th>Other Costs</th>
                  <th id='landedCostHead'>Landed Cost</th>
                  <UncontrolledTooltip placement='top' target='landedCostHead' innerClassName='bg-white text-primary shadow'>
                    {`Total of Seller, Inbound and Other Costs`}
                  </UncontrolledTooltip>
                  <th>{`Production Time (Days)`}</th>
                  <th>{`Transit Time (Days)`}</th>
                  <th id='leadTimeHead'>{`Total Lead Time (Days)`}</th>
                  <UncontrolledTooltip placement='top' target='leadTimeHead' innerClassName='bg-white text-primary shadow'>
                    {`Total Days from Production and Transit`}
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
                        name='sellerCost'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.sellerCost || 0}
                        aria-invalid={validation.touched.sellerCost && validation.errors.sellerCost ? true : undefined}
                      />
                      {validation.touched.sellerCost && validation.errors.sellerCost ? <div className='text-sm text-destructive'>{validation.errors.sellerCost}</div> : null}
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Shipping Cost...'
                        id='inboundShippingCost'
                        name='inboundShippingCost'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.inboundShippingCost || 0}
                        aria-invalid={validation.touched.inboundShippingCost && validation.errors.inboundShippingCost ? true : undefined}
                      />
                      {validation.touched.inboundShippingCost && validation.errors.inboundShippingCost ? (
                        <div className='text-sm text-destructive'>{validation.errors.inboundShippingCost}</div>
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
                        name='otherCosts'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.otherCosts || 0}
                        aria-invalid={validation.touched.otherCosts && validation.errors.otherCosts ? true : undefined}
                      />
                      {validation.touched.otherCosts && validation.errors.otherCosts ? <div className='text-sm text-destructive'>{validation.errors.otherCosts}</div> : null}
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
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={Number(validation.values.sellerCost + validation.values.inboundShippingCost + validation.values.otherCosts).toFixed(2) || 0}
                      />
                    </div>
                  </td>
                  <td>
                    <div className='mb-3'>
                      <Input
                        type='number'
                        className='text-[13px]'
                        placeholder='Production...'
                        id='productionTime'
                        name='productionTime'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.productionTime || 0}
                        aria-invalid={validation.touched.productionTime && validation.errors.productionTime ? true : undefined}
                      />
                      {validation.touched.productionTime && validation.errors.productionTime ? (
                        <div className='text-sm text-destructive'>{validation.errors.productionTime}</div>
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
                        name='transitTime'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.transitTime || 0}
                        aria-invalid={validation.touched.transitTime && validation.errors.transitTime ? true : undefined}
                      />
                      {validation.touched.transitTime && validation.errors.transitTime ? <div className='text-sm text-destructive'>{validation.errors.transitTime}</div> : null}
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
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={Number(validation.values.productionTime + validation.values.transitTime) || 0}
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
                        name='shippingToFBA'
                        step={0.01}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.shippingToFBA || 0}
                        aria-invalid={validation.touched.shippingToFBA && validation.errors.shippingToFBA ? true : undefined}
                      />
                      {validation.touched.shippingToFBA && validation.errors.shippingToFBA ? <div className='text-sm text-destructive'>{validation.errors.shippingToFBA}</div> : null}
                    </div>
                  </td>
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
