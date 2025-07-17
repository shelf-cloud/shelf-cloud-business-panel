import { JSX, useCallback, useEffect } from 'react'

import { usePDF } from '@react-pdf/renderer'

type UseGenerateLabelsProps = {
  pdfDocument: JSX.Element
  fileName: string
}

export const useGenerateLabels = ({ pdfDocument, fileName }: UseGenerateLabelsProps) => {
  const [pdfInstance, updateInstance] = usePDF({
    document: pdfDocument,
  })

  useEffect(() => {
    updateInstance(pdfDocument)
  }, [pdfDocument, updateInstance])

  const handleDownloadLabel = useCallback(() => {
    const link = document.createElement('a')
    link.href = pdfInstance.url!
    link.download = `${fileName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [fileName, pdfInstance.url])

  return {
    updateInstance,
    handleDownloadLabel,
  }
}
