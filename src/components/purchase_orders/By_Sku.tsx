import AppContext from '@context/AppContext'
import axios from 'axios'
import React, { useContext, useMemo, useState } from 'react'
import { Col, Row } from 'reactstrap'
import useSWR from 'swr'
import { PurchaseOrder, PurchaseOrderBySkus } from '@typesTs/purchaseOrders'
import Table_By_Sku from './Table_By_Sku'
import { useRouter } from 'next/router'
import SearchInput from '@components/ui/SearchInput'

type Props = {}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const By_Sku = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status }: any = router.query
  const [searchValue, setSearchValue] = useState<string>('')

  const { data }: { data?: PurchaseOrderBySkus[] } = useSWR(state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (searchValue === '') {
      return data
    }

    if (searchValue !== '') {
      const newDataTable = [] as PurchaseOrderBySkus[]
      data?.forEach((po: PurchaseOrderBySkus) => {
        if (
          po?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
          po?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
          searchValue.split(' ').every((word) => po?.title?.toLowerCase().includes(word.toLowerCase())) ||
          po?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
          po?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
        ) {
          return newDataTable.push(po)
        }
        if (po?.orders?.some((poInfo: PurchaseOrder) => poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) || poInfo?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase()))) {
          const filteredOrders = po?.orders?.filter((poInfo: PurchaseOrder) => poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) || poInfo?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase()))
          return newDataTable.push({
            sku: po.sku,
            title: po.title,
            asin: po.asin,
            barcode: po.barcode,
            image: po.image,
            orders: filteredOrders,
          })
        }
      })
      return newDataTable
    }
  }, [data, searchValue])

  return (
    <div>
      <React.Fragment>
        <Col xs={12}>
          <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-0 flex-md-row justify-content-md-end align-items-md-center'>
            <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' />
          </Row>
          <Table_By_Sku filterDataTable={filterDataTable || []} pending={data ? false : true} />
        </Col>
      </React.Fragment>
    </div>
  )
}

export default By_Sku
