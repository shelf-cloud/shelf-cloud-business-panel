import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { PurchaseOrder } from '@typesTs/purchaseOrders'

import { Button } from '@shadcn/ui/button'

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
    <Button className='text-[11.2px]' onClick={() => (purchaseOrder.hasSplitting ? exportSplitExcelFile() : exportExcelFile())}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle text-[16.25px] me-2' />
      Download Excel
    </Button>
  )
}

export default DownloadExcelPurchaseOrder
