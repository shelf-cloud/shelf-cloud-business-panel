/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Card, CardBody, Collapse, Container, Row, Spinner } from 'reactstrap'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import Head from 'next/head'
import BreadCrumb from '@components/Common/BreadCrumb'
import { DebounceInput } from 'react-debounce-input'
import moment from 'moment'
import FilterByDates from '@components/FilterByDates'
import FilterProfits from '@components/ui/FilterProfits'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { ProductPerformance, ProductsPerformanceResponse } from '@typesTs/marketplaces/productPerformance'
import useSWR from 'swr'
import SelectMarketplaceDropDown from '@components/ui/SelectMarketplaceDropDown'
import { toast } from 'react-toastify'
import ProductPerformanceTable from '@components/marketplaces/productPerformanceTable'
import ExportProductsPerformance from '@components/marketplaces/exportProductsPerformance'
import SummaryPP from '@components/modals/productPerformance/SummaryPP'

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

type FilterProps = {
  filters?: string
  grossmin?: string
  grossmax?: string
  profitmin?: string
  profitmax?: string
  unitsmin?: string
  unitsmax?: string
  supplier?: string
  brand?: string
  category?: string
  showWithSales?: string
}

type MarketpalcesInfo = {
  error?: boolean
  suppliers: string[]
  brands: string[]
  categories: string[]
  marketplaces: {
    storeId: string
    name: string
    logo: string
  }[]
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const Profits = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { filters, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showWithSales }: FilterProps = router.query
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [startDate, setStartDate] = useState(moment().subtract(15, 'days').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [selectedMarketplace, setSelectedMarketplace] = useState({ storeId: 9999, name: 'All Marketplaces', logo: '' })
  const [productsData, setProductsData] = useState<ProductsPerformanceResponse>({})

  const [summaryModal, setsummaryModal] = useState({
    show: false,
  })

  const { data }: { data?: MarketpalcesInfo } = useSWR(
    state.user.businessId ? `/api/marketplaces/getMarketplacesInfo?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const getNewDateRange = async () => {
      setLoadingData(true)
      await axios(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/marketplaces/products/getProductsPerformance?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}&storeId=${selectedMarketplace.storeId}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
        .then((res) => {
          setProductsData(res.data as ProductsPerformanceResponse)
          setLoadingData(false)
        })
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error(error?.data?.message || 'Error fetching product performance data')
            setProductsData({})
          }
        })
    }
    if (session && state.user.businessId) getNewDateRange()

    return () => {
      controller.abort()
    }
  }, [session, state.user.businessId, endDate, selectedMarketplace])

  const filterDataTable = useMemo(() => {
    if (!productsData || productsData?.error) {
      return []
    }

    if (searchValue === '') {
      return Object.values(productsData).filter(
        (item: ProductPerformance) =>
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase().includes(supplier.toLowerCase()) : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showWithSales === undefined || showWithSales === '' ? item.unitsSold > 0 : showWithSales === 'false' ? item.unitsSold > 0 : true)
      )
    }

    if (searchValue !== '') {
      return Object.values(productsData).filter(
        (item: ProductPerformance) =>
          (grossmin !== undefined && grossmin !== '' ? item.grossRevenue >= parseFloat(grossmin!) : true) &&
          (grossmax !== undefined && grossmax !== '' ? item.grossRevenue <= parseFloat(grossmax!) : true) &&
          (profitmin !== undefined && profitmin !== '' ? item.grossRevenue - item.expenses >= parseFloat(profitmin!) : true) &&
          (profitmax !== undefined && profitmax !== '' ? item.grossRevenue - item.expenses <= parseFloat(profitmax!) : true) &&
          (unitsmin !== undefined && unitsmin !== '' ? item.unitsSold >= parseInt(unitsmin!) : true) &&
          (unitsmax !== undefined && unitsmax !== '' ? item.unitsSold <= parseInt(unitsmax!) : true) &&
          (supplier !== undefined && supplier !== '' ? item.supplier.toLowerCase().includes(supplier.toLowerCase()) : true) &&
          (brand !== undefined && brand !== '' ? item.brand.toLowerCase() === brand.toLowerCase() : true) &&
          (category !== undefined && category !== '' ? item.category.toLowerCase() === category.toLowerCase() : true) &&
          (showWithSales == undefined || showWithSales == '' ? item.unitsSold > 0 : showWithSales === 'false' ? item.unitsSold > 0 : true) &&
          (item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item.supplier.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }
  }, [productsData, searchValue, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showWithSales])

  const handleChangeDatesFromPicker = (dateStr: string) => {
    setStartDate(moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'))
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
      return
    }
    if (startDate === moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD')) {
      setEndDate(moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'))
      return
    }
  }

  const handleApplyFilters = (
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    showWithSales: string
  ) => {
    let filterString = `/marketplaces/productPerformance?filters=true`
    if (grossmin || grossmin !== '') filterString += `&grossmin=${grossmin}`
    if (grossmax || grossmax !== '') filterString += `&grossmax=${grossmax}`
    if (profitmin || profitmin !== '') filterString += `&profitmin=${profitmin}`
    if (profitmax || profitmax !== '') filterString += `&profitmax=${profitmax}`
    if (unitsmin || unitsmin !== '') filterString += `&unitsmin=${unitsmin}`
    if (unitsmax || unitsmax !== '') filterString += `&unitsmax=${unitsmax}`
    if (supplier || supplier !== '') filterString += `&supplier=${supplier}`
    if (brand || brand !== '') filterString += `&brand=${brand}`
    if (category || category !== '') filterString += `&category=${category}`
    if (showWithSales || showWithSales !== '') filterString += `&showWithSales=${showWithSales}`
    router.push(filterString, undefined, { shallow: true })
  }

  const title = `Product Performance | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Product Performance' pageTitle='Marketplaces' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='app-search d-flex flex-sm-column justify-content-between align-items-center p-0 flex-xl-row gap-sm-2 gap-xl-0'>
                <div className='d-flex flex-wrap justify-content-start align-items-center gap-3 w-100'>
                  <button
                    className={'btn dropdown-toggle ' + (filters === 'true' ? 'btn-info' : 'btn-light')}
                    style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                    type='button'
                    data-bs-toggle='dropdown'
                    data-bs-auto-close='outside'
                    aria-expanded='false'
                    onClick={() => setFilterOpen(!filterOpen)}>
                    Filters
                  </button>
                  <FilterByDates
                    shipmentsStartDate={startDate}
                    setShipmentsStartDate={setStartDate}
                    setShipmentsEndDate={setEndDate}
                    shipmentsEndDate={endDate}
                    handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                  />
                  <SelectMarketplaceDropDown selectionInfo={data?.marketplaces || []} selected={selectedMarketplace} handleSelection={setSelectedMarketplace} />
                  <ExportProductsPerformance products={filterDataTable || []} marketpalces={data?.marketplaces || []} startDate={startDate} endDate={endDate} />
                  <Button color='info' onClick={() => setsummaryModal({ show: true })}>
                    PP Summary
                  </Button>
                </div>
                <div className='col-sm-12 col-xl-3'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={500}
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
              <Collapse className='px-0' isOpen={filterOpen}>
                <Card className='mb-0' style={{ zIndex: '999' }}>
                  <CardBody className='w-100'>
                    <FilterProfits
                      grossmin={grossmin !== undefined ? grossmin : ''}
                      grossmax={grossmax !== undefined ? grossmax : ''}
                      profitmin={profitmin !== undefined ? profitmin : ''}
                      profitmax={profitmax !== undefined ? profitmax : ''}
                      unitsmin={unitsmin !== undefined ? unitsmin : ''}
                      unitsmax={unitsmax !== undefined ? unitsmax : ''}
                      supplier={supplier !== undefined ? supplier : ''}
                      brand={brand !== undefined ? brand : ''}
                      category={category !== undefined ? category : ''}
                      showWithSales={showWithSales !== undefined || showWithSales === '' ? showWithSales : 'false'}
                      supplierOptions={data?.suppliers || []}
                      brandOptions={data?.brands || []}
                      categoryOptions={data?.categories || []}
                      handleApplyFilters={handleApplyFilters}
                      setFilterOpen={setFilterOpen}
                    />
                  </CardBody>
                </Card>
              </Collapse>
            </Row>
            <Card>
              <CardBody>
                {loadingData ? (
                  <div>
                    <p className='fw-bold fs-2'>Product Performance</p>
                    <div className='fs-5 text-muted d-flex flex-row gap-3'>
                      {`Loading Profit Report from ${selectedMarketplace.name} please wait...`}
                      <>
                        <Spinner color='primary' size={'sm'} />
                      </>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>
                      <ProductPerformanceTable tableData={filterDataTable || []} pending={loadingData} selectedMarketplace={selectedMarketplace} />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Container>
        </div>
        {summaryModal.show && <SummaryPP productsData={filterDataTable || []} summaryModal={summaryModal} setsummaryModal={setsummaryModal} />}
      </React.Fragment>
    </div>
  )
}

export default Profits
