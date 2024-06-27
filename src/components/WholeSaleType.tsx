import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import TooltipComponent from './constants/Tooltip'
import IndividualUnitsPlanModal from './modals/orders/shipments/IndividualUnitsPlanModal'
import AppContext from '@context/AppContext'
import UploadIndividualUnitsLabelsModal from './modals/orders/shipments/UploadIndividualUnitsLabelsModal'
import { FormatCurrency } from '@lib/FormatNumbers'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
}

const WholeSaleType = ({ data }: Props) => {
  const { state, setIndividualUnitsPlan, setUploadIndividualUnitsLabelsModal }: any = useContext(AppContext)
  const [serviceFee, setServiceFee] = useState('')

  useEffect(() => {
    if (data.chargesFees) {
      switch (true) {
        case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`)
          break
        case !data.isIndividualUnits && data.carrierService == 'LTL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet`)
          break
        case data.isIndividualUnits:
          setServiceFee(
            `
          ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.individualUnitCost!)} per unit
          ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box
          ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet
          `
          )
          break
        default:
          setServiceFee(`Type of service...`)
      }
    }

    return () => {
      setServiceFee('')
    }
  }, [data, state.currentRegion])
  const OrderId = data.orderId?.replace(/[\-\,\(\)\/\s\.\:\;]/g, '')

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
                      <td className='text-muted text-nowrap'>Service Requested:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Used:</td>
                      <td className='fw-semibold w-100'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Pallets:</td>
                      <td className='fw-semibold w-100'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Boxes:</td>
                      <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                    </tr>
                    {data.isThird && (
                      <tr>
                        <td className='text-muted text-nowrap'>Third Party Shipping Info:</td>
                        <td className='fw-semibold w-100'>{data.thirdInfo}</td>
                      </tr>
                    )}
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
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipPick${OrderId}`}></i>
                            <TooltipComponent target={`tooltipPick${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Labeling
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipLabel${OrderId}`}></i>
                            <TooltipComponent target={`tooltipLabel${OrderId}`} text={`$ ${data.chargesFees.labelCost} per label`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.labeling!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipManHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipManHour${OrderId}`} text={`$ ${data.chargesFees.receivingManHour} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>
                        {data.isIndividualUnits && data.individualUnitsPlan?.state == 'Pending' ? 'Pending' : `${FormatCurrency(state.currentRegion, data.totalCharge!)}`}
                      </td>
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
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-75 fs-6 fw-semibold'>{product.name || ''}</td>
                        <td className='fs-6 text-muted'>{product.sku}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td className='text-end fs-5 fw-bold text-nowrap'>Total QTY</td>
                      <td className='text-center fw-bold fs-5 text-primary'>{data.totalItems}</td>
                    </tr>
                    {data.totalIndividualUnits! > 0 && (
                      <tr>
                        <td></td>
                        <td className='text-end fs-6 fw-normal text-nowrap'>{data.isIndividualUnits ? 'Total Individual Units' : 'Total Individual Units in Kits'}</td>
                        <td className='text-center fw-bold fs-6 text-primary'>{data.totalIndividualUnits}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className='d-flex justify-content-end align-items-end gap-2'>
          {data.proofOfShipped != '' && data.proofOfShipped != null && (
            <a href={data.proofOfShipped} target='blank'>
              <Button color='info' className='btn-label'>
                <i className='las la-truck label-icon align-middle fs-3 me-2' />
                Proof Of Shipped
              </Button>
            </a>
          )}

          {data.isIndividualUnits && (
            <Button
              disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
              color='info'
              className='btn-label'
              onClick={() => setIndividualUnitsPlan(!state.showIndividualUnitsPlan)}>
              <i className='las la-boxes label-icon align-middle fs-3 me-2' />
              {data.individualUnitsPlan?.state == 'Pending' ? 'Waiting for plan...' : 'Individual Units Plan'}
            </Button>
          )}
          {data.labelsName != '' && (
            <a
              href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.labelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
              target='blank'>
              <Button color='secondary' className='btn-label'>
                <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                FBA Labels
              </Button>
            </a>
          )}
          {data.palletLabelsName != '' && (
            <a
              href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.palletLabelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
              target='blank'>
              <Button color='secondary' className='btn-label'>
                <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                Pallet Labels
              </Button>
            </a>
          )}
          {(data.labelsName == '' || (data.numberPallets > 0 && data.palletLabelsName == '')) && (
            <Button
              disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
              color='secondary'
              className='btn-label'
              onClick={() => setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)}>
              <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
              Upload Labels
            </Button>
          )}
        </Col>
      </Row>
      {state.showIndividualUnitsPlan && <IndividualUnitsPlanModal individualUnitsPlan={data.individualUnitsPlan!} />}
      {state.showUploadIndividualUnitsLabelsModal && <UploadIndividualUnitsLabelsModal data={data} />}
    </div>
  )
}

export default WholeSaleType
