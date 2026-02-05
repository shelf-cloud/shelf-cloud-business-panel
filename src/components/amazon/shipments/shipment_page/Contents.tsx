import React from 'react'

import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { Col } from 'reactstrap'

type Props = {
  shipmentDetails: FBAShipment
}

const Contents = ({ shipmentDetails }: Props) => {
  return (
    <div className='my-3 px-3'>
      <Col sm='12' lg='9'>
        <table className='table table-bordered'>
          <thead className='table-light'>
            <tr>
              <th>SKU</th>
              <th>MSKU</th>
              <th>Title</th>
              <th className='text-nowrap'>Additional Information</th>
              <th className='text-center text-nowrap'>
                Units Expected <p className='m-0 fs-7 text-muted'>Units Located</p>
              </th>
              <th className='text-center'>Status</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipmentItems.items.map((item) => (
              <tr key={item.msku}>
                <td className='text-nowrap fw-bold'>{shipmentDetails.skus_details[item.msku].shelfcloud_sku}</td>
                <td className='text-nowrap'>{item.msku}</td>
                <td>{shipmentDetails.skus_details[item.msku].title}</td>
                <td className='text-nowrap'>
                  <p className='m-0 p-0'>ASIN: {item.asin}</p>
                  {item.asin !== item.fnsku && <p className='m-0 p-0'>FNSKU: {item.fnsku}</p>}
                </td>
                <td className='text-center'>
                  <p className='m-0 fw-semibold'>{item.quantity}</p>
                  <p className='m-0 text-primary'>{shipmentDetails.receipts && shipmentDetails.receipts[item.asin] ? shipmentDetails.receipts[item.asin].quantity : 0}</p>
                </td>
                <td className='text-nowrap'>{CleanStatus(shipmentDetails.shipment.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </div>
  )
}

export default Contents
