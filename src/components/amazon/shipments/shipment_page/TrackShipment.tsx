import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { Col } from '@/components/migration-ui'

type Props = {
  shipmentDetails: FBAShipment
}

const TrackShipment = ({ shipmentDetails }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='tw:my-4 tw:px-4'>
      <Col sm='12' lg='8'>
        <table className='table table-bordered'>
          <thead className='table-light'>
            <tr>
              <th>Box #</th>
              <th>FBA Box Label #</th>
              <th>thacking ID #</th>
              <th>Status</th>
              <th>Weight (lb)</th>
              <th>Dimensions (in)</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipment.trackingDetails?.spdTrackingDetail?.spdTrackingItems?.map((tracking, boxIndex) => (
              <tr key={tracking.boxId}>
                <td>{boxIndex + 1}</td>
                <td>{tracking.boxId}</td>
                <td>{tracking.trackingId}</td>
                <td className='tw:text-success tw:font-semibold'>Confirmed</td>
                <td>
                  {shipmentDetails.shipmentBoxes.boxes[boxIndex]?.weight.value
                    ? FormatIntPercentage(state.currentRegion, shipmentDetails.shipmentBoxes.boxes[boxIndex]?.weight.value)
                    : 'N/A'}
                </td>
                <td>
                  {shipmentDetails.shipmentBoxes.boxes[boxIndex]?.dimensions.height
                    ? `${shipmentDetails.shipmentBoxes.boxes[boxIndex]?.dimensions.height} x ${shipmentDetails.shipmentBoxes.boxes[boxIndex]?.dimensions.width} x ${shipmentDetails.shipmentBoxes.boxes[boxIndex]?.dimensions.length}`
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </div>
  )
}

export default TrackShipment
