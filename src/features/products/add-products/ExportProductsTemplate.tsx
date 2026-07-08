import { useCallback } from 'react'

import { toast } from '@/lib/toast'

import { Product } from '@typings'

import { DropdownMenuItem } from '@shadcn/ui/dropdown-menu'

import { PRODUCT_FEED_DEFINITIONS, ProductFeedType } from './productFeedDefinitions'

type Props = {
  products: Product[]
  brands: string[]
  suppliers: string[]
  categories: string[]
  selected: boolean
  feedType?: ProductFeedType
}

const ExportProductsTemplate = ({ products, brands, suppliers, categories, selected, feedType = 'general' }: Props) => {
  const exportExcelFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')
    const worker = new Worker(new URL('./exportProductsTemplateWorker.ts', import.meta.url), { type: 'module' })
    const feedDefinition = PRODUCT_FEED_DEFINITIONS[feedType]

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

        worker.postMessage({ products, brands, suppliers, categories, feedType })
      })

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = feedDefinition.filename
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
  }, [brands, categories, feedType, products, suppliers])

  return (
    <DropdownMenuItem className='text-nowrap text-info' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle text-[13px] me-2' />
      {selected ? `Export Selected ${PRODUCT_FEED_DEFINITIONS[feedType].label}` : `Export All ${PRODUCT_FEED_DEFINITIONS[feedType].label}`}
    </DropdownMenuItem>
  )
}

export default ExportProductsTemplate
