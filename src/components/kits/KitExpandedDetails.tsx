import React from 'react'

import { KitRow } from '@typings'
import { ExpanderComponentProps } from 'react-data-table-component'

import KitType from './KitType'

type Props = {
  data: KitRow
}

const KitExpandedDetails: React.FC<ExpanderComponentProps<KitRow>> = ({ data }: Props) => {
  return <KitType data={data} />
}

export default KitExpandedDetails
