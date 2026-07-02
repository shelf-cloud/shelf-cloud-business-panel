import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import StorageChart from '@components/StorageChart'
import StorageTable from '@components/StorageTable'
import StorageWidgets from '@components/StorageWidgets'
import AppContext from '@context/AppContext'
import { StorageRowProduct } from '@typings'
import axios from 'axios'
import { getSession } from 'next-auth/react'
import CountUp from 'react-countup'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from '@/components/migration-ui'
import useSWR from 'swr'

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

const Storage = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Inventory Log | ${session?.user?.businessName}`
  const [searchValue, setSearchValue] = useState<string>('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/storage/getStorageInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  const storageInvoices = data?.error ? [] : data?.storageFees || []
  const storageDates = data?.error ? [] : data?.storageDate || []
  const pending = !data

  const filteredItems = useMemo(() => {
    const allData = data?.error ? [] : (data?.inventory as StorageRowProduct[]) || []
    return allData.filter(
      (item: StorageRowProduct) =>
        item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        searchValue.split(' ').every((word: string) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
        item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.bins?.some((bin) => bin.binName.toLowerCase().includes(searchValue.toLowerCase()))
    )
  }, [data?.error, data?.inventory, searchValue])

  useEffect(() => {
    if (data?.error) {
      toast.error(data?.message)
    }
  }, [data?.error, data?.message])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Storage' pageTitle='Billing' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='flex flex-col md:flex-row justify-start gap-0 md:gap-6 mb-2'>
                      <div className='w-full sm:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4'>
                        <p className='uppercase font-semibold text-primary truncate mb-0'>Monthly Storage Fees</p>
                        <StorageChart storageInvoices={storageInvoices} storageDates={storageDates} />
                      </div>
                      <StorageWidgets
                        previousCharge={storageInvoices[storageInvoices.length - 1]}
                        previousChargeDate={storageDates[storageDates.length - 1]}
                        currentBalance={data?.dailyStorageBalance}
                        binsUSed={data?.totalBinsUSed}
                      />
                    </div>
                    <div className='flex flex-row justify-between'>
                      <div>
                        <p className='uppercase font-semibold text-[var(--bs-secondary-color)] truncate mb-0'>*Estimated Total Monthly Cost</p>
                        <h4 className='text-[18px] font-normal text-[var(--bs-secondary-color)]'>
                          <span className='counter-value'>
                            <CountUp
                              start={0}
                              prefix={'$'}
                              // suffix={item.suffix}
                              separator={'.'}
                              end={data?.totalCurrentBalance}
                              decimals={2}
                              duration={1}
                            />
                          </span>
                        </h4>
                      </div>
                      <div className='app-search flex flex-row justify-end items-center p-0'>
                        <div className='relative'>
                          <Input
                            type='text'
                            placeholder='Search...'
                            id='search-options'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          <span className='mdi mdi-magnify search-widget-icon'></span>
                          <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close hidden' id='search-close-options'></span>
                        </div>
                        <Button className='btn-soft-dark' onClick={() => setSearchValue('')}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <StorageTable tableData={filteredItems || []} pending={pending} />
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

export default Storage
