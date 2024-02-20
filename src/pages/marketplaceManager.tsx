import BreadCrumb from '@components/Common/BreadCrumb'
import Integrations from '@components/integrations/integrations'
import MarketplacesFees from '@components/marketplaceManager/MarketplaceFees'
import Head from 'next/head'
import React, { useState } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'

type Props = {}

const MarketplaceManager = ({}: Props) => {
  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }
  return (
    <div>
      <Head>
        <title>Marketpalce Manager</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Settings' pageTitle='Marketpalce Manager' />
            <Row>
              <Col lg={12}>
                <Card className=''>
                  <CardHeader>
                    <Nav className='nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? 'text-primary fs-5' : 'text-muted fs-5'}
                          onClick={() => {
                            tabChange('1')
                          }}>
                          <>
                            <i className='fas fa-home'></i>
                            Marketplaces
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '2' ? 'text-primary fs-5' : 'text-muted fs-5'}
                          onClick={() => {
                            tabChange('2')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Integrations
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardBody className='p-4'>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <MarketplacesFees />
                      </TabPane>
                      <TabPane tabId='2'>
                        <Integrations />
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default MarketplaceManager
