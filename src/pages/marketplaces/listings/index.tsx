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
import { Button, Card, CardBody, CardHeader, Col, Collapse, Container, DropdownItem, DropdownMenu, DropdownToggle, Label, Row, UncontrolledButtonDropdown } from '@/components/migration-ui'

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
          <Container fluid>
            <Row>
              <Col xs={12}>
                <Row className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:mb-2 tw:md:flex-row tw:md:justify-end tw:md:items-center tw:px-4'>
                  <div className='tw:flex tw:flex-col tw:justify-between tw:items-start tw:p-0 tw:md:flex-row tw:md:items-center tw:gap-2'>
                    <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-center tw:gap-2 tw:w-full'>
                      <Button
                        color={filters === 'true' ? 'info' : 'light'}
                        className='tw:text-[11.2px]'
                        style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                        type='button'
                        aria-expanded='false'
                        onClick={() => setFilterOpen(!filterOpen)}>
                        Filters
                      </Button>

                      {selectedRows.length > 0 && (
                        <UncontrolledButtonDropdown>
                          <DropdownToggle className='btn btn-primary tw:text-[11.2px] tw:py-2' caret>
                            {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                          </DropdownToggle>
                          <DropdownMenu>
                            <ExportProductListingsButton products={selectedRows} />
                            <DropdownItem
                              className='tw:text-nowrap tw:text-[11.2px]'
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
                              <i className='mdi mdi-eye label-icon align-middle fs-5 me-2 text-primary' />
                              Set Visible
                            </DropdownItem>
                            <DropdownItem
                              className='tw:text-nowrap tw:text-[11.2px]'
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
                              <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2 text-danger' />
                              Set Hidden
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                              className='tw:text-nowrap tw:text-[11.2px]'
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
                              <i className='las la-link label-icon align-middle fs-5 me-2 text-primary' />
                              Set Mapped
                            </DropdownItem>
                            <DropdownItem className='tw:text-nowrap tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:text-end' onClick={clearAllSelectedRows}>
                              Clear
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                      )}
                    </div>
                    <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
                  </div>
                  <Collapse className='tw:px-0' isOpen={filterOpen}>
                    <MKL_Filters supplierOptions={suppliers} brandOptions={brands} categoryOptions={categories} setFilterOpen={setFilterOpen} />
                  </Collapse>
                </Row>
                <Card>
                  <CardHeader className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-center tw:gap-2 tw:w-full'>
                    <Label className='tw:font-semibold tw:text-[13px] tw:m-0'>Marketplace:</Label>
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
                  <CardBody>
                    <MarketplacesListingsTable
                      tableData={products}
                      pending={isLoading}
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                      marketplaceId={selectedMarketplace.storeId}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    </div>
  )
}

export default ProductsListings
