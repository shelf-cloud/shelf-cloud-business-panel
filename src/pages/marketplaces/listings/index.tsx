import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Fragment, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import MKL_Filters from '@components/marketplacesListings/MKL_Filters'
import MarketplacesListingsTable from '@components/marketplacesListings/MarketpalcesListingsTable'
import ExportProductListingsButton from '@components/marketplacesListings/exportProductListings/ExportProductListingsButton'
import SearchInput from '@components/ui/SearchInput'
import SelectMarketplaceDropDown from '@components/ui/SelectMarketplaceDropDown'
import { useMarketplaces } from '@hooks/marketplaces/useMarketplaces'
import { MarketplaceListingsProduct, useMarketplaceListings } from '@hooks/products/useMarketplaceListings'
import { useMarketplaceListingsQueries } from '@hooks/products/useMarketplaceListingsQuery'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { Collapse } from '@/components/ui/Collapse'

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

const ProductsListings = ({ session }: Props) => {
  const { listingsFilter } = useMarketplaceListingsQueries()
  const { filters } = listingsFilter

  const title = `Listings | ${session?.user?.businessName}`

  const [filterOpen, setFilterOpen] = useState(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<MarketplaceListingsProduct[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const [selectedMarketplace, setSelectedMarketplace] = useState({ storeId: '', name: 'Select Marketplace', logo: '' })
  const { marketplaces, suppliers, brands, categories } = useMarketplaces()

  const { products, isLoading, setSelectedVisibility, setSelectedasMapped } = useMarketplaceListings({ searchValue, storeId: selectedMarketplace.storeId })

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Fragment>
        <div className='page-content'>
          <BreadCrumb title='Marketplace Listings' pageTitle='Marketplaces' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 sm:w-full'>
                <div className='flex flex-wrap -mx-3 flex flex-col justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center px-4'>
                  <div className='flex flex-col justify-between items-start p-0 md:flex-row md:items-center gap-2'>
                    <div className='flex flex-row flex-wrap justify-start items-center gap-2 w-full'>
                      <Button
                        variant={filters === 'true' ? 'info' : 'light'}
                        className='text-[11.2px]'
                        style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                        type='button'
                        aria-expanded='false'
                        onClick={() => setFilterOpen(!filterOpen)}>
                        Filters
                      </Button>

                      {selectedRows.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type='button'
                              className='inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-[11.2px] font-medium text-primary-foreground whitespace-nowrap shadow-xs hover:bg-primary/90'>
                              {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <ExportProductListingsButton products={selectedRows} />
                            <DropdownMenuItem
                              className='text-nowrap text-[11.2px]'
                              onClick={() =>
                                setSelectedVisibility({
                                  products: selectedRows.map((row) => ({
                                    inventoryId: row.inventoryId,
                                    sku: row.sku,
                                    isKit: row.isKit,
                                  })),
                                  storeId: Number(selectedMarketplace.storeId),
                                  visibility: false,
                                }).finally(() => {
                                  clearAllSelectedRows()
                                })
                              }>
                              <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2 text-primary' />
                              Set Visible
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-nowrap text-[11.2px]'
                              onClick={() =>
                                setSelectedVisibility({
                                  products: selectedRows.map((row) => ({
                                    inventoryId: row.inventoryId,
                                    sku: row.sku,
                                    isKit: row.isKit,
                                  })),
                                  storeId: Number(selectedMarketplace.storeId),
                                  visibility: true,
                                }).finally(() => {
                                  clearAllSelectedRows()
                                })
                              }>
                              <i className='mdi mdi-eye-off label-icon align-middle text-[16.25px] me-2 text-destructive' />
                              Set Hidden
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-nowrap text-[11.2px]'
                              onClick={() =>
                                setSelectedasMapped({
                                  products: selectedRows.map((row) => ({
                                    inventoryId: row.inventoryId,
                                    sku: row.sku,
                                    isKit: row.isKit,
                                  })),
                                  storeId: Number(selectedMarketplace.storeId),
                                }).finally(() => {
                                  clearAllSelectedRows()
                                })
                              }>
                              <i className='las la-link label-icon align-middle text-[16.25px] me-2 text-primary' />
                              Set Mapped
                            </DropdownMenuItem>
                            <DropdownMenuItem className='text-nowrap text-muted-foreground text-[11.2px] text-end' onClick={clearAllSelectedRows}>
                              Clear
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                  </div>
                  <Collapse className='px-0' isOpen={filterOpen}>
                    <MKL_Filters supplierOptions={suppliers} brandOptions={brands} categoryOptions={categories} setFilterOpen={setFilterOpen} />
                  </Collapse>
                </div>
                <Card>
                  <CardHeader className='flex flex-row flex-wrap justify-start items-center gap-2 w-full'>
                    <Label className='font-semibold text-[13px] m-0'>Marketplace:</Label>
                    <SelectMarketplaceDropDown
                      selectionInfo={marketplaces.filter((marketplace) => !marketplace.name.startsWith('FBA Amazon.')) || []}
                      selected={selectedMarketplace}
                      handleSelection={(marketplace) => {
                        setSelectedMarketplace(marketplace)
                        clearAllSelectedRows()
                      }}
                      showAllMarketsOption={false}
                    />
                  </CardHeader>
                  <CardContent>
                    <MarketplacesListingsTable
                      tableData={products}
                      pending={isLoading}
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                      marketplaceId={selectedMarketplace.storeId}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    </div>
  )
}

export default ProductsListings
