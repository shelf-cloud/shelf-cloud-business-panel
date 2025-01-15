import { OrderRowType } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import ReceivingType from './receiving/ReceivingType'

type Props = {
  data: OrderRowType
  mutateReceivings?: () => void
}

const ShipmentExpandedDetail: React.FC<ExpanderComponentProps<OrderRowType>> = ({ data, mutateReceivings }: Props) => {
  return <div>{data.orderType == 'Receiving' && <ReceivingType data={data} mutateReceivings={mutateReceivings} />}</div>
}

export default ShipmentExpandedDetail
