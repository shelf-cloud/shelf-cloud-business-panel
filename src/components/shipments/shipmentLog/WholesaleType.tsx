import { useContext, useMemo } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import IndividualUnitsPlanModal from '@components/modals/orders/shipments/IndividualUnitsPlanModal'
import UploadIndividualUnitsLabelsModal from '@components/modals/orders/shipments/UploadIndividualUnitsLabelsModal'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import { Button, Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

import ShipmentCarrierStatusBar from './ShipmentCarrierStatusBar'
import ShipmentTrackingNumber from './ShipmentTrackingNumber'

type Props = {
  data: Shipment
  showActions: boolean
  mutateShipment?: () => void
}

const WholesaleType = ({ data, showActions, mutateShipment }: Props) => {
  const { state, setIndividualUnitsPlan, setUploadIndividualUnitsLabelsModal }: any = useContext(AppContext)

  const serviceFee = useMemo(() => {
    if (data.chargesFees) {
      switch (true) {
        case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`
        case !data.isIndividualUnits && data.carrierService == 'LTL':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet`
        case data.isIndividualUnits:
          return `
            ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.individualUnitCost!)} per unit
            ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box
            ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet
            `
        default:
          return `Type of service...`
      }
    }

    return ''
  }, [data, state.currentRegion])

  const OrderId = CleanSpecialCharacters(data.orderId!)

  return (
    <div className='tw:w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px 10px' }}>
      {data.carrierStatus && (
        <Row className=''>
          <Col xs={12}>
            <ShipmentCarrierStatusBar carrier={data.carrierUsed} currentStatus={data.carrierStatus} />
          </Col>
        </Row>
      )}

      <Row>
        <Col xl={8}>
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
                    </tr>
                  </thead>
                  <tbody className='tw:text-[11.2px]'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='tw:border-b tw:py-2'>
                        <td className='tw:w-3/4 tw:font-semibold'>{product.name || ''}</td>
                        <td className='tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='tw:text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className='tw:bg-light tw:text-[13px]'>
                      <td></td>
                      <td className='tw:text-right tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:text-center tw:font-bold tw:text-primary'>{data.totalItems}</td>
                    </tr>
                    {data.totalIndividualUnits! > 0 && (
                      <tr className='tw:bg-light tw:text-[13px]'>
                        <td></td>
                        <td className='tw:text-right tw:font-normal tw:text-nowrap'>{data.isIndividualUnits ? 'Total Individual Units' : 'Total Individual Units in Kits'}</td>
                        <td className='tw:text-center tw:font-bold tw:text-primary'>{data.totalIndividualUnits}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Service Requested:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Service Used:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Pallets:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Boxes:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberBoxes}</td>
                    </tr>
                    {data.isThird && (
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Third Party Shipping Info:</td>
                        <td className='tw:font-semibold tw:w-full'>{data.thirdInfo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className='tw:px-1 tw:text-[11.2px]'>
                  <span className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Tracking No.</span>
                  <ShipmentTrackingNumber
                    orderStatus={data.orderStatus}
                    orderType={data.orderType}
                    trackingNumber={data.trackingNumber}
                    trackingLink={data.trackingLink}
                    carrierIcon={data.carrierIcon}
                    carrierService={data.carrierService}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap tw:mb-0'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipPick${OrderId}`}></i>
                            <TooltipComponent target={`tooltipPick${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Labeling
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipLabel${OrderId}`}></i>
                            <TooltipComponent target={`tooltipLabel${OrderId}`} text={`$ ${data.chargesFees.labelCost} per label`} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.labeling!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipManHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipManHour${OrderId}`} text={`$ ${data.chargesFees.receivingManHour} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-right'>
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
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
          {showActions && (
            <Row>
              <Col xl={12} className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-end tw:gap-2'>
                {data.proofOfShipped != '' && data.proofOfShipped != null && (
                  <a href={data.proofOfShipped} target='blank' rel='noopener noreferrer'>
                    <Button color='info' className='btn-label btn-sm tw:text-[11.2px] tw:text-nowrap'>
                      <i className='las la-truck label-icon align-middle fs-4 me-2' />
                      Proof Of Shipped
                    </Button>
                  </a>
                )}

                {data.isIndividualUnits && (
                  <Button
                    disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
                    color='info'
                    className='btn-label btn-sm tw:text-[11.2px] tw:text-nowrap'
                    onClick={() => setIndividualUnitsPlan(!state.showIndividualUnitsPlan)}>
                    <i className='las la-boxes label-icon align-middle fs-3 me-2' />
                    {data.individualUnitsPlan?.state == 'Pending' ? 'Waiting for plan...' : 'Individual Units Plan'}
                  </Button>
                )}
                {data.labelsName != '' && (
                  <a
                    href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.labelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                    target='blank'
                    rel='noopener noreferrer'>
                    <Button color='secondary' className='btn-label btn-sm tw:text-[11.2px] tw:text-nowrap'>
                      <i className='las la-toilet-paper label-icon align-middle fs-4 me-2' />
                      FBA Labels
                    </Button>
                  </a>
                )}
                {data.palletLabelsName != '' && (
                  <a
                    href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.palletLabelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                    target='blank'
                    rel='noopener noreferrer'>
                    <Button color='secondary' className='btn-label btn-sm tw:text-[11.2px] tw:text-nowrap'>
                      <i className='las la-toilet-paper label-icon align-middle fs-4 me-2' />
                      Pallet Labels
                    </Button>
                  </a>
                )}
                {(data.labelsName == '' || (data.numberPallets > 0 && data.palletLabelsName == '')) && (
                  <Button
                    disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
                    color='secondary'
                    className='btn-label btn-sm tw:text-[11.2px] tw:text-nowrap'
                    onClick={() => setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)}>
                    <i className='las la-toilet-paper label-icon align-middle fs-4 me-2' />
                    Upload Labels
                  </Button>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      {state.showIndividualUnitsPlan && <IndividualUnitsPlanModal individualUnitsPlan={data.individualUnitsPlan!} />}
      {state.showUploadIndividualUnitsLabelsModal && <UploadIndividualUnitsLabelsModal data={data} mutateShipment={mutateShipment} />}
    </div>
  )
}

export default WholesaleType
