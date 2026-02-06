import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import { LogRowType } from '@typings'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'
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

const InventoryLogs = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [serachValue, setSerachValue] = useState('')
  const title = `Inventory Log | ${session?.user?.businessName}`

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInventoryLog?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)
  const pending = !data
  const filteredData = useMemo(() => {
    const allLogData = data?.error ? [] : (data as LogRowType[]) || []
    if (!serachValue) return allLogData

    const searchLower = serachValue.toLowerCase()
    return allLogData.filter((log: any) => log.sku.toLowerCase().includes(searchLower) || log.details.toLowerCase().includes(searchLower))
  }, [data, serachValue])

  useEffect(() => {
    if (data?.error) {
      toast.error(data?.message)
    }
  }, [data?.error, data?.message])

  const filterByText = (e: any) => {
    setSerachValue(e.target.value)
  }
  const clearSearch = () => {
    setSerachValue('')
  }

  const columns: any = [
    {
      name: <span className='fw-bolder fs-5'>SKU</span>,
      selector: (row: { sku: string }) => row.sku,
      sortable: true,
      center: true,
    },
    {
      name: <span className='fw-bolder fs-5'>Date</span>,
      selector: (row: { date: string }) => row.date,
      sortable: true,
      center: true,
    },
    {
      name: <span className='fw-bolder fs-5'>Details</span>,
      selector: (row: { details: string }) => row.details,
      sortable: true,
      left: true,
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
        <div className='page-content'>
          <BreadCrumb title='Inventory Log' pageTitle='Warehouse' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative'>
                        <Input type='text' className='form-control' placeholder='Search...' id='search-options' value={serachValue} onChange={filterByText} />
                        <span className='mdi mdi-magnify search-widget-icon'></span>
                        <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none' id='search-close-options'></span>
                      </div>
                      <Button className='btn-soft-dark' onClick={clearSearch}>
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <DataTable
                      columns={columns}
                      data={filteredData}
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
    </div>
  )
}

export default InventoryLogs
