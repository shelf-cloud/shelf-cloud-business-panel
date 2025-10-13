import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import MKP_Filters, { MKP_FiltersType } from '@components/marketplacePricing/MKP_Filters'
import MKP_table from '@components/marketplacePricing/MKP_table'
import MKP_table_ByMarketplace from '@components/marketplacePricing/MKP_table_ByMarketplace'
import ExportMarketplacePricing from '@components/marketplacePricing/exportMarketplacePricing'
import SearchInput from '@components/ui/SearchInput'
import SelectMarketplaceDropDown from '@components/ui/SelectMarketplaceDropDown'
import AppContext from '@context/AppContext'
import { useMarketplacePricing } from '@hooks/marketplacePricing/useMarketplacePricing'
import { useMarketplaces } from '@hooks/marketplaces/useMarketplaces'
import { MKP_Product } from '@typesTs/marketplacePricing/marketplacePricing'
import { Button, Card, CardBody, CardHeader, Collapse, Container, Nav, NavItem, Row, TabContent, TabPane } from 'reactstrap'

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
      businessOrderStart: string
    }
  }
}

type FilterProps = {
  filters?: string
  units1monthmin?: string
  units1monthmax?: string
  units1yearmin?: string
  units1yearmax?: string
  margin?: string
  marginoperator?: string
  showOnlyOnWatch?: string
  supplier?: string
  brand?: string
  category?: string
}

const filterProducts = (products: MKP_Product[], margin: string | undefined, marginoperator: string | undefined, showOnlyOnWatch: string | undefined) => {
  const marginValue = margin !== undefined && margin !== '' ? parseFloat(margin) : null
  const marginoperatorValue = marginoperator !== undefined && marginoperator !== '' ? marginoperator : null

  return products.flatMap((product) => {
    const { marketplaces, ...rest } = product
    return Object.values(marketplaces)
      .filter((marketplace) => {
        const actualMargin =
          marketplace.actualPrice <= 0
            ? 0
            : ((marketplace.actualPrice -
                marketplace.totalFees -
                product.sellerCost -
                product.inboundShippingCost -
                product.otherCosts -
                marketplace.shippingToMarketpalce -
                marketplace.storeOtherCosts) /
                marketplace.actualPrice) *
              100

        const marginCondition =
          marginValue !== null && marginoperatorValue !== null
            ? marginoperator === '=='
              ? actualMargin === marginValue
              : marginoperator === '!='
                ? actualMargin !== marginValue
                : marginoperator === '>'
                  ? actualMargin > marginValue
                  : marginoperator === '<'
                    ? actualMargin < marginValue
                    : marginoperator === '>='
                      ? actualMargin >= marginValue
                      : marginoperator === '<='
                        ? actualMargin <= marginValue
                        : true
            : true

        return (
          (showOnlyOnWatch === undefined || showOnlyOnWatch === ''
            ? true
            : showOnlyOnWatch === 'true'
              ? marketplace.proposedPrice > 0 && marketplace.proposedPrice !== marketplace.actualPrice
              : true) && marginCondition
        )
      })
      .map((marketplace) => ({
        ...rest,
        ...marketplace,
      }))
  })
}

const MarketplacePricing = ({ session }: Props) => {
  const title = `Marketplace Pricing | ${session?.user?.businessName}`
  const { state } = useContext(AppContext)
  const router = useRouter()
  const { filters, units1monthmin, units1monthmax, units1yearmin, units1yearmax, margin, marginoperator, showOnlyOnWatch, supplier, brand, category }: FilterProps = router.query
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('byProducts')
  const { marketplaces, suppliers, brands, categories } = useMarketplaces()
  const [searchValue, setSearchValue] = useState<string>('')
  const [changesMade, setchangesMade] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState({ storeId: '9999', name: 'All Marketplaces', logo: '' })
  const {
    products,
    isLoadingProducts,
    handleOtherCosts,
    handleProposedPrice,
    handleSetSingleMargin,
    handleSetProductMargin,
    handleSaveProductsInfo,
    handleNotes,
    handleSetMarketplaceMargin,
  } = useMarketplacePricing({
    session,
    state,
    storeId: selectedMarketplace.storeId,
    searchValue,
    setchangesMade,
    units1monthmin,
    units1monthmax,
    units1yearmin,
    units1yearmax,
    margin,
    marginoperator,
    showOnlyOnWatch,
    supplier,
    brand,
    category,
  })

  //   const [selectedRows, setSelectedRows] = useState<any[]>([])
  //   const [toggledClearRows, setToggleClearRows] = useState(false)

  //   const clearAllSelectedRows = () => {
  //     setToggleClearRows(!toggledClearRows)
  //     setSelectedRows([])
  //   }

  const handleApplyFilters = useCallback(
    (filters: MKP_FiltersType) => {
      const { units1monthmin, units1monthmax, units1yearmin, units1yearmax, margin, marginoperator, showOnlyOnWatch, supplier, brand, category } = filters
      let filterString = `/marketplaces/marketplacePricing?filters=true`
      if (units1monthmin || units1monthmin !== '') filterString += `&units1monthmin=${units1monthmin}`
      if (units1monthmax || units1monthmax !== '') filterString += `&units1monthmax=${units1monthmax}`
      if (units1yearmin || units1yearmin !== '') filterString += `&units1yearmin=${units1yearmin}`
      if (units1yearmax || units1yearmax !== '') filterString += `&units1yearmax=${units1yearmax}`
      if (margin || margin !== '') filterString += `&margin=${margin}`
      if (marginoperator || marginoperator !== '') filterString += `&marginoperator=${marginoperator}`
      if (showOnlyOnWatch) filterString += `&showOnlyOnWatch=${showOnlyOnWatch}`
      if (supplier || supplier !== '') filterString += `&supplier=${supplier}`
      if (brand || brand !== '') filterString += `&brand=${brand}`
      if (category || category !== '') filterString += `&category=${category}`
      router.push(filterString, undefined, { shallow: true })
      setFilterOpen(false)
    },
    [router]
  )

  const filteredByMarketplaceProducts = useMemo(() => filterProducts(products, margin, marginoperator, showOnlyOnWatch), [products, margin, marginoperator, showOnlyOnWatch])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Marketplace Pricing' pageTitle='Marketplaces' />
          <Container fluid>
            <Row className='d-flex flex-column justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='d-flex flex-column justify-content-between align-items-start p-0 flex-md-row align-items-md-center gap-2'>
                <div className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2 w-100'>
                  <Button
                    className={'dropdown-toggle fs-7 ' + (filters === 'true' ? 'btn-info' : 'btn-light')}
                    style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                    type='button'
                    data-bs-toggle='dropdown'
                    data-bs-auto-close='outside'
                    aria-expanded='false'
                    onClick={() => setFilterOpen(!filterOpen)}>
                    Filters
                  </Button>

                  <ExportMarketplacePricing products={activeTab === 'byProducts' ? products : filteredByMarketplaceProducts} activeTab={activeTab} />
                  <Button className='fs-7' color={changesMade ? 'warning' : 'light'} onClick={() => handleSaveProductsInfo()}>
                    Save Changes
                  </Button>
                </div>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={3} />
              </div>
              <Collapse className='px-0' isOpen={filterOpen}>
                <MKP_Filters
                  filters={{
                    units1monthmin: units1monthmin || '',
                    units1monthmax: units1monthmax || '',
                    units1yearmin: units1yearmin || '',
                    units1yearmax: units1yearmax || '',
                    margin: margin || '',
                    marginoperator: marginoperator || '',
                    showOnlyOnWatch: showOnlyOnWatch ? (showOnlyOnWatch === 'true' ? true : false) : false,
                    supplier: supplier || '',
                    brand: brand || '',
                    category: category || '',
                  }}
                  supplierOptions={suppliers}
                  brandOptions={brands}
                  categoryOptions={categories}
                  handleApplyFilters={handleApplyFilters}
                  setFilterOpen={setFilterOpen}
                  activeTab={activeTab}
                />
              </Collapse>
            </Row>
            <Card>
              <CardHeader className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2 w-100'>
                <Nav className='d-flex flex-row gap-2' role='tablist'>
                  <NavItem>
                    <Button
                      color={activeTab === 'byProducts' ? 'primary' : 'light'}
                      className='fs-7'
                      onClick={() => {
                        setSelectedMarketplace({ storeId: '9999', name: 'All Marketplaces', logo: '' })
                        setActiveTab('byProducts')
                      }}>
                      By Products
                    </Button>
                  </NavItem>
                  <NavItem>
                    <Button
                      color={activeTab === 'byMarketplace' ? 'primary' : 'light'}
                      className='fs-7'
                      onClick={() => {
                        setSelectedMarketplace(marketplaces[0])
                        setActiveTab('byMarketplace')
                      }}>
                      By Marketplaces
                    </Button>
                  </NavItem>
                </Nav>
                <SelectMarketplaceDropDown
                  selectionInfo={marketplaces || []}
                  selected={selectedMarketplace}
                  handleSelection={setSelectedMarketplace}
                  showAllMarketsOption={activeTab === 'byProducts'}
                />
              </CardHeader>
              <CardBody>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId='byProducts'>
                    {activeTab === 'byProducts' && (
                      <MKP_table
                        products={products}
                        isLoading={isLoadingProducts}
                        //   setSelectedRows={setSelectedRows}
                        //   toggledClearRows={toggledClearRows}
                        handleOtherCosts={handleOtherCosts}
                        handleProposedPrice={handleProposedPrice}
                        handleSetSingleMargin={handleSetSingleMargin}
                        handleSetProductMargin={handleSetProductMargin}
                        handleNotes={handleNotes}
                      />
                    )}
                  </TabPane>
                  <TabPane tabId='byMarketplace'>
                    {activeTab === 'byMarketplace' && (
                      <MKP_table_ByMarketplace
                        products={filteredByMarketplaceProducts}
                        storeId={selectedMarketplace.storeId}
                        isLoading={isLoadingProducts}
                        //   setSelectedRows={setSelectedRows}
                        //   toggledClearRows={toggledClearRows}
                        handleOtherCosts={handleOtherCosts}
                        handleProposedPrice={handleProposedPrice}
                        handleSetSingleMargin={handleSetSingleMargin}
                        handleNotes={handleNotes}
                        handleSetMarketplaceMargin={handleSetMarketplaceMargin}
                      />
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default MarketplacePricing
