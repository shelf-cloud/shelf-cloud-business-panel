import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Shipment } from '@typesTs/shipments/shipments'
import React, { useContext } from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
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
                <CardHeader className='py-3'>
                  <h5 className='fw-semibold m-0'>Order Comment</h5>
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
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='fs-7'>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
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
