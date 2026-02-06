import { useCallback } from 'react'

import { type SPSCommerceBusinessInfo, type SPSCommerceItem } from '@hooks/integrations/useSPSCommerceIntegrations'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'

type Props = {
  integrationInfo: SPSCommerceBusinessInfo
  items: SPSCommerceItem[]
  warehouseId: string
  disabled?: boolean
  color?: string
}

const GenerateSPSCommerceFileButton = ({ integrationInfo, items, warehouseId, disabled = false, color = 'primary' }: Props) => {
  const generateFile = useCallback(async () => {
    const generatingDocument = toast.loading('Generating document...')
    try {
      const worker = new Worker(new URL('./generateSPSCommerceFileWorker.ts', import.meta.url), { type: 'module' })

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
        integrationInfo,
        items,
        warehouseId,
      })

      const currentDate = moment().format('YYYYMMDD')

      await workerPromise
        .then((buffer: any) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${currentDate}.xlsx`
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
  }, [integrationInfo, items, warehouseId])

  return (
    <Button color={color} size='sm' className='text-nowrap' onClick={generateFile} disabled={disabled}>
      <i className='mdi mdi-arrow-down-bold align-middle fs-5 me-2' />
      Generate File
    </Button>
  )
}

export default GenerateSPSCommerceFileButton
