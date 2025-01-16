import * as Yup from 'yup'

const RECEIVING_FILE_HEADERS = ['Sku', 'Quantity to Receive']

const RECEIVING_FILE_HEADERS_LENGTH = 2

let skuInFile: string[] = []

export const validateReceivingFile = async (resultValues: any, validSkuList: string[]) => {
  let errorsList = []

  if (resultValues.length <= 1) {
    errorsList.push({ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' })
    return errorsList
  }

  const headerRow = resultValues[0] as any
  if (headerRow.length !== RECEIVING_FILE_HEADERS_LENGTH) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Missing Columns' })
    return errorsList
  }

  if (headerRow.join(',') !== RECEIVING_FILE_HEADERS.join(',')) {
    errorsList.push({ errorLine: 0, errorMessage: 'Columns not matching file type.', value: 'Invalid Columns' })
    return errorsList
  }

  for (let i = 1; i < resultValues.length; i++) {
    const rowValues = resultValues[i] as any
    if (rowValues[0] != '' && rowValues[0] != null) {
      for (let v = 0; v < rowValues.length; v++) {
        switch (v) {
          // SKU
          case 0:
            const skuSchema = Yup.object().shape({
              sku: Yup.string()
                .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: " ' @ ~ , ...`)
                .min(4)
                .max(50)
                .required('SKU is required'),
            })
            skuSchema.isValidSync({ sku: rowValues[v] })
              ? () => {}
              : errorsList.push({ errorLine: i + 1, errorMessage: `SKU: Required - No Spaces - Invalid Special characters: " ' @ ~ , ...`, value: rowValues[v] })
            const skuValidSchema = Yup.object().shape({
              sku: Yup.string()
                .test('is-valid-sku', 'SKU is not in the valid SKU list', (value) => validSkuList.includes(value!))
                .required('SKU is required'),
            })
            skuValidSchema.isValidSync({ sku: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: `SKU: Not a valid SKU`, value: rowValues[v] })
            const skuDuplicatedSchema = Yup.object().shape({
              sku: Yup.string()
                .test('is-duplicated-sku', 'SKU is duplicated', (value) => !skuInFile.includes(value!))
                .required('SKU is required'),
            })
            skuDuplicatedSchema.isValidSync({ sku: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: `SKU: Duplicated SKU`, value: rowValues[v] })
            skuInFile.push(rowValues[v])
            break
          // title
          case 1:
            if (rowValues[v] != null && rowValues[v] !== '') {
              const widthSchema = Yup.object().shape({
                width: Yup.number().min(0.001).required('Qty is required'),
              })
              widthSchema.isValidSync({ width: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Quantity: Required - Greater or Equal than 0', value: rowValues[v] })
            }
            break
          default:
          // code block
        }
      }
    }
  }

  skuInFile = []
  return errorsList
}
