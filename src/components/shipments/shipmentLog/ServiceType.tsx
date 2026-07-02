import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Shipment } from '@typesTs/shipments/shipments'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

type Props = {
  data: Shipment
}

const ServiceType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xs={12} lg={8}>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Service Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
        <Col xs={12} lg={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
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
        </Col>
      </Row>
    </div>
  )
}

export default ServiceType
