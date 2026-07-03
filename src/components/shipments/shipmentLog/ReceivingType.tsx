import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import { Card, CardHeader, CardContent } from '@shadcn/ui/card'

type Props = {
  data: Shipment
}

const ReceivingType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full lg:w-8/12'>
          <Card>
            <CardHeader className='py-4'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className='text-[11.2px]'>
                    {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                      <tr key={key} className='border-b border-[color:var(--border)] py-2'>
                        <td className='w-1/2 font-semibold'>{product.title || product.name}</td>
                        <td className='text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                      </tr>
                    ))}
                    <tr className='bg-[color:var(--vz-light)]'>
                      <td></td>
                      <td className='text-start text-[13px] font-bold text-nowrap'>Total</td>
                      <td className='text-center font-semibold text-[13px] text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='text-center font-semibold text-[13px] text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='px-3 w-full lg:w-4/12'>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Receiving Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Type of Service:</td>
                      <td className='font-semibold w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Pallets:</td>
                      <td className='font-semibold w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Boxes:</td>
                      <td className='font-semibold w-full'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Shrink Wrap:</td>
                      <td className='font-semibold w-full'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Man Hours:</td>
                      <td className='font-semibold w-full'>{data.manHours}</td>
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
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Service</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Pallets</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Wrap Service</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Man Hour</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          {data.extraComment != '' && (
            <div className='px-3 w-full'>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardContent>
                  <p>{data.extraComment}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceivingType
