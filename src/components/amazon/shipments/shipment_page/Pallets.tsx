import React, { useContext } from 'react'
import { FBAShipment } from '@typesTs/amazon/fbaShipments'
import { Button, Col, Spinner } from 'reactstrap'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { CleanStatus } from '@lib/SkuFormatting'
import { WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'

type Props = {
  shipmentDetails: FBAShipment
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const Pallets = ({ shipmentDetails, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='my-3 px-3'>
      <Col sm='12' lg='8'>
        <p className='fs-5 fw-bold'>Bill of Lading (BOL)</p>
        <p>
          Print Bill of Lading (BOL) document: <span className='fw-semibold'>{shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}</span>
        </p>
        <Button disabled={watingRepsonse.printingLabel} color='primary' onClick={() => handlePrintShipmentBillOfLading(shipmentDetails.shipment.shipmentConfirmationId)}>
          {watingRepsonse.printingLabel ? (
            <span>
              <Spinner color='light' size={'sm'} className='me-1' /> Downloading BOL...
            </span>
          ) : (
            'Print BOL Document'
          )}
        </Button>
        <p className='mt-1 fs-7 text-muted'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
      </Col>

      <Col sm='12' lg='9'>
        <table className='table table-bordered'>
          <thead className='table-light'>
            <tr>
              <th>Dimensions (IN)</th>
              <th>Weight (LB)</th>
              <th>Number of pallets</th>
              <th className='text-center'>Total weight (LB)</th>
              <th className='text-center'>Stackable</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipmentPallets.pallets.map((pallet) => (
              <tr key={pallet.packageId}>
                <td>{`${pallet.dimensions.length} x ${pallet.dimensions.width} x ${pallet.dimensions.height}`}</td>
                <td>{pallet.weight.value}</td>
                <td>{pallet.quantity}</td>
                <td>{FormatIntPercentage(state.currentRegion, pallet.weight.value * pallet.quantity)}</td>
                <td>{CleanStatus(pallet.stackability)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </div>
  )
}

export default Pallets
