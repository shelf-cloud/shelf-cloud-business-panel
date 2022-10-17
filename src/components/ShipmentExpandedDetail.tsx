import { OrderRowType } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import WholeSaleType from './WholeSaleType'
import ReceivingType from './ReceivingType'
import ShipmentType from './ShipmentType'

type Props = {
  data: OrderRowType
}

const ShipmentExpandedDetail: React.FC<
  ExpanderComponentProps<OrderRowType>
> = ({ data }: Props) => {
  return (
    <div>
      {data.orderType == 'Shipment' && <ShipmentType data={data} />}
      {data.orderType == 'Wholesale' && <WholeSaleType data={data} />}
      {data.orderType == 'Receiving' && <ReceivingType data={data} />}
    </div>
  )
}

export default ShipmentExpandedDetail
