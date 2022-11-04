import BreadCrumb from '@components/Common/BreadCrumb'
import StorageTable from '@components/StorageTable'
import AppContext from '@context/AppContext'
import { StorageRowProduct } from '@typings'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from 'reactstrap'
import useSWR from 'swr'
import StorageWidgets from '@components/StorageWidgets'

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

const Storage = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Inventory Log | ${session?.user?.name}`
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<StorageRowProduct[]>([])
  const [serachValue, setSerachValue] = useState('')

  const filteredItems = useMemo(() => {
    return allData.filter(
      (item: StorageRowProduct) =>
        item?.title?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.sku?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.bins?.some((bin) =>
          bin.binName.toLowerCase().includes(serachValue.toLowerCase())
        )
    )
  }, [allData, serachValue])

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getStorageInventory?businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      setAllData(data.inventory)
      setPending(false)
    }
  }, [data])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Storage" pageTitle="Warehouse" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <StorageWidgets
                      currentBalance={data?.totalCurrentBalance}
                      binsUSed={data?.totalBinsUSed}
                    />
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div className="position-relative">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={(e) => setSerachValue(e.target.value)}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                          className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                          id="search-close-options"
                        ></span>
                      </div>
                      <Button
                        className="btn-soft-dark"
                        onClick={() => setSerachValue('')}
                      >
                        Clear
                      </Button>
                    </form>
                  </CardHeader>
                  <CardBody>
                    <StorageTable
                      tableData={filteredItems || []}
                      pending={pending}
                    />
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
