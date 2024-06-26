import AppContext from '@context/AppContext'
import axios from 'axios'
import React, { useContext, useMemo, useState } from 'react'
import { Col, Input, Row } from 'reactstrap'
import useSWR from 'swr'
import Table_By_Orders from './Table_By_Orders'
import { PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { useRouter } from 'next/router'

type Props = {}

const By_Purchase_Orders = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status }: any = router.query
  const [searchValue, setSearchValue] = useState<string>('')
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: PurchaseOrder[] } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

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
            <Table_By_Orders filterDataTable={filterDataTable || []} pending={data ? false : true} />
          </Col>
        </Row>
      </React.Fragment>
    </div>
  )
}

export default By_Purchase_Orders
