import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useState } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import Integrations from '@components/integrations/integrations'
import MarketplacesFees from '@components/marketplaceManager/MarketplaceFees'
import { getSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)
  const env = process.env.AMAZON_ENV_AUTH
  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session, env },
  }
}

type Props = {
  env: string
  session: {
    user: {
      businessName: string
    }
  }
}

const MarketplaceManager = ({ session, env }: Props) => {
  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const title = `Marketplace Manager | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Settings' pageTitle='Marketpalce Manager' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full lg:w-full'>
                <Card>
                  <CardHeader>
                    <Nav className='nav-tabs-custom rounded-[0.25rem] card-header-tabs border-b-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? 'text-primary text-[16.25px]' : 'text-muted-foreground text-[16.25px]'}
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
                          className={activeTab == '2' ? 'text-primary text-[16.25px]' : 'text-muted-foreground text-[16.25px]'}
                          onClick={() => {
                            tabChange('2')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Connections
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <MarketplacesFees />
                      </TabPane>
                      <TabPane tabId='2'>
                        <Integrations env={env} />
                      </TabPane>
                    </TabContent>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default MarketplaceManager
