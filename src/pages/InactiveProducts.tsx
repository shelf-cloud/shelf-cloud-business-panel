/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import EditProductModal from '@components/EditProductModal'
import InventoryBinsModal from '@components/InventoryBinsModal'
import ProductsTable from '@components/ProductsTable'
import FilterProducts from '@components/ui/FilterProducts'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { useInactiveProducts } from '@hooks/products/useInactiveProducts'
import { Product } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'

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
  const { state } = useContext(AppContext)
  const router = useRouter()
  const { brand, supplier, category, condition }: { brand?: string; supplier?: string; category?: string; condition?: string } = router.query

  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const { products, isLoading, brands, suppliers, categories, mutateProducts } = useInactiveProducts({
    searchValue,
    brand: brand || '',
    supplier: supplier || '',
    category: category || '',
    condition: condition || '',
  })

  const changeProductState = async (inventoryId: number, sku: string) => {
    const confirmationResponse = confirm(`Are you sure you want to set Active: ${sku}`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${state.user.businessId}&inventoryId=${inventoryId}`, {
        newState: 1,
        sku,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutateProducts()
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
        mutateProducts()
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
          <BreadCrumb title='Inactive Products' pageTitle='Warehouse' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-3'>
                    <FilterProducts
                      brands={brands}
                      suppliers={suppliers}
                      categories={categories}
                      brand={brand || 'All'}
                      supplier={supplier || 'All'}
                      category={category || 'All'}
                      condition={condition || 'All'}
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
                  <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                </Row>

                <Card>
                  <CardBody>
                    <ProductsTable
                      tableData={products || []}
                      pending={isLoading}
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
