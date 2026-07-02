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
import { Button, Card, CardBody, Col, Container, Input, Row } from '@/components/migration-ui'
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
                <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-1 tw:md:flex-row tw:md:justify-between tw:md:items-center'>
                  <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
                    <Button
                      color='primary'
                      className='tw:text-[13px] tw:py-1'
                      onClick={() =>
                        setshowMappedCreateReport((prev: any) => {
                          return {
                            ...prev,
                            show: true,
                            productsSelected: '[]',
                          }
                        })
                      }>
                      <i className='mdi mdi-plus-circle label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                      Create Report
                    </Button>
                  </div>
                  <div className='tw:sm:w-full tw:md:w-3/12'>
                    <div className='app-search tw:flex tw:flex-row tw:justify-end tw:items-center tw:p-0'>
                      <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <Input
                          type='text'
                          className='input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className='mdi mdi-magnify search-widget-icon tw:text-[19.5px]'></span>
                        <span
                          className='tw:flex tw:items-center tw:justify-center input_background_white'
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => setSearchValue('')}>
                          <i className='mdi mdi-window-close tw:text-[19.5px] tw:m-0 tw:px-2 tw:py-0 tw:text-[color:var(--bs-secondary-color)]' />
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
