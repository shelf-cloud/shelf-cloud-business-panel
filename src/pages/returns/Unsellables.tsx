import React, { useState, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import Head from 'next/head'
import { Button, Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import ReturnUnsellablesTable from '@components/returns/ReturnUnsellablesTable'
import { UnsellablesType } from '@typesTs/returns/unsellables'
import Link from 'next/link'
import FilterUnsellables from '@components/returns/FilterUnsellables'
import ExportUnsellables from '@components/returns/ExportUnsellables'

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
    }
  }
}

const Unsellables = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<UnsellablesType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [searchReason, setSearchReason] = useState<string>('')

  const fetcher = (endPoint: string) => {
    setPending(true)
    axios(endPoint)
      .then((res) => {
        setAllData(res.data)
        setPending(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching shipment Log data')
          setAllData([])
          setPending(false)
        }
      })
  }

  useSWR(session && state.user.businessId ? `/api/returns/getReturnUnsellables?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filterDataTable = useMemo(() => {
    if (searchValue === '' && searchStatus === '' && searchReason === '') {
      return allData
    }

    if (searchValue === '') {
      return allData.filter(
        (item) =>
          (searchStatus !== '' ? (searchStatus === 'dispose' ? item?.dispose : searchStatus === 'unsellable' ? !item?.converted && !item.dispose : item?.converted) : true) &&
          (searchReason !== '' ? item?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true)
      )
    }

    if (searchValue !== '') {
      return allData.filter(
        (item) =>
          (searchStatus !== '' ? (searchStatus === 'dispose' ? item?.dispose : searchStatus === 'unsellable' ? !item?.converted && !item.dispose : item?.converted) : true) &&
          (searchReason !== '' ? item?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true) &&
          (item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.barcode.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.orderNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnRMA.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnReason.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }
  }, [allData, searchValue, searchStatus, searchReason])

  const title = `Return Unsellables | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Return Unsellables' pageTitle='Orders' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
                    <div>
                      <Link href={'/Returns'}>
                        <Button color='primary' style={{ cursor: 'pointer' }}>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Returns
                          </span>
                        </Button>
                      </Link>
                    </div>
                    <FilterUnsellables searchStatus={searchStatus} setSearchStatus={setSearchStatus} searchReason={searchReason} setSearchReason={setSearchReason} />
                    <ExportUnsellables unsellables={filterDataTable || allData} />
                  </div>
                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <Input type='text' className='form-control input_background_white' placeholder='Search...' id='search-options' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
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
                    <ReturnUnsellablesTable filterDataTable={filterDataTable || []} pending={pending} />
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

export default Unsellables
