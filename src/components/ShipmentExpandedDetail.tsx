import { OrderRowType } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import ReceivingType from './ReceivingType'

type Props = {
  data: OrderRowType
  mutateReturns?: () => void
}

const ShipmentExpandedDetail: React.FC<ExpanderComponentProps<OrderRowType>> = ({ data, mutateReturns }: Props) => {
  return <div>{data.orderType == 'Receiving' && <ReceivingType data={data} mutateReturns={mutateReturns} />}</div>
}

export default ShipmentExpandedDetail
