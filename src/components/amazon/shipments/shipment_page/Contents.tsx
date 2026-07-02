import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { Col } from '@/components/migration-ui'

type Props = {
  shipmentDetails: FBAShipment
}

const Contents = ({ shipmentDetails }: Props) => {
  return (
    <div className='tw:my-4 tw:px-4'>
      <Col sm='12' lg='9'>
        <div className='tw:overflow-x-auto'>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:border tw:border-[color:var(--border)] tw:[&_td]:border-t tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr>
              <th>SKU</th>
              <th>MSKU</th>
              <th>Title</th>
              <th className='tw:text-nowrap'>Additional Information</th>
              <th className='tw:text-center tw:text-nowrap'>
                Units Expected <p className='tw:m-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>Units Located</p>
              </th>
              <th className='tw:text-center'>Status</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipmentItems.items.map((item) => (
              <tr key={item.msku}>
                <td className='tw:text-nowrap tw:font-bold'>{shipmentDetails.skus_details[item.msku].shelfcloud_sku}</td>
                <td className='tw:text-nowrap'>{item.msku}</td>
                <td>{shipmentDetails.skus_details[item.msku].title}</td>
                <td className='tw:text-nowrap'>
                  <p className='tw:m-0 tw:p-0'>ASIN: {item.asin}</p>
                  {item.asin !== item.fnsku && <p className='tw:m-0 tw:p-0'>FNSKU: {item.fnsku}</p>}
                </td>
                <td className='tw:text-center'>
                  <p className='tw:m-0 tw:font-semibold'>{item.quantity}</p>
                  <p className='tw:m-0 tw:text-primary'>{shipmentDetails.receipts && shipmentDetails.receipts[item.asin] ? shipmentDetails.receipts[item.asin].quantity : 0}</p>
                </td>
                <td className='tw:text-nowrap'>{CleanStatus(shipmentDetails.shipment.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Col>
    </div>
  )
}

export default Contents
