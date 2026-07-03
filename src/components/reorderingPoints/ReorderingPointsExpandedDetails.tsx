import React from 'react'

import { ExpandedRowProps } from '@hooks/reorderingPoints/useRPProductSale'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { ExpanderComponentProps } from 'react-data-table-component'
import ReorderingPointsSalesDetails from './ReorderingPointsSalesDetails'
import ReorderingPointsTimelineDetails from './ReorderingPointsTimelineDetails'

type Props = {
  data: ReorderingPointsProduct
  expandedRowProps?: ExpandedRowProps
}

const ReorderingPointsExpandedDetails: React.FC<ExpanderComponentProps<ReorderingPointsProduct>> = ({ data, expandedRowProps }: Props) => {
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <div className='flex flex-wrap -mx-3'>
        <ReorderingPointsSalesDetails data={data} expandedRowProps={expandedRowProps} />
        <ReorderingPointsTimelineDetails data={data} expandedRowProps={expandedRowProps} />
      </div>
    </div>
  )
}

export default ReorderingPointsExpandedDetails
