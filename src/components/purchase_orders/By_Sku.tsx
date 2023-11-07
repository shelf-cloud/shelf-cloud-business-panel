import AppContext from '@context/AppContext'
import axios from 'axios'
import React, { useContext, useMemo, useState } from 'react'
import { Col, Input, Row } from 'reactstrap'
import useSWR from 'swr'
import { PurchaseOrder, PurchaseOrderBySkus } from '@typesTs/purchaseOrders'
import Table_By_Sku from './Table_By_Sku'
import { useRouter } from 'next/router'

type Props = {}

const By_Sku = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status }: any = router.query
  const [searchValue, setSearchValue] = useState<any>('')
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: PurchaseOrderBySkus[] } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}` : null,
    fetcher
  )

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
          po?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
          po?.barcode?.toLowerCase().includes(searchValue.toLowerCase())
        ) {
          return newDataTable.push(po)
        }
        if (
          po?.orders?.some(
            (poInfo: PurchaseOrder) =>
              poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) || poInfo?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase())
          )
        ) {
          const filteredOrders = po?.orders?.filter(
            (poInfo: PurchaseOrder) =>
              poInfo?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) || poInfo?.suppliersName?.toLowerCase().includes(searchValue.toLowerCase())
          )
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
        <Row>
          <Col lg={12}>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
              <div className='col-sm-12 col-md-3'>
                <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <Input
                      type='text'
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => {
                        e.preventDefault()
                        setSearchValue(e.target.value)
                      }}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center input_background_white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                    </span>
                  </div>
                </div>
              </div>
            </Row>
            <Table_By_Sku filterDataTable={filterDataTable || []} pending={data ? false : true} />
          </Col>
        </Row>
      </React.Fragment>
    </div>
  )
}

export default By_Sku
