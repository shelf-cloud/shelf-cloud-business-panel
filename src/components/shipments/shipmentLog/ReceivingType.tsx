import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

type Props = {
  data: Shipment
}

const ReceivingType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='tw:w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <Row>
        <Col xs={12} lg={8}>
          <Card>
            <CardHeader className='tw:py-4'>
              <h5 className='tw:font-semibold tw:m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='tw:text-center' scope='col'>
                        Qty
                      </th>
                      <th className='tw:text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className='tw:text-[11.2px]'>
                    {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                      <tr key={key} className='tw:border-b tw:border-[color:var(--border)] tw:py-2'>
                        <td className='tw:w-1/2 tw:font-semibold'>{product.title || product.name}</td>
                        <td className='tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                      </tr>
                    ))}
                    <tr className='tw:bg-[color:var(--vz-light)]'>
                      <td></td>
                      <td className='tw:text-start tw:text-[13px] tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:text-center tw:font-semibold tw:text-[13px] tw:text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='tw:text-center tw:font-semibold tw:text-[13px] tw:text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Receiving Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Type of Service:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Pallets:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Boxes:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Shrink Wrap:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Man Hours:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Service</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingService)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Pallets</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Wrap Service</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Man Hour</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.manHour)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReceivingType
