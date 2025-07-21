import { JSX, useCallback } from 'react'

import { pdf } from '@react-pdf/renderer'

// type UseGenerateLabelsProps = {
//   pdfDocument: JSX.Element
//   fileName: string
// }

export const useGenerateLabels = () => {
  // const [pdfInstance, updateInstance] = usePDF({
  //   document: pdfDocument,
  // })

  // useEffect(() => {
  //   updateInstance(pdfDocument)
  // }, [pdfDocument, updateInstance])

  // const handleDownloadLabel = useCallback(() => {
  //   const link = document.createElement('a')
  //   link.href = pdfInstance.url!
  //   link.download = `${fileName}.pdf`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }, [fileName, pdfInstance.url])

  const downloadPDF = useCallback(async (pdfDocument: JSX.Element, fileName: string) => {
    try {
      const blob = await pdf(pdfDocument).toBlob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }, [])

  return {
    downloadPDF,
  }
}
