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
}

const GenerateReceivingLabels = ({ finalBoxesConfiguration, orderBarcode, fileName, children }: PropsWithChildren<Props>) => {
  const { state } = useContext(AppContext)
  const { warehouses } = useWarehouses()
  const { handleDownloadLabel } = useGenerateLabels({
    pdfDocument: warehouses ? (
      <PrintReceivingLabel
        companyName={state.user.name}
        prefix3PL={state.user.prefix3PL}
        warehouse={warehouses?.find((w) => w.warehouseId === state.receivingFromPo.warehouse.id)!}
        boxes={finalBoxesConfiguration}
        orderBarcode={orderBarcode}
      />
    ) : (
      <div>Loading...</div>
    ),
    fileName: fileName,
  })

  const handleDownload = () => {
    handleDownloadLabel()
  }

  return warehouses ? <div onClick={handleDownload}>{children}</div> : null
}

export default GenerateReceivingLabels
