import BreadCrumb from '@components/Common/BreadCrumb'
import StorageTable from '@components/StorageTable'
import AppContext from '@context/AppContext'
import { StorageRowProduct } from '@typings'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'
import useSWR from 'swr'
import StorageWidgets from '@components/StorageWidgets'
import { toast } from 'react-toastify'
import StorageChart from '@components/StorageChart'
import CountUp from 'react-countup'

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
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<StorageRowProduct[]>([])
  const [storageInvoices, setStorageInvoices] = useState<any[]>([])
  const [storageDates, setStorageDates] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState<string>('')

  const filteredItems = useMemo(() => {
    return allData.filter(
      (item: StorageRowProduct) =>
        item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        searchValue.split(' ').every((word: string) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
        item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item?.bins?.some((bin) => bin.binName.toLowerCase().includes(searchValue.toLowerCase()))
    )
  }, [allData, searchValue])

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getStorageInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setStorageDates([])
      setStorageInvoices([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setAllData(data.inventory)
      setStorageInvoices(data.storageFees)
      setStorageDates(data.storageDate)
      setPending(false)
    }
  }, [data])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Storage' pageTitle='Warehouse' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='d-flex flex-column flex-md-row justify-content-start gap-0 gap-md-4 mb-2'>
                      <div className='col-xs-12 col-sm-6 col-lg-5 col-xl-4 col-xxl-3'>
                        <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Monthly Storage Fees</p>
                        <StorageChart storageInvoices={storageInvoices} storageDates={storageDates} />
                      </div>
                      <StorageWidgets
                        previousCharge={storageInvoices[storageInvoices.length - 1]}
                        previousChargeDate={storageDates[storageDates.length - 1]}
                        currentBalance={data?.dailyStorageBalance}
                        binsUSed={data?.totalBinsUSed}
                      />
                    </div>
                    <div className='d-flex flex-row justify-content-between'>
                      <div>
                        <p className='text-uppercase fw-semibold text-muted text-truncate mb-0'>*Estimated Total Monthly Cost</p>
                        <h4 className='fs-18 fw-normal text-muted'>
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
                      <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                        <div className='position-relative'>
                          <Input
                            type='text'
                            className='form-control'
                            placeholder='Search...'
                            id='search-options'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          <span className='mdi mdi-magnify search-widget-icon'></span>
                          <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none' id='search-close-options'></span>
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
