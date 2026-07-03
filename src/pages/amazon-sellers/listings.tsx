import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import SellerListingTable from '@components/amazon/listings/SellerListingTable'
import FilterListings from '@components/ui/FilterListings'
import AppContext from '@context/AppContext'
import { Listing, ListingsResponse } from '@typesTs/amazon/listings'
import axios from 'axios'
import { CSVLink } from 'react-csv'
import { DebounceInput } from 'react-debounce-input'
import { toast } from '@/lib/toast'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { Spinner } from '@shadcn/ui/spinner'
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
    }
  }
}

const Listings = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { showHidden, condition, mapped }: any = router.query
  const { mutate } = useSWRConfig()
  const title = `Amazon Listings | ${session?.user?.businessName}`
  const [searchValue, setSearchValue] = useState<any>('')
  const [selectedRows, setSelectedRows] = useState<Listing[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data }: { data?: ListingsResponse } = useSWR(
    state.user.businessId ? `/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
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
      return data?.listings.filter(
        (item) =>
          (parseInt(showHidden) === 0 ? item.show === 1 : true) &&
          (condition === 'All' ? true : item.condition.toLowerCase().includes(condition.toLowerCase())) &&
          (mapped === 'All' ? true : mapped === 'Mapped' ? item.shelfcloud_sku : !item.shelfcloud_sku)
      )
    }

    if (searchValue !== '') {
      const newDataTable = data?.listings.filter(
        (item) =>
          (parseInt(showHidden) === 0 ? item.show === 1 : true) &&
          (condition === 'All' ? true : item.condition.toLowerCase().includes(condition.toLowerCase())) &&
          (mapped === 'All' ? true : mapped === 'Mapped' ? item.shelfcloud_sku : !item.shelfcloud_sku) &&
          (item.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.product_name.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.fnsku.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.shelfcloud_sku?.toLowerCase().includes(searchValue.toLowerCase()))
      )
      return newDataTable
    }
  }, [data, searchValue, showHidden, condition, mapped])

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const setSelectedRowstoHidden = async () => {
    if (selectedRows.length === 0) return

    const response = await axios.post(`/api/amazon/setSelectedRowsHidden?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      Listings: selectedRows,
    })

    if (!response.data.error) {
      clearAllSelectedRows()
      toast.success(response.data.message)
      mutate(`/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
  }

  const setSelectedRowstoVisible = async () => {
    if (selectedRows.length === 0) return

    const response = await axios.post(`/api/amazon/setSelectedRowsVisible?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      Listings: selectedRows,
    })

    if (!response.data.error) {
      clearAllSelectedRows()
      toast.success(response.data.message)
      mutate(`/api/amazon/getAmazonSellerListings?region=${state.currentRegion}&businessId=${state.user.businessId}`)
    } else {
      toast.error(response.data.message)
    }
  }

  const csvData = useMemo(() => {
    const fileData: any[] = [
      ['Title', 'SKU', 'AISN', 'FNSKU', 'Brand', 'Condition', 'Fulfillment Channel', 'Fulfillable', 'Reserved', 'Unsellable', 'inbound', 'ShelfCloud Mapped'],
    ]

    filterDataTable?.forEach((item: Listing) =>
      fileData.push([
        item?.product_name,
        item?.sku,
        item?.asin,
        item?.fnsku,
        item?.brand,
        item?.condition,
        'Amazon FBA',
        item?.afn_fulfillable_quantity,
        item?.afn_reserved_quantity,
        item?.afn_unsellable_quantity,
        item?.afn_inbound_working_quantity + item?.afn_inbound_shipped_quantity + item?.afn_inbound_receiving_quantity,
        item?.shelfcloud_sku,
      ])
    )

    return fileData
  }, [filterDataTable])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Amazon Listings' pageTitle='Amazon' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3 flex flex-col-reverse justify-center items-end gap-2 mb-1 md:flex-row md:justify-end md:items-center px-6'>
              <div className='app-search flex flex-row justify-between items-center p-0'>
                <div className='flex flex-row justify-start items-center gap-6'>
                  <FilterListings showHidden={showHidden} condition={condition} mapped={mapped} />
                  <Button
                    size='sm'
                    variant='info'
                    onClick={() => {
                      router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden) === 0 ? 1 : 0}&condition=${condition}&mapped=${mapped}`)
                    }}>
                    {parseInt(showHidden) === 0 ? (
                      <>
                        <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2' />
                        <span className='text-[13px]'>Show All</span>
                      </>
                    ) : (
                      <>
                        <i className='mdi mdi-eye-off label-icon align-middle text-[16.25px] me-2' />
                        <span className='text-[13px]'>Hide</span>
                      </>
                    )}
                  </Button>
                  <CSVLink data={csvData} style={{ width: 'fit-content' }} filename={`${session?.user?.businessName?.toUpperCase()}-Amazon-FBA-Listings.csv`}>
                    <Button className='text-[13px] py-1'>
                      <i className='mdi mdi-arrow-down-bold label-icon align-middle text-[16.25px] me-2' />
                      Export
                    </Button>
                  </CSVLink>
                  {selectedRows.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type='button'
                          className='inline-flex h-9 items-center gap-2 rounded-md bg-info px-3 text-[13px] font-medium text-white whitespace-nowrap shadow-xs'>
                          {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                          <ChevronDownIcon className='ml-1 size-4' />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        <DropdownMenuItem className='text-nowrap text-primary' onClick={setSelectedRowstoVisible}>
                          <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2' />
                          Set as Visible
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-nowrap text-danger' onClick={setSelectedRowstoHidden}>
                          <i className='mdi mdi-eye-off label-icon align-middle text-[16.25px] me-2' />
                          Set as Hidden
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-nowrap text-[13px] text-right' onClick={clearAllSelectedRows}>
                          Clear Selection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className='w-full md:w-1/4'>
                  <div className='relative flex rounded-lg w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={300}
                      className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon text-[19.5px]'></span>
                    <span
                      className='flex items-center justify-center input_background_white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close text-[19.5px] m-0 px-2 py-0 text-muted-foreground' />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Card>
              <CardContent>
                {data?.error ? (
                  <div>
                    <p className='font-bold text-[26px]'>Amazon Seller</p>
                    <p className='text-[16.25px] text-muted-foreground'>
                      {data?.message} <Spinner className='text-primary' />
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <SellerListingTable tableData={filterDataTable || []} pending={data ? false : true} setSelectedRows={setSelectedRows} toggledClearRows={toggledClearRows} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Listings
