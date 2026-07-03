import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import ExportProductsPerformance from '@components/marketplaces/exportProductsPerformance'
import ProductPerformanceTable from '@components/marketplaces/productPerformanceTable'
import SummaryPP from '@components/modals/productPerformance/SummaryPP'
import FilterProfits from '@components/ui/FilterProfits'
import NewFilterByDates from '@components/ui/NewFilterByDates'
import SelectMarketplaceDropDown from '@components/ui/SelectMarketplaceDropDown'
import AppContext from '@context/AppContext'
import { ProductPerformance, ProductsPerformanceResponse } from '@typesTs/marketplaces/productPerformance'
import axios from 'axios'
import moment from 'moment'
import { useQueryState } from 'nuqs'
import { DebounceInput } from 'react-debounce-input'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'
import { Collapse } from '@/components/ui/Collapse'
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

const ProductPerformanceNoFees = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { filters, grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, brand, category, showWithSales }: FilterProps = router.query

  const [searchValue, setSearchValue] = useQueryState('search', {
    defaultValue: '',
    clearOnDefault: true,
  })

  const [filterOpen, setFilterOpen] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  // const [startDate, setStartDate] = useState(moment().subtract(15, 'days').format('YYYY-MM-DD'))
  // const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [filterDates, setfilterDates] = useState({
    startDate: moment().subtract(15, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  })
  const [selectedMarketplace, setSelectedMarketplace] = useState({ storeId: '9999', name: 'All Marketplaces', logo: '' })
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

  const fetcherPP = async (endPoint: string) => {
    const controller = new AbortController()
    const signal = controller.signal

    setLoadingData(true)
    await axios(endPoint, {
      signal,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then((res) => {
        setProductsData(res.data as ProductsPerformanceResponse)
        setLoadingData(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching product performance data')
          setProductsData({})
        }
      })
  }

  useSWR(
    session && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/marketplaces/products/getProductsPerformanceNoSCFees?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${filterDates.startDate}&endDate=${filterDates.endDate}&storeId=${selectedMarketplace.storeId}`
      : null,
    fetcherPP,
    {
      revalidateOnFocus: false,
      // revalidateOnMount: false,
    }
  )

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
          (showWithSales == undefined || !showWithSales ? true : showWithSales === 'false' ? item.unitsSold > 0 : true)
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
          (showWithSales == undefined || !showWithSales ? true : showWithSales === 'false' ? item.unitsSold > 0 : true) &&
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
    const newDates = {
      startDate: moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'),
      endDate: moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD'),
    }
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      newDates.startDate = moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD')
      newDates.endDate = moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD')
      setfilterDates(newDates)
      return
    }
    if (filterDates.startDate === moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD')) {
      newDates.endDate = moment(dateStr, 'DD MMM YY').format('YYYY-MM-DD')
      setfilterDates(newDates)
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
    let filterString = `/marketplaces/productPerformanceNoFees?filters=true`
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

  const title = `Product Performance NO SC Fees | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Product Performance NO SC Fees' pageTitle='Marketplaces' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3 flex-col justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center px-3'>
              <div className='flex flex-col gap-2 justify-between items-center p-0 lg:flex-row'>
                <div className='flex flex-wrap justify-start items-center gap-2 w-full'>
                  <button
                    className={'inline-flex h-9 items-center gap-1 rounded-md px-3 text-[11.2px] font-semibold whitespace-nowrap ' + (filters === 'true' ? 'bg-info text-info-foreground' : 'bg-white border border-[#E1E3E5] text-foreground')}
                    style={filters === 'true' ? {} : { backgroundColor: 'white', border: '1px solid #E1E3E5' }}
                    type='button'
                    aria-expanded='false'
                    onClick={() => setFilterOpen(!filterOpen)}>
                    Filters
                  </button>
                  <NewFilterByDates filterDates={filterDates} setfilterDates={setfilterDates} handleChangeDatesFromPicker={handleChangeDatesFromPicker} />
                  {/* <FilterByDates
                    shipmentsStartDate={startDate}
                    setShipmentsStartDate={setStartDate}
                    setShipmentsEndDate={setEndDate}
                    shipmentsEndDate={endDate}
                    handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                  /> */}
                  <SelectMarketplaceDropDown
                    selectionInfo={data?.marketplaces || []}
                    selected={selectedMarketplace}
                    handleSelection={setSelectedMarketplace}
                    showAllMarketsOption
                  />
                  <ExportProductsPerformance
                    products={filterDataTable || []}
                    marketpalces={data?.marketplaces || []}
                    startDate={filterDates.startDate}
                    endDate={filterDates.endDate}
                    selectedMarketplaceStoreId={selectedMarketplace.storeId}
                  />
                  <Button variant='info' onClick={() => setsummaryModal({ show: true })}>
                    PP Summary
                  </Button>
                </div>
                <div className='w-full xl:w-1/4'>
                  <div className='relative flex rounded-md w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={500}
                      className='h-9 w-full border-0 bg-white px-3 text-sm outline-none'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify hidden'></span>
                    <span
                      className='flex items-center justify-center bg-white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close text-[19.5px] m-0 px-2 py-0 text-muted-foreground' />
                    </span>
                  </div>
                </div>
              </div>
              <Collapse className='px-0' isOpen={filterOpen}>
                <Card className='mb-0' style={{ zIndex: '999' }}>
                  <CardContent className='w-full'>
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
                      showWithSales={showWithSales !== undefined || showWithSales ? showWithSales : 'true'}
                      supplierOptions={data?.suppliers || []}
                      brandOptions={data?.brands || []}
                      categoryOptions={data?.categories || []}
                      handleApplyFilters={handleApplyFilters}
                      setFilterOpen={setFilterOpen}
                      destination='productPerformanceNoFees'
                    />
                  </CardContent>
                </Card>
              </Collapse>
            </div>
            <Card>
              <CardContent>
                {loadingData ? (
                  <div>
                    <p className='font-bold text-[26px]'>Product Performance No SC Fees</p>
                    <div className='text-[16.25px] text-muted-foreground flex flex-row gap-3'>
                      {`Loading Profit Report from ${selectedMarketplace.name} please wait...`}
                      <>
                        <Spinner className='text-primary' />
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
              </CardContent>
            </Card>
          </div>
        </div>
        {summaryModal.show && <SummaryPP productsData={filterDataTable || []} summaryModal={summaryModal} setsummaryModal={setsummaryModal} />}
      </React.Fragment>
    </div>
  )
}

export default ProductPerformanceNoFees
