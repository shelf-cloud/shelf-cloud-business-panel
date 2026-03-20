import { useCallback } from 'react'

import { Product } from '@typings'
import { toast } from 'react-toastify'
import { DropdownItem } from 'reactstrap'

type Props = {
  products: Product[]
}

const ExportProductsFile = ({ products }: Props) => {
  const exportExcelFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')

    const worker = new Worker(new URL('./exportProductsFileWorker.ts', import.meta.url), { type: 'module' })

    try {
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer | null; error: string | null }>) => {
          const { buffer: workbookBuffer, error } = event.data

          if (error || !workbookBuffer) {
            reject(new Error(error || 'Failed to generate workbook'))
            return
          }

          resolve(workbookBuffer)
        }

        worker.onerror = (error) => {
          reject(error)
        }

        worker.postMessage({ products })
      })

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'Product Details.xlsx'
      anchor.click()

      toast.update(generatingDocument, {
        render: 'Document generated',
        type: 'success',
        isLoading: false,
        autoClose: 1000,
      })

      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.update(generatingDocument, {
        render: 'Error generating document',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
      })
    } finally {
      worker.terminate()
    }
  }, [products])

  return (
    <DropdownItem className='text-primary' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
      Export Products
    </DropdownItem>
  )
}

export default ExportProductsFile
