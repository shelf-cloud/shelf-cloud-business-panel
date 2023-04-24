import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import { FormatIntNumber } from '@lib/FormatNumbers'
import TooltipComponent from './constants/Tooltip'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
}

const ReceivingType = ({ data }: Props) => {
  const [serviceFee, setServiceFee] = useState('')

  useEffect(() => {
    if (data.chargesFees) {
      switch (data.carrierService) {
        case '20HQ-P':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees['20HQ-P']?.toFixed(2)}`)
          break
        case '40HQ-P':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees['40HQ-P']?.toFixed(2)}`)
          break
        case '20HQ-FL':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees['20HQ-FL']?.toFixed(2)}`)
          break
        case '40HQ-FL':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees['40HQ-FL']?.toFixed(2)}`)
          break
        case 'Pallets':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees.receivingPallets?.toFixed(2)} per pallet`)
          break
        case 'Parcel':
          setServiceFee(`${data.carrierService} - $ ${data.chargesFees.parcelBoxCost?.toFixed(2)} per box`)
          break
        default:
          setServiceFee(`Type of service...`)
      }
    }

    return () => {
      setServiceFee('')
    }
  }, [data])

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='text-muted text-nowrap'>Type of Service:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Pallets:</td>
                      <td className='fw-semibold w-100'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Boxes:</td>
                      <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Shrink Wrap:</td>
                      <td className='fw-semibold w-100'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Man Hours:</td>
                      <td className='fw-semibold w-100'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Service
                        {data.chargesFees && (
                          <>
                            <i
                              className='ri-information-fill ms-1 fs-6 text-muted'
                              id={`tooltipService${data.orderId}`}></i>
                            <TooltipComponent target={`tooltipService${data.orderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>$ {data.receivingService.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>
                        Pallets
                        {data.chargesFees && (
                          <>
                            <i
                              className='ri-information-fill ms-1 fs-6 text-muted'
                              id={`tooltipWrap${data.orderId}`}></i>
                            <TooltipComponent
                              target={`tooltipWrap${data.orderId}`}
                              text={`$ ${data.chargesFees.receivingPalletCost} per pallet`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>$ {data.receivingPallets.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Wrap Service
                        {data.chargesFees && (
                          <>
                            <i
                              className='ri-information-fill ms-1 fs-6 text-muted'
                              id={`tooltipWrap${data.orderId}`}></i>
                            <TooltipComponent
                              target={`tooltipWrap${data.orderId}`}
                              text={`$ ${data.chargesFees.receivingWrapService} per wrap`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>$ {data.receivingWrapService.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i
                              className='ri-information-fill ms-1 fs-6 text-muted'
                              id={`tooltipHour${data.orderId}`}></i>
                            <TooltipComponent
                              target={`tooltipHour${data.orderId}`}
                              text={`$ ${data.chargesFees.receivingManHour} per hour`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>$ {data.manHour.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>$ {data.extraCharge.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>$ {data.totalCharge.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
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
        <Col xl={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
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
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-50 fs-6 fw-semibold'>{product.name || ''}</td>
                        <td className='fs-6 text-muted'>{product.sku}</td>
                        <td className='text-center'>{FormatIntNumber.format(Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber.format(Number(product.qtyReceived))}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                      <td></td>
                      <td className='text-center fw-semibold fs-5 text-primary'>
                        {FormatIntNumber.format(Number(data.totalItems))}
                      </td>
                      <td className='text-center fw-semibold fs-5 text-primary'>
                        {FormatIntNumber.format(Number(data.totalReceivedItems))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className='d-flex justify-content-end align-items-end'>
          <Card className='m-0'>
            {data.proofOfShipped != '' && data.proofOfShipped != null && (
              <a href={data.proofOfShipped} target='blank'>
                <Button color='info' className='btn-label'>
                  <i className='las la-truck label-icon align-middle fs-16 me-2' />
                  Proof Of Received
                </Button>
              </a>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReceivingType
