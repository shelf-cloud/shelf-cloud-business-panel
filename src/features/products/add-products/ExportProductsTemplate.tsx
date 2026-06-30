import { useCallback, useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DropdownItem } from 'reactstrap'

import { Product } from '@typings'
import { ReorderingPointsResponse } from '@typesTs/reorderingPoints/reorderingPoints'

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
  const { state }: any = useContext(AppContext)

  const getProductsForExport = useCallback(async () => {
    if (feedType !== 'reorderingPoint') return products

    const response = await axios.get<ReorderingPointsResponse>(`/api/reorderingPoints/get-reordering-points-products?region=${state.currentRegion}&businessId=${state.user.businessId}`)

    if (response.data.error || !response.data.data) {
      throw new Error(response.data.message || 'Error fetching reordering point products')
    }

    const selectedSkus = new Set(products.map((product) => product.sku))

    return Object.values(response.data.data)
      .filter((product) => selectedSkus.has(product.sku))
      .map(
        (product) =>
          ({
            sku: product.sku,
            identifiers: null,
            recommendedDaysOfStock: product.recommendedDaysOfStock,
            hideReorderingPoints: product.hideReorderingPoints,
            orderFrequency: product.orderFrequency,
            leadTimeSC: product.leadTimeSC,
            daysOfStockSC: product.daysOfStockSC,
            manualLeadTime: product.manualLeadTime ?? 0,
          }) as Product
      )
  }, [feedType, products, state.currentRegion, state.user.businessId])

  const exportExcelFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')
    const worker = new Worker(new URL('./exportProductsTemplateWorker.ts', import.meta.url), { type: 'module' })
    const feedDefinition = PRODUCT_FEED_DEFINITIONS[feedType]

    try {
      const productsForExport = await getProductsForExport()
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

        worker.postMessage({ products: productsForExport, brands, suppliers, categories, feedType })
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
  }, [brands, categories, feedType, getProductsForExport, suppliers])

  return (
    <DropdownItem className='text-nowrap text-info' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-6 me-2' />
      {selected ? `Export Selected ${PRODUCT_FEED_DEFINITIONS[feedType].label}` : `Export All ${PRODUCT_FEED_DEFINITIONS[feedType].label}`}
    </DropdownItem>
  )
}

export default ExportProductsTemplate
