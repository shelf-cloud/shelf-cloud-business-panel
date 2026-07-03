import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Shipment } from '@typesTs/shipments/shipments'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

type Props = {
  data: Shipment
}

const ServiceType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full lg:w-8/12'>
          {data.extraComment != '' && (
            <div className='px-3 xl:w-full'>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Service Comment</h5>
                </CardHeader>
                <CardContent>
                  <p>{data.extraComment}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div className='px-3 w-full lg:w-4/12'>
          <div className='px-3 xl:w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
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
        </div>
      </div>
    </div>
  )
}

export default ServiceType
