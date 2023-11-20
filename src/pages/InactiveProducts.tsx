/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { ProductRowType, Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { Card, CardBody, CardHeader, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Input, Row, UncontrolledButtonDropdown } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR, { useSWRConfig } from 'swr'
import ProductsTable from '@components/ProductsTable'
import InventoryBinsModal from '@components/InventoryBinsModal'
import EditProductModal from '@components/EditProductModal'

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
      name: string
    }
  }
}

const InactiveProducts = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ProductRowType[]>([])
  const [tableData, setTableData] = useState<ProductRowType[]>([])
  const [serachValue, setSerachValue] = useState('')
  const [selectedRows, setSelectedRows] = useState<ProductRowType[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInactiveInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  useEffect(() => {
    if (data?.error) {
      setTableData([])
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      const list: ProductRowType[] = []

      data?.forEach((product: Product) => {
        const row = {
          inventoryId: product.inventoryId,
          Image: product.image,
          Title: product.title,
          SKU: product.sku,
          note: product.note,
          ASIN: product.asin,
          FNSKU: product.fnSku,
          Barcode: product.barcode,
          Quantity: {
            quantity: product.quantity,
            inventoryId: product.inventoryId,
            businessId: product.businessId,
            sku: product.sku,
          },
          unitDimensions: {
            weight: product.weight,
            length: product.length,
            width: product.width,
            height: product.height,
          },
          boxDimensions: {
            weight: product.boxWeight,
            length: product.boxLength,
            width: product.boxWidth,
            height: product.boxHeight,
          },
          qtyBox: product.boxQty,
          btns: {
            inventoryId: product.inventoryId,
            businessId: product.businessId,
            sku: product.sku,
            state: product.activeState,
          },
        }
        list.push(row)
      })
      setTableData(list)
      setAllData(list)
      setPending(false)
    }
  }, [data])

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable = allData.filter(
        (item) =>
          item?.Title?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.SKU?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.ASIN?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.FNSKU?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.Barcode?.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setTableData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setTableData(allData)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setTableData(allData)
  }

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

  const title = `Inactive Products | ${session?.user?.name}`
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
                              <Input
                                type='text'
                                className='form-control input_background_white'
                                placeholder='Search...'
                                id='search-options'
                                value={serachValue}
                                onChange={filterByText}
                              />
                              <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                              <span className='d-flex align-items-center justify-content-center input_background_white' style={{ cursor: 'pointer' }} onClick={clearSearch}>
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
                      tableData={tableData}
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
