import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'

type Props = {
  shipmentDetails: FBAShipment
}

const Contents = ({ shipmentDetails }: Props) => {
  return (
    <div className='my-4 px-4'>
      <div className='px-3 sm:w-full lg:w-9/12'>
        <div className='overflow-x-auto'>
        <table className='w-full align-middle mb-0 border border-[color:var(--border)] [&_td]:border-t [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr>
              <th>SKU</th>
              <th>MSKU</th>
              <th>Title</th>
              <th className='text-nowrap'>Additional Information</th>
              <th className='text-center text-nowrap'>
                Units Expected <p className='m-0 text-[11.2px] text-muted-foreground'>Units Located</p>
              </th>
              <th className='text-center'>Status</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipmentItems.items.map((item) => (
              <tr key={item.msku}>
                <td className='text-nowrap font-bold'>{shipmentDetails.skus_details[item.msku].shelfcloud_sku}</td>
                <td className='text-nowrap'>{item.msku}</td>
                <td>{shipmentDetails.skus_details[item.msku].title}</td>
                <td className='text-nowrap'>
                  <p className='m-0 p-0'>ASIN: {item.asin}</p>
                  {item.asin !== item.fnsku && <p className='m-0 p-0'>FNSKU: {item.fnsku}</p>}
                </td>
                <td className='text-center'>
                  <p className='m-0 font-semibold'>{item.quantity}</p>
                  <p className='m-0 text-primary'>{shipmentDetails.receipts && shipmentDetails.receipts[item.asin] ? shipmentDetails.receipts[item.asin].quantity : 0}</p>
                </td>
                <td className='text-nowrap'>{CleanStatus(shipmentDetails.shipment.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

export default Contents
