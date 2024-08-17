import React from 'react'
import { FBAShipment } from '@typesTs/amazon/fbaShipments'
import { Col } from 'reactstrap'

type Props = {
  shipmentDetails: FBAShipment
}

const Contents = ({ shipmentDetails }: Props) => {
  return (
    <div>
      <div className='my-3 '>
        <Col sm='12' lg='9'>
          <table className='table table-bordered'>
            <thead className='table-light'>
              <tr>
                <th>MSKU</th>
                <th>Title</th>
                <th>Additional Information</th>
                <th className='text-center'>Units Expected</th>
                <th className='text-center'>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipmentDetails.shipmentItems.items.map((item) => (
                <tr key={item.msku}>
                  <td className='text-nowrap'>{item.msku}</td>
                  <td>{shipmentDetails.skus_details[item.msku].title}</td>
                  <td className='text-nowrap'>
                    <p className='m-0 p-0'>ASIN: {item.asin}</p>
                    <p className='m-0 p-0'>FNSKU: {item.fnsku}</p>
                  </td>
                  <td className='text-center'>{item.quantity}</td>
                  <td>{shipmentDetails.shipment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Col>
      </div>
    </div>
  )
}

export default Contents
