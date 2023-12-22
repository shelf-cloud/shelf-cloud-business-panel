import React, { useContext, useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import AppContext from '@context/AppContext'
import Head from 'next/head'
import { Card, CardBody, Container, Row, Spinner } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import axios from 'axios'
import useSWR from 'swr'
import { ListingsResponse } from '@typesTs/amazon/listings'
import SellerListingTable from '@components/amazon/listings/SellerListingTable'
import { useRouter } from 'next/router'
import { DebounceInput } from 'react-debounce-input'

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
      name: string
    }
  }
}

const Listings = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const title = `Amazon Listings | ${session?.user?.name}`
  const [searchValue, setSearchValue] = useState<any>('')
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: ListingsResponse } = useSWR(
    state.user.businessId ? `/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher
  )

  useEffect(() => {
    if (state.user) {
      if (!state.user[state.currentRegion]?.showAmazonTab && !state.user[state.currentRegion]?.amazonConnected) {
        router.push('/')
      }
    }
  }, [router, state])

  const filterDataTable = useMemo(() => {
    if (!data || data?.error) {
      return []
    }

    if (searchValue === '') {
      return data?.listings
    }

    if (searchValue !== '') {
      const newDataTable = data?.listings.filter(
        (item) =>
          item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.product_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.fnsku.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.condition.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.shelfcloud_sku?.toLowerCase().includes(searchValue.toLowerCase())
      )
      return newDataTable
    }
  }, [data, searchValue])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Amazon Listings' pageTitle='Amazon' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
              <div className='col-sm-12 col-md-3'>
                <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={300}
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center input_background_white'
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
                {data?.error ? (
                  <div>
                    <p className='fw-bold fs-2'>Amazon Seller</p>
                    <p className='fs-5 text-muted'>
                      {data?.message} <Spinner color='primary' size={'sm'} />
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <SellerListingTable tableData={filterDataTable || []} pending={data ? false : true} />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Listings
