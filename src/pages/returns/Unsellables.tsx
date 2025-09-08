import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import ExportUnsellables from '@components/returns/ExportUnsellables'
import FilterUnsellables from '@components/returns/FilterUnsellables'
import ReturnUnsellablesTable from '@components/returns/ReturnUnsellablesTable'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { UnsellablesType } from '@typesTs/returns/unsellables'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap'
import useSWR from 'swr'

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
            item.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnRMA?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.returnReason?.toLowerCase().includes(searchValue.toLowerCase()))
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
                  <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' />
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
