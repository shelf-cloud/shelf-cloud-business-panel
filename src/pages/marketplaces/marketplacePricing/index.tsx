import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import MKP_table from '@components/marketplacePricing/MKP_table'
import MKP_table_ByMarketplace from '@components/marketplacePricing/MKP_table_ByMarketplace'
import SelectMarketplaceDropDown from '@components/ui/SelectMarketplaceDropDown'
import AppContext from '@context/AppContext'
import { useMarketplacePricing } from '@hooks/marketplacePricing/useMarketplacePricing'
import { useMarketplaces } from '@hooks/marketplaces/useMarketplaces'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'
import { Button, Card, CardBody, Container, Nav, NavItem, Row, TabContent, TabPane } from 'reactstrap'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']

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
    props: { session, sessionToken },
  }
}

type Props = {
  sessionToken: string
  session: {
    user: {
      businessName: string
      businessOrderStart: string
    }
  }
}

const MarketplacePricing = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('byProducts')
  const { marketplaces } = useMarketplaces()
  const [searchValue, setSearchValue] = useState<string>('')
  const [changesMade, setchangesMade] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState({ storeId: '9999', name: 'All Marketplaces', logo: '' })
  const { products, isLoadingProducts, handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin, handleSaveProductsInfo, handleNotes, handleSetMarketplaceMargin } = useMarketplacePricing({
    sessionToken,
    session,
    state,
    storeId: selectedMarketplace.storeId,
    searchValue,
    setchangesMade
  })

  //   const [selectedRows, setSelectedRows] = useState<any[]>([])
  //   const [toggledClearRows, setToggleClearRows] = useState(false)

  //   const clearAllSelectedRows = () => {
  //     setToggleClearRows(!toggledClearRows)
  //     setSelectedRows([])
  //   }

  const title = `Marketplace Pricing | ${session?.user?.businessName}`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Reordering Points' pageTitle='Inbound' />
          <Container fluid>
            <Row className='d-flex flex-column justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='d-flex flex-column justify-content-between align-items-start p-0 flex-md-row align-items-md-center gap-2'>
                <div className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-2 w-100'>
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
                  <SelectMarketplaceDropDown selectionInfo={marketplaces || []} selected={selectedMarketplace} handleSelection={setSelectedMarketplace} showAllMarketsOption={activeTab === 'byProducts'} />
                  <Button className='fs-7' color={changesMade ? 'warning' : 'light'} onClick={() => handleSaveProductsInfo()}>Save Changes</Button>
                </div>
                <div className='app-search col-12 col-md-3 p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={500}
                      className='form-control bg-white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center bg-white'
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
            <Card>
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
                        products={products.flatMap((product) => {
                          const { marketplaces, ...rest } = product
                          return Object.values(product.marketplaces).map((marketplace) => {
                            return {
                              ...rest,
                              ...marketplace,
                            }
                          })
                        })}
                        storeId={selectedMarketplace.storeId}
                        isLoading={isLoadingProducts}
                        //   setSelectedRows={setSelectedRows}
                        //   toggledClearRows={toggledClearRows}
                        handleOtherCosts={handleOtherCosts}
                        handleProposedPrice={handleProposedPrice}
                        handleSetSingleMargin={handleSetSingleMargin}
                        handleSetProductMargin={handleSetProductMargin}
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
