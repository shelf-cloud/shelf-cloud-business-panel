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
    <div className='my-4 px-4'>
      <Col sm='12' lg='8'>
        <div className='overflow-x-auto'>
        <table className='w-full align-middle mb-0 border border-[color:var(--border)] [&_td]:border-t [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead className='bg-[color:var(--vz-light)]'>
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
                <td className='text-success font-semibold'>Confirmed</td>
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
        </div>
      </Col>
    </div>
  )
}

export default TrackShipment
