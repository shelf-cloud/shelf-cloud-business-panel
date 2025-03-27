import AppContext from '@context/AppContext'
import axios from 'axios'
import React, { useContext, useMemo, useState } from 'react'
import { Col, Row } from 'reactstrap'
import useSWR from 'swr'
import Table_By_Suppliers from './Table_By_Suppliers'
import { PurchaseOrder, PurchaseOrderBySuppliers, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { useRouter } from 'next/router'
import SearchInput from '@components/ui/searchInput'

type Props = {}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const By_Suppliers = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status }: any = router.query
  const [searchValue, setSearchValue] = useState<string>('')

  const { data }: { data?: PurchaseOrderBySuppliers[] } = useSWR(state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (searchValue === '') {
      return data
    }

    if (searchValue !== '') {
      const newDataTable = [] as PurchaseOrderBySuppliers[]
      data?.forEach((po: PurchaseOrderBySuppliers) => {
        if (po?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase())) {
          return newDataTable.push(po)
        }
        if (
          po?.orders?.some(
            (poInfo: PurchaseOrder) =>
              poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
              poInfo?.poItems?.some(
                (item: PurchaseOrderItem) =>
                  item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
                  item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  item?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
              )
          )
        ) {
          const filteredOrders = po?.orders?.filter(
            (poInfo: PurchaseOrder) =>
              poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
              poInfo?.poItems?.some(
                (item: PurchaseOrderItem) =>
                  item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
                  item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
                  item?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
              )
          )
          return newDataTable.push({
            suppliersName: po.suppliersName,
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
          <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
            <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' />
          </Row>
          <Table_By_Suppliers filterDataTable={filterDataTable || []} pending={data ? false : true} />
        </Col>
      </React.Fragment>
    </div>
  )
}

export default By_Suppliers
