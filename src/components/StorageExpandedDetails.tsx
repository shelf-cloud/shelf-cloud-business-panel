import { StorageRowProduct } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import StorageType from '@components/StorageType'

type Props = {
  data: StorageRowProduct
}

const StorageExpandedDetails: React.FC<
  ExpanderComponentProps<StorageRowProduct>
> = ({ data }: Props) => {
  return (
    <StorageType data={data} />
  )
}

export default StorageExpandedDetails
