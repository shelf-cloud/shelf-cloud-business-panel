import React, { useContext } from 'react'
import { DropdownItem } from 'reactstrap'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import AppContext from '@context/AppContext'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { buildSplitTemplate, buildTemplate } from '@components/purchase_orders/helperFunctions'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  orderDetails: {
    orderNumber: string
    destinationSC: { value: string; label: string }
    splitDestinations: { [k: string]: { value: string; label: string } }
  }
  selectedSupplier: string
  username: string
  orderComment: string
  splits: { isSplitting: boolean; splitsQty: number }
  splitNames: SplitNames
}

const DownloadExcelReorderingPointsOrder = ({ reorderingPointsOrder, orderDetails, selectedSupplier, username, orderComment, splits, splitNames }: Props) => {
  const { state }: any = useContext(AppContext)

  const exportExcelFile = async () => {
    await buildTemplate({
      username,
      orderNumber: orderDetails.orderNumber,
      user: {
        name: state.user.name,
        contactName: state.user.us.contactName,
        address: state.user.us.address,
        city: state.user.us.city,
        state: state.user.us.state,
        zipcode: state.user.us.zipcode,
        country: state.user.us.country,
        phone: state.user.us.phone,
        email: state.user.us.email,
        website: state.user.us.website,
      },
      supplier: selectedSupplier,
      orderItems: reorderingPointsOrder.products,
      totalQty: reorderingPointsOrder.totalQty,
      orderComment,
    })
  }
  const exportSplitExcelFile = async () => {
    await buildSplitTemplate({
      username,
      orderNumber: orderDetails.orderNumber,
      user: {
        name: state.user.name,
        contactName: state.user.us.contactName,
        address: state.user.us.address,
        city: state.user.us.city,
        state: state.user.us.state,
        zipcode: state.user.us.zipcode,
        country: state.user.us.country,
        phone: state.user.us.phone,
        email: state.user.us.email,
        website: state.user.us.website,
      },
      supplier: selectedSupplier,
      orderItems: reorderingPointsOrder.products,
      totalQty: reorderingPointsOrder.totalQty,
      orderComment,
      splits,
      splitNames,
    })
  }

  return (
    <DropdownItem className='text-nowrap text-primary fs-6 py-0' onClick={() => (splits.isSplitting ? exportSplitExcelFile() : exportExcelFile())}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </DropdownItem>
  )
}

export default DownloadExcelReorderingPointsOrder
