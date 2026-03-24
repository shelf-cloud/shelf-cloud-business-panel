import { useCallback, useContext, useMemo } from 'react'

import type { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import axios from 'axios'
import { DropdownItem } from 'reactstrap'
import useSWR from 'swr'

import AppContext from '@/context/AppContext'
import { buildProductPrompt } from '@/features/reordering-points/ai-helpers'
import { BusinessPromptResponse, build_bsnss_system_prompt } from '@/features/reordering-points/business-prompt'

type Props = {
  product: ReorderingPointsProduct
}

const fetcher = async (endPoint: string) => axios.get<BusinessPromptResponse>(endPoint).then((response) => response.data)

const DownloadProductMD = ({ product }: Props) => {
  const { state } = useContext(AppContext)
  const businessId = state?.user?.businessId
  const region = state?.currentRegion
  const swrKey = businessId && region ? `/api/reorderingPoints/getBusinessPrompt?region=${region}&businessId=${businessId}` : null
  const { data } = useSWR(swrKey, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  })
  const resolvedPrompt = build_bsnss_system_prompt(data?.prompt)

  const porductPrompt = buildProductPrompt(product, {
    rpShowAWD: true,
    rpShowFBA: true,
    highAlertMax: 20,
    mediumAlertMax: 30,
    lowAlertMax: 40,
  })

  const markdown = useMemo(() => {
    if (!resolvedPrompt) return ''
    return `${resolvedPrompt}\n\nProduct Reordering Data (JSON): ${JSON.stringify(porductPrompt, null, 2)}`
  }, [resolvedPrompt, porductPrompt])

  const fileName = `${product.sku}-reordering-points.md`
  const handleDownloadFile = useCallback(() => {
    if (typeof window === 'undefined') return

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [fileName, markdown])

  return (
    <DropdownItem className='edit-item-btn' onClick={handleDownloadFile}>
      <i className='ri-download-2-line align-middle me-2 fs-5 text-black'></i>
      <span className='fs-7 fw-normal text-dark'>Download Markdown</span>
    </DropdownItem>
  )
}

export default DownloadProductMD
