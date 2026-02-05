import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { PurchaseOrder } from '@typesTs/purchaseOrders'
import { Button } from 'reactstrap'

import { buildSplitsTemplatePO, buildTemplatePO } from './helperFunctions'

type Props = {
  purchaseOrder: PurchaseOrder
}

const DownloadExcelPurchaseOrder = ({ purchaseOrder }: Props) => {
  const { state }: any = useContext(AppContext)

  const exportExcelFile = async () => {
    await buildTemplatePO({
      state,
      purchaseOrder,
    })
  }
  const exportSplitExcelFile = async () => {
    await buildSplitsTemplatePO({
      state,
      purchaseOrder,
    })
  }

  return (
    <Button color='primary' className='btn-label fs-7' onClick={() => (purchaseOrder.hasSplitting ? exportSplitExcelFile() : exportExcelFile())}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Download Excel
    </Button>
  )
}

export default DownloadExcelPurchaseOrder
