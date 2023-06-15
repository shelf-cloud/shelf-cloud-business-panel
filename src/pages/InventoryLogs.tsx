/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { LogRowType } from '@typings'
import axios from 'axios'
import Head from 'next/head'
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
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import InventoryBinsModal from '@components/InventoryBinsModal'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'

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

const InventoryLogs = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [logData, setLogData] = useState<LogRowType[]>([])
  const [serachValue, setSerachValue] = useState('')
  const title = `Inventory Log | ${session?.user?.name}`

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getBusinessInventoryLog?region=${state.currentRegion}&businessId=${state.user.businessId}`
      : null,
    fetcher
  )
  useEffect(() => {
    if (data?.error){
      setLogData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setLogData(data)
      setPending(false)
    }
  }, [data])

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable = logData.filter(
        (log: any) =>
          log.sku.toLowerCase().includes(e.target.value.toLowerCase()) ||
          log.details.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setLogData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setLogData(data)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setLogData(data)
  }

  const columns: any = [
    {
      name: <span className="fw-bolder fs-5">SKU</span>,
      selector: (row: { sku: string }) => row.sku,
      sortable: true,
      center: true,
    },
    {
      name: <span className="fw-bolder fs-5">Date</span>,
      selector: (row: { date: string }) => row.date,
      sortable: true,
      center: true,
    },
    {
      name: <span className="fw-bolder fs-5">Details</span>,
      selector: (row: { details: string }) => row.details,
      sortable: true,
      center: true,
    },
  ]

  const conditionalRowStyles = [
    {
      when: (row: any) => row.details.includes('Added'),
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.3)',
      },
    },
    {
      when: (row: any) => row.details.includes('Remove'),
      style: {
        backgroundColor: 'rgba(245, 183, 177, 0.3)',
      },
    },
    {
      when: (row: any) => row.details.includes('Move'),
      style: {
        backgroundColor: 'rgba(250, 215, 160, 0.3)',
      },
    },
  ]

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Inventory Log" pageTitle="Warehouse" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div className="position-relative">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={filterByText}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                          className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                          id="search-close-options"
                        ></span>
                      </div>
                      <Button className="btn-soft-dark" onClick={clearSearch}>
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <DataTable
                      columns={columns}
                      data={logData}
                      progressPending={pending}
                      // pagination
                      striped={true}
                      highlightOnHover={true}
                      conditionalRowStyles={conditionalRowStyles}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      <InventoryBinsModal />
    </div>
  )
}

export default InventoryLogs
