import { useCallback } from 'react'

import moment from 'moment'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'

type Props = {
  products: any[]
  activeTab: string
}

const ExportMarketplacePricing = ({ products, activeTab }: Props) => {
  const exportExcelFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')
    try {
      const worker = new Worker(new URL('./exportMarketplaceWorker.ts', import.meta.url), { type: 'module' })

      const workerPromise = new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          const { buffer, error } = e.data
          if (error) {
            reject(new Error(error))
          } else {
            resolve(buffer)
          }
        }

        worker.onerror = (error) => {
          reject(error)
        }
      })

      worker.postMessage({
        products: activeTab === 'byProducts' ? products : undefined,
        mkp_products: activeTab === 'byMarketplace' ? products : undefined,
        type: activeTab === 'byProducts' ? 'byProducts' : 'byMarketplace',
      })

      await workerPromise
        .then((buffer: any) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `MarketPlace Pricing - By Marketplace ${moment().format('LL hh:mm')}.xlsx`
          a.click()
          window.URL.revokeObjectURL(url)
        })
        .finally(() => {
          // Cleanup
          worker.terminate()
          toast.update(generatingDocument, {
            render: 'Document generated',
            type: 'success',
            isLoading: false,
            autoClose: 1000,
          })
        })
    } catch (error) {
      toast.update(generatingDocument, {
        render: 'Error generating document',
        type: 'error',
        isLoading: false,
        autoClose: 1000,
      })
      return
    }
  }, [products, activeTab])

  return (
    <Button color='primary' size='sm' className='text-nowrap fs-7' onClick={exportExcelFile}>
      <i className='mdi mdi-arrow-down-bold align-middle fs-5 me-2' />
      Export Products
    </Button>
  )
}

export default ExportMarketplacePricing
