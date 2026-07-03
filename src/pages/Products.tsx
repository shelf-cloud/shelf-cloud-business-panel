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
import { toast } from '@/lib/toast'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@shadcn/ui/dropdown-menu'

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
          <div className='mx-auto w-full px-3'>
            <ProductsWidgets />
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full'>
                <div className='flex flex-col-reverse justify-center items-start gap-2 mb-2 md:flex-row md:justify-between md:items-center'>
                  <div className='w-auto flex flex-row items-center justify-between gap-2'>
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
                      <Button className='text-nowrap'>
                        <i className='mdi mdi-plus-circle label-icon align-middle text-[16.25px] me-2' />
                        Basic Product
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type='button'
                          className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'>
                          Bulk Actions
                          <ChevronDownIcon className='ml-1 size-4' />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        {products.length > 0 && (
                          <ExportProductsTemplate
                            products={selectedRows.length == 0 ? products : selectedRows}
                            selected={selectedRows.length > 0 ? true : false}
                            brands={brands}
                            suppliers={suppliers}
                            categories={categories}
                          />
                        )}
                        <ExportBlankTemplate brands={brands || []} suppliers={suppliers || []} categories={categories || []} />
                        <DropdownMenuItem
                          className='text-nowrap text-primary'
                          onClick={() =>
                            setimportModalDetails((prev) => {
                              return { ...prev, show: true }
                            })
                          }>
                          <i className='mdi mdi-arrow-up-bold label-icon align-middle text-[13px] me-2' />
                          Import Add/Update
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedRows.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type='button'
                            className='inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground whitespace-nowrap shadow-xs hover:bg-primary/90'>
                            <span className='font-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                            <ChevronDownIcon className='ml-1 size-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='start'>
                          <ExportProductsFile products={selectedRows} />
                          {selectedRowsToSetActive.length > 0 && (
                            <DropdownMenuItem className='text-nowrap text-success' onClick={() => changeSelectedProductsState(1)}>
                              <i className='mdi mdi-eye label-icon align-middle text-[13px] me-2' />
                              Set Active
                            </DropdownMenuItem>
                          )}
                          {selectedRowsToSetInactive.length > 0 && (
                            <DropdownMenuItem className='text-nowrap text-destructive' onClick={() => changeSelectedProductsState(0)}>
                              <i className='mdi mdi-eye-off label-icon align-middle text-[13px] me-2' />
                              Set Inactive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className='text-nowrap text-right text-[13px] text-muted-foreground' onClick={clearAllSelectedRows}>
                            Clear All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                </div>
                <Card>
                  <CardContent>
                    <ProductsTable
                      tableData={products || []}
                      pending={isLoading}
                      changeProductState={changeProductState}
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                      setcloneProductModal={setcloneProductModal}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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
        />
      )}
      {cloneProductModal.isOpen && <CloneProductModal cloneProductModal={cloneProductModal} setcloneProductModal={setcloneProductModal} />}
    </div>
  )
}

export default Products
