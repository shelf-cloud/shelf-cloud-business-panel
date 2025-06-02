import axios from 'axios'

export const convertLabelZPLToPDF = async (labelData: unknown): Promise<Buffer<ArrayBuffer>> => {
  const pdfData = await axios
    .post(
      'https://api.labelary.com/v1/printers/8dpmm/labels/4x6.1/',
      {
        file: labelData,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/pdf',
          'X-Rotation': 180,
        },
        responseType: 'arraybuffer',
      }
    )
    .then(({ data }) => {
      return data
    })
    .catch((error) => {
      console.error('Error converting label to PDF:', error)
    })

  return pdfData
}
