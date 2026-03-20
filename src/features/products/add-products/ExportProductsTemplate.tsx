import { useCallback } from 'react'

import { toast } from 'react-toastify'
import { DropdownItem } from 'reactstrap'

import { Product } from '@typings'

type Props = {
  products: Product[]
  brands: string[]
  suppliers: string[]
  categories: string[]
  selected: boolean
}

const ExportProductsTemplate = ({ products, brands, suppliers, categories, selected }: Props) => {
  const exportExcelFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')
    const worker = new Worker(new URL('./exportProductsTemplateWorker.ts', import.meta.url), { type: 'module' })

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

        worker.postMessage({ products, brands, suppliers, categories })
      })

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'Product Details Template.xlsx'
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
  }, [brands, categories, products, suppliers])

  return (
    <DropdownItem className='text-nowrap text-info' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-6 me-2' />
      {selected ? 'Export Selected Products Template' : 'Export All Products Template'}
    </DropdownItem>
  )
}

export default ExportProductsTemplate
