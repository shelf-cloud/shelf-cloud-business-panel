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
    <div className='w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px 10px' }}>
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
            <CardHeader className='py-4'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className='text-[11.2px]'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-b py-2'>
                        <td className='w-3/4 font-semibold'>{product.name || ''}</td>
                        <td className='text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className='bg-light text-[13px]'>
                      <td></td>
                      <td className='text-right font-bold text-nowrap'>Total</td>
                      <td className='text-center font-bold text-primary'>{data.totalItems}</td>
                    </tr>
                    {data.totalIndividualUnits! > 0 && (
                      <tr className='bg-light text-[13px]'>
                        <td></td>
                        <td className='text-right font-normal text-nowrap'>{data.isIndividualUnits ? 'Total Individual Units' : 'Total Individual Units in Kits'}</td>
                        <td className='text-center font-bold text-primary'>{data.totalIndividualUnits}</td>
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
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='w-full [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Service Requested:</td>
                      <td className='font-semibold w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Service Used:</td>
                      <td className='font-semibold w-full'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Pallets:</td>
                      <td className='font-semibold w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Boxes:</td>
                      <td className='font-semibold w-full'>{data.numberBoxes}</td>
                    </tr>
                    {data.isThird && (
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] text-nowrap'>Third Party Shipping Info:</td>
                        <td className='font-semibold w-full'>{data.thirdInfo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className='px-1 text-[11.2px]'>
                  <span className='m-0 text-[var(--bs-secondary-color)] text-[11.2px]'>Tracking No.</span>
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
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='text-[11.2px]'>
                    <tr className='border-b pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[color:var(--bs-secondary-color)]' id={`tooltipPick${OrderId}`}></i>
                            <TooltipComponent target={`tooltipPick${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Labeling
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[color:var(--bs-secondary-color)]' id={`tooltipLabel${OrderId}`}></i>
                            <TooltipComponent target={`tooltipLabel${OrderId}`} text={`$ ${data.chargesFees.labelCost} per label`} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.labeling!)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[color:var(--bs-secondary-color)]' id={`tooltipManHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipManHour${OrderId}`} text={`$ ${data.chargesFees.receivingManHour} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-right'>
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
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
          {showActions && (
            <Row>
              <Col xl={12} className='flex flex-row flex-wrap justify-start items-end gap-2'>
                {data.proofOfShipped != '' && data.proofOfShipped != null && (
                  <a href={data.proofOfShipped} target='blank' rel='noopener noreferrer'>
                    <Button color='info' className='btn-label btn-sm text-[11.2px] text-nowrap'>
                      <i className='las la-truck label-icon align-middle text-[19.5px] me-2' />
                      Proof Of Shipped
                    </Button>
                  </a>
                )}

                {data.isIndividualUnits && (
                  <Button
                    disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
                    color='info'
                    className='btn-label btn-sm text-[11.2px] text-nowrap'
                    onClick={() => setIndividualUnitsPlan(!state.showIndividualUnitsPlan)}>
                    <i className='las la-boxes label-icon align-middle text-[22.75px] me-2' />
                    {data.individualUnitsPlan?.state == 'Pending' ? 'Waiting for plan...' : 'Individual Units Plan'}
                  </Button>
                )}
                {data.labelsName != '' && (
                  <a
                    href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.labelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                    target='blank'
                    rel='noopener noreferrer'>
                    <Button color='secondary' className='btn-label btn-sm text-[11.2px] text-nowrap'>
                      <i className='las la-toilet-paper label-icon align-middle text-[19.5px] me-2' />
                      FBA Labels
                    </Button>
                  </a>
                )}
                {data.palletLabelsName != '' && (
                  <a
                    href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.palletLabelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                    target='blank'
                    rel='noopener noreferrer'>
                    <Button color='secondary' className='btn-label btn-sm text-[11.2px] text-nowrap'>
                      <i className='las la-toilet-paper label-icon align-middle text-[19.5px] me-2' />
                      Pallet Labels
                    </Button>
                  </a>
                )}
                {(data.labelsName == '' || (data.numberPallets > 0 && data.palletLabelsName == '')) && (
                  <Button
                    disabled={data.individualUnitsPlan?.state == 'Pending' ? true : false}
                    color='secondary'
                    className='btn-label btn-sm text-[11.2px] text-nowrap'
                    onClick={() => setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)}>
                    <i className='las la-toilet-paper label-icon align-middle text-[19.5px] me-2' />
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
