import AppContext from '@context/AppContext'
import axios from 'axios'
import React, { useContext, useMemo, useState } from 'react'
import { Col, Row } from 'reactstrap'
import useSWR from 'swr'
import Table_By_Orders from './Table_By_Orders'
import { PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { useRouter } from 'next/router'
import SearchInput from '@components/ui/searchInput'

type Props = {}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const By_Purchase_Orders = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status }: any = router.query
  const [searchValue, setSearchValue] = useState<string>('')

  const { data }: { data?: PurchaseOrder[] } = useSWR(state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (searchValue === '') {
      return data
    }

    if (searchValue !== '') {
      let newDataTable = data?.filter(
        (po: PurchaseOrder) =>
          po?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
          po?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          po?.poItems?.some(
            (item: PurchaseOrderItem) =>
              item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
              searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
              item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
              item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
              item?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
          )
      )

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
          <Table_By_Orders filterDataTable={filterDataTable || []} pending={data ? false : true} />
        </Col>
      </React.Fragment>
    </div>
  )
}

export default By_Purchase_Orders
