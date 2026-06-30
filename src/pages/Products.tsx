import { GetServerSideProps } from 'next'
import Head from 'next/head'
// import { CSVLink } from 'react-csv'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import InventoryBinsModal from '@components/InventoryBinsModal'
import ProductsTable from '@components/ProductsTable'
import CloneProductModal from '@components/modals/products/CloneProductModal'
import ImportProductsFileModal from '@components/modals/products/ImportProductsFileModal'
import ProductsWidgets from '@components/products/ProductsWidgets'
import FilterProducts from '@components/ui/FilterProducts'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import ExportBlankTemplate from '@features/products/add-products/ExportBlankTemplate'
import ExportProductsFile from '@features/products/add-products/ExportProductsFile'
import ExportProductsTemplate from '@features/products/add-products/ExportProductsTemplate'
import { getProductsForStateChange } from '@hooks/products/productFilters'
import type { ProductStateValue, ProductStatusFilter } from '@hooks/products/productFilters'
import { useProducts } from '@hooks/products/useProducts'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import type { Product } from '@typings'
import axios from 'axios'
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'

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

const productStatusFilters = ['All', 'Active', 'Inactive'] as const satisfies readonly ProductStatusFilter[]

const productFilterParsers = {
  brand: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
  supplier: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
  category: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
  condition: parseAsString.withDefault('All').withOptions({ clearOnDefault: true }),
  status: parseAsStringLiteral(productStatusFilters).withDefault('Active').withOptions({ clearOnDefault: true }),
}

type Props = {
  session: {
    user: {
      businessName: string
    }
  }
}

const Products = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [
    { brand: brandFilter, supplier: supplierFilter, category: categoryFilter, condition: conditionFilter, status: statusFilter },
    setProductFilters,
  ] = useQueryStates(productFilterParsers)

  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [importModalDetails, setimportModalDetails] = useState({
    show: false,
  })
  const [cloneProductModal, setcloneProductModal] = useState({
    isOpen: false,
    originalId: 0,
    originalName: '',
    originalSku: '',
  })

  const { products, isLoading, brands, suppliers, categories, mutateProducts } = useProducts({
    searchValue,
    brand: brandFilter,
    supplier: supplierFilter,
    category: categoryFilter,
    condition: conditionFilter,
    status: statusFilter,
  })

  const { generate_new_forecast_products } = useRPNewForecast()
  const selectedRowsToSetInactive = useMemo(() => getProductsForStateChange(selectedRows, 0), [selectedRows])
  const selectedRowsToSetActive = useMemo(() => getProductsForStateChange(selectedRows, 1), [selectedRows])

  const changeProductState = async (newState: ProductStateValue, inventoryId: number, sku: string) => {
    const actionLabel = newState === 1 ? 'Active' : 'Inactive'
    const confirmationResponse = confirm(`Are you sure you want to set ${actionLabel}: ${sku}`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${state.user.businessId}&inventoryId=${inventoryId}`, {
        newState,
        sku,
      })
      if (!response.data.error) {
        if (newState === 1) {
          generate_new_forecast_products({
            skus: [sku],
            productIds: [inventoryId],
          })
        }
        toast.success(response.data.msg)
        mutateProducts()
      } else {
        toast.error(response.data.msg)
      }
    }
  }
  const changeSelectedProductsState = async (newState: ProductStateValue) => {
    if (selectedRows.length <= 0) return

    const productsToUpdate = getProductsForStateChange(selectedRows, newState)

    if (productsToUpdate.length <= 0 && newState === 0) {
      toast.warning('Only products with 0 stock can be set as Inactive.')
      return
    }

    if (productsToUpdate.length <= 0 && newState === 1) {
      toast.warning('Only inactive products can be set as Active.')
      return
    }

    const actionLabel = newState === 1 ? 'Active' : 'Inactive'
    const confirmationResponse = confirm(`Are you sure you want to set ${actionLabel} Selected Products?`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/products/setStateToSelectedProducts?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newState,
        selectedRows: productsToUpdate,
      })
      if (!response.data.error) {
        if (newState === 1) {
          generate_new_forecast_products({
            skus: productsToUpdate.map((item) => item.sku) ?? [],
            productIds: productsToUpdate.map((item) => item.inventoryId) ?? [],
          })
        }
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

  const title = `Products | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Products' pageTitle='Warehouse' />
          <Container fluid>
            <ProductsWidgets />
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-2'>
                    <FilterProducts
                      brands={brands}
                      suppliers={suppliers}
                      categories={categories}
                      brand={brandFilter}
                      supplier={supplierFilter}
                      category={categoryFilter}
                      condition={conditionFilter}
                      status={statusFilter}
                      setProductFilters={setProductFilters}
                    />
                    <Link href={'/AddProduct'}>
                      <Button color='primary' size='sm' className='fs-7 text-nowrap'>
                        <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                        Basic Product
                      </Button>
                    </Link>
                    <UncontrolledButtonDropdown>
                      <DropdownToggle className='fs-7' caret>
                        Bulk Actions
                      </DropdownToggle>
                      <DropdownMenu>
                        {products.length > 0 && (
                          <ExportProductsTemplate
                            products={selectedRows.length == 0 ? products : selectedRows}
                            selected={selectedRows.length > 0 ? true : false}
                            brands={brands}
                            suppliers={suppliers}
                            categories={categories}
                            feedType='general'
                          />
                        )}
                        {products.length > 0 && (
                          <ExportProductsTemplate
                            products={selectedRows.length == 0 ? products : selectedRows}
                            selected={selectedRows.length > 0 ? true : false}
                            brands={brands}
                            suppliers={suppliers}
                            categories={categories}
                            feedType='identifiers'
                          />
                        )}
                        {products.length > 0 && state.user[state.currentRegion]?.showReorderingPoints && (
                          <ExportProductsTemplate
                            products={selectedRows.length == 0 ? products : selectedRows}
                            selected={selectedRows.length > 0 ? true : false}
                            brands={brands}
                            suppliers={suppliers}
                            categories={categories}
                            feedType='reorderingPoint'
                          />
                        )}
                        <ExportBlankTemplate brands={brands || []} suppliers={suppliers || []} categories={categories || []} />
                        <DropdownItem
                          className='text-nowrap text-primary'
                          onClick={() =>
                            setimportModalDetails((prev) => {
                              return { ...prev, show: true }
                            })
                          }>
                          <i className='mdi mdi-arrow-up-bold label-icon align-middle fs-6 me-2' />
                          Import Add/Update
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                    {selectedRows.length > 0 && (
                      <UncontrolledButtonDropdown>
                        <DropdownToggle className='btn btn-primary fs-6 py-2' caret>
                          <span className='fw-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                        </DropdownToggle>
                        <DropdownMenu>
                          <ExportProductsFile products={selectedRows} />
                          {selectedRowsToSetActive.length > 0 && (
                            <DropdownItem className='text-nowrap text-success' onClick={() => changeSelectedProductsState(1)}>
                              <i className='mdi mdi-eye label-icon align-middle fs-6 me-2' />
                              Set Active
                            </DropdownItem>
                          )}
                          {selectedRowsToSetInactive.length > 0 && (
                            <DropdownItem className='text-nowrap text-danger' onClick={() => changeSelectedProductsState(0)}>
                              <i className='mdi mdi-eye-off label-icon align-middle fs-6 me-2' />
                              Set Inactive
                            </DropdownItem>
                          )}
                          <DropdownItem className='text-nowrap text-end fs-6 text-muted' onClick={clearAllSelectedRows}>
                            Clear All
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
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                      setcloneProductModal={setcloneProductModal}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {importModalDetails.show && (
        <ImportProductsFileModal
          importModalDetails={importModalDetails}
          setimportModalDetails={setimportModalDetails}
          brands={brands}
          suppliers={suppliers}
          categories={categories}
          mutateProducts={mutateProducts}
          canUseReorderingPointFeed={Boolean(state.user[state.currentRegion]?.showReorderingPoints)}
        />
      )}
      {cloneProductModal.isOpen && <CloneProductModal cloneProductModal={cloneProductModal} setcloneProductModal={setcloneProductModal} />}
    </div>
  )
}

export default Products
