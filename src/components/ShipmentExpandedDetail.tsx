import { OrderRowType } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import WholeSaleType from './WholeSaleType'
import ReceivingType from './ReceivingType'
import ShipmentType from './ShipmentType'
import ReturnType from './ReturnType'

type Props = {
  data: OrderRowType,
  apiMutateLink?: string
}

const ShipmentExpandedDetail: React.FC<
  ExpanderComponentProps<OrderRowType>
> = ({ data, apiMutateLink }: Props) => {
  return (
    <div>
      {data.orderType == 'Shipment' && <ShipmentType data={data} />}
      {data.orderType == 'Return' && <ReturnType data={data} apiMutateLink={apiMutateLink} />}
      {data.orderType == 'Wholesale' && <WholeSaleType data={data} />}
      {data.orderType == 'Receiving' && <ReceivingType data={data} apiMutateLink={apiMutateLink} />}
    </div>
  )
}

export default ShipmentExpandedDetail
