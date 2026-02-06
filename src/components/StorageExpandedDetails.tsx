import React from 'react'

import StorageType from '@components/StorageType'
import { StorageRowProduct } from '@typings'
import { ExpanderComponentProps } from 'react-data-table-component'

type Props = {
  data: StorageRowProduct
}

const StorageExpandedDetails: React.FC<ExpanderComponentProps<StorageRowProduct>> = ({ data }: Props) => {
  return <StorageType data={data} />
}

export default StorageExpandedDetails
