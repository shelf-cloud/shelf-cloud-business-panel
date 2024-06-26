/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { Card, CardBody, CardHeader, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR, { useSWRConfig } from 'swr'
import ProductsTable from '@components/ProductsTable'
import InventoryBinsModal from '@components/InventoryBinsModal'
import EditProductModal from '@components/EditProductModal'
import { useRouter } from 'next/router'
import { DebounceInput } from 'react-debounce-input'
import FilterProducts from '@components/ui/FilterProducts'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      businessName: string
    }
  }
}

const InactiveProducts = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { brand, supplier, category, condition }: any = router.query
  const { mutate } = useSWRConfig()
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<Product[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInactiveInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setAllData(data?.products)
      setPending(false)
    }
  }, [data])

  const filterDataTable = useMemo(() => {
    if (!data?.products || data?.error) {
      return []
    }

    if (searchValue === '') {
      const newDataTable = allData?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase())
      )
      return newDataTable
    }

    if (searchValue !== '') {
      const newDataTable = allData?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase()) &&
          (item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.fnSku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.barcode?.toLowerCase().includes(searchValue.toLowerCase()))
      )
      return newDataTable
    }
  }, [allData, searchValue, brand, supplier, category, condition])

  const changeProductState = async (inventoryId: number, businessId: number, sku: string) => {
    const confirmationResponse = confirm(`Are you sure you want to set Active: ${sku}`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${businessId}&inventoryId=${inventoryId}`, {
        newState: 1,
        sku,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getBusinessInactiveInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    }
  }

  const changeSelectedProductsState = async () => {
    if (selectedRows.length <= 0) return

    const confirmationResponse = confirm(`Are you sure you want to set Active Selected Products?`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/products/setStateToSelectedProducts?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newState: 1,
        selectedRows,
      })
      if (!response.data.error) {
        setToggleClearRows(!toggledClearRows)
        setSelectedRows([])
        toast.success(response.data.msg)
        mutate(`/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    }
  }
  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const title = `Inactive Products | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Inactive Products' pageTitle='Warehouse' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <Col lg={12}>
                      <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-3 flex-md-row justify-content-md-between align-items-md-center'>
                        <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-3'>
                          <FilterProducts
                            brands={data?.brands}
                            suppliers={data?.suppliers}
                            categories={data?.categories}
                            brand={brand}
                            supplier={supplier}
                            category={category}
                            condition={condition}
                            activeTab={false}
                          />
                          {selectedRows.length > 0 && (
                            <UncontrolledButtonDropdown>
                              <DropdownToggle className='btn btn-info fs-6 py-2' caret>
                                {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem className='text-nowrap text-success' onClick={changeSelectedProductsState}>
                                  <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                                  Set Active
                                </DropdownItem>
                                <DropdownItem className='text-nowrap text-muted' onClick={clearAllSelectedRows}>
                                  Clear Selection
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledButtonDropdown>
                          )}
                        </div>
                        <div className='col-sm-12 col-md-3'>
                          <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                            <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                              <DebounceInput
                                type='text'
                                minLength={3}
                                debounceTimeout={300}
                                className='form-control input_background_white'
                                placeholder='Search...'
                                id='search-options'
                                value={searchValue}
                                onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                                onChange={(e) => setSearchValue(e.target.value)}
                              />
                              <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                              <span
                                className='d-flex align-items-center justify-content-center input_background_white'
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSearchValue('')}>
                                <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Row>
                    </Col>
                  </CardHeader>
                  <CardBody>
                    <ProductsTable
                      tableData={filterDataTable || []}
                      pending={pending}
                      changeProductState={changeProductState}
                      setMsg={'Set Active'}
                      icon={'las la-eye align-bottom me-2'}
                      activeText={'text-success'}
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {state.showEditProductModal && <EditProductModal />}
    </div>
  )
}

export default InactiveProducts
