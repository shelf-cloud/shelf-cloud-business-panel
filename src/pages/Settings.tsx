import Head from 'next/head'
import React, { useState } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import Brands from '@components/settings/Brands'
import Categories from '@components/settings/Categories'
import Suppliers from '@components/settings/Suppliers'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'

type Props = {}

const Settings = ({}: Props) => {
  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }
  return (
    <div>
      <Head>
        <title>Account Settings</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Settings' pageTitle='Account Settings' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 lg:w-full'>
                <Card>
                  <CardHeader>
                    <Nav className='nav-tabs-custom rounded-[0.25rem] card-header-tabs border-b-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? '!text-primary text-[16.25px]' : '!text-[var(--bs-secondary-color)] text-[16.25px]'}
                          onClick={() => {
                            tabChange('1')
                          }}>
                          <>
                            <i className='fas fa-home'></i>
                            Suppliers
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '2' ? '!text-primary text-[16.25px]' : '!text-[var(--bs-secondary-color)] text-[16.25px]'}
                          onClick={() => {
                            tabChange('2')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Brands
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '3' ? '!text-primary text-[16.25px]' : '!text-[var(--bs-secondary-color)] text-[16.25px]'}
                          onClick={() => {
                            tabChange('3')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Categories
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <Suppliers />
                      </TabPane>
                      <TabPane tabId='2'>
                        <Brands />
                      </TabPane>
                      <TabPane tabId='3'>
                        <Categories />
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

export default Settings
