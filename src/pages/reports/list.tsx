import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import CreateReportModal from '@components/modals/reports/createReportModal'
import ReportsTable from '@components/reports/reportsTable'
import AppContext from '@context/AppContext'
import { PRODUCTS_REPORT_TYPE, buildCreateReportRequest, getSelectedReportProducts } from '@features/reports/reportHelpers'
import { useSkus } from '@hooks/products/useSkus'
import { ShelfCloudReportList } from '@typesTs/reports/reportsList'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import useSWR, { useSWRConfig } from 'swr'

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
      businessOrderStart: string
    }
  }
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const List = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const { skus } = useSkus()
  const [searchValue, setSearchValue] = useState<any>('')
  const [showMappedCreateReport, setshowMappedCreateReport] = useState({
    show: false,
    loading: false,
    reportType: '',
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    productsSelected: '[]',
  })

  const title = `Report List | ${session?.user?.businessName}`

  const reportListUrl = state.user.businessId ? `/api/reports/get-report-list?region=${state.currentRegion}&businessId=${state.user.businessId}` : null
  const { data }: { data?: ShelfCloudReportList[] } = useSWR(reportListUrl, fetcher)

  const handleDownloadReport = async (reportFileName: string) => {
    try {
      const queryParams = new URLSearchParams({ reportFileName })
      const reportUrlResponse = await axios(`/api/reports/get-report-url?${queryParams.toString()}`)

      if (!reportUrlResponse.data?.url) {
        toast.error('Error fetching reports')
        return
      }

      const a = document.createElement('a')
      a.href = reportUrlResponse.data.url
      a.download = 'Product Details Template.xlsx'
      a.click()
    } catch {
      toast.error('Error fetching reports')
    }
  }

  const handleCreateReport = async () => {
    if (showMappedCreateReport.startDate === '' || showMappedCreateReport.endDate === '' || showMappedCreateReport.reportType === '') {
      toast.error('Please select Report Type and Date Range')
      return
    }
    const selectedProducts = getSelectedReportProducts(skus, showMappedCreateReport.productsSelected)

    if (showMappedCreateReport.reportType === PRODUCTS_REPORT_TYPE && selectedProducts.length === 0) {
      toast.error('Please select at least one SKU')
      return
    }

    setshowMappedCreateReport((prev: any) => {
      return {
        ...prev,
        loading: true,
      }
    })

    try {
      const request = buildCreateReportRequest({
        reportType: showMappedCreateReport.reportType,
        region: state.currentRegion,
        businessId: state.user.businessId,
        businessName: session?.user?.businessName,
        startDate: showMappedCreateReport.startDate,
        endDate: showMappedCreateReport.endDate,
        products: selectedProducts,
      })
      const response = await axios.post('/api/reports/request-new-report', { url: request.url, data: request.body })

      if (response.data.error) {
        toast.error(response.data.message)
        return
      }

      setshowMappedCreateReport((prev: any) => {
        return {
          ...prev,
          show: false,
          reportType: '',
          productsSelected: '[]',
        }
      })
      toast.success(response.data.message)
      if (reportListUrl) mutate(reportListUrl)
    } catch {
      toast.error('Error creating report')
    } finally {
      setshowMappedCreateReport((prev: any) => {
        return {
          ...prev,
          loading: false,
        }
      })
    }
  }

  const reportList = useMemo(() => {
    if (!data) return []

    return data.filter((report: ShelfCloudReportList) => report?.reportName?.toLowerCase().includes(searchValue.toLowerCase()))
  }, [data, searchValue])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Report List' pageTitle='Reports' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
                    <Button
                      color='primary'
                      className='fs-6 py-1'
                      onClick={() =>
                        setshowMappedCreateReport((prev: any) => {
                          return {
                            ...prev,
                            show: true,
                            productsSelected: '[]',
                          }
                        })
                      }>
                      <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                      Create Report
                    </Button>
                  </div>
                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <Input
                          type='text'
                          className='form-control input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
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
                    <ReportsTable reportList={reportList} pending={data ? false : true} handleDownloadReport={handleDownloadReport} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {showMappedCreateReport.show && (
        <CreateReportModal showMappedCreateReport={showMappedCreateReport} setshowMappedCreateReport={setshowMappedCreateReport} handleCreateReport={handleCreateReport} />
      )}
    </div>
  )
}

export default List
