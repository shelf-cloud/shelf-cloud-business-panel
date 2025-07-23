import { PropsWithChildren, useContext } from 'react'

import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { FinalBoxConfiguration } from '@hooks/receivings/useReceivingsBoxes'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'

import PrintReceivingLabel from './labels/PrintReceivingLabel'

type Props = {
  finalBoxesConfiguration: FinalBoxConfiguration[]
  orderBarcode: string
  fileName: string
  warehouseId: number
  isManualReceiving: boolean
}

const GenerateReceivingLabels = ({ finalBoxesConfiguration, orderBarcode, fileName, warehouseId, isManualReceiving, children }: PropsWithChildren<Props>) => {
  const { state } = useContext(AppContext)
  const { warehouses } = useWarehouses()
  const { downloadPDF } = useGenerateLabels()

  const handleDownload = () => {
    downloadPDF(
      <PrintReceivingLabel
        companyName={state.user.name}
        prefix3PL={state.user.prefix3PL}
        warehouse={warehouses?.find((w) => w.warehouseId === warehouseId)!}
        boxes={finalBoxesConfiguration}
        orderBarcode={orderBarcode}
        isManualReceiving={isManualReceiving}
      />,
      fileName
    )
  }

  return warehouses ? <div onClick={handleDownload}>{children}</div> : null
}

export default GenerateReceivingLabels
