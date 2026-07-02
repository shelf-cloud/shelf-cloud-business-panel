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
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner, UncontrolledButtonDropdown } from '@/components/migration-ui'
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
          <Container fluid>
            <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-1 tw:md:tw:flex-row tw:md:justify-end tw:md:items-center tw:px-6'>
              <div className='app-search tw:flex tw:flex-row tw:justify-between tw:items-center tw:p-0'>
                <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-6'>
                  <FilterListings showHidden={showHidden} condition={condition} mapped={mapped} />
                  <Button
                    size='sm'
                    color='info'
                    onClick={() => {
                      router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden) === 0 ? 1 : 0}&condition=${condition}&mapped=${mapped}`)
                    }}>
                    {parseInt(showHidden) === 0 ? (
                      <>
                        <i className='mdi mdi-eye label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                        <span className='tw:text-[13px]'>Show All</span>
                      </>
                    ) : (
                      <>
                        <i className='mdi mdi-eye-off label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                        <span className='tw:text-[13px]'>Hide</span>
                      </>
                    )}
                  </Button>
                  <CSVLink data={csvData} style={{ width: 'fit-content' }} filename={`${session?.user?.businessName?.toUpperCase()}-Amazon-FBA-Listings.csv`}>
                    <Button color='primary' className='tw:text-[13px] tw:py-1'>
                      <i className='mdi mdi-arrow-down-bold label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                      Export
                    </Button>
                  </CSVLink>
                  {selectedRows.length > 0 && (
                    <UncontrolledButtonDropdown>
                      <DropdownToggle
                        className='tw:inline-flex tw:h-9 tw:items-center tw:gap-2 tw:rounded-md tw:bg-info tw:px-3 tw:text-[13px] tw:font-medium tw:text-white tw:whitespace-nowrap tw:shadow-xs'
                        caret>
                        {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem className='tw:text-nowrap tw:text-primary' onClick={setSelectedRowstoVisible}>
                          <i className='mdi mdi-eye label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                          Set as Visible
                        </DropdownItem>
                        <DropdownItem className='tw:text-nowrap tw:text-danger' onClick={setSelectedRowstoHidden}>
                          <i className='mdi mdi-eye-off label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                          Set as Hidden
                        </DropdownItem>
                        <DropdownItem className='tw:text-nowrap tw:text-[13px] tw:text-right' onClick={clearAllSelectedRows}>
                          Clear Selection
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  )}
                </div>
                <div className='tw:w-full tw:md:w-1/4'>
                  <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={3}
                      debounceTimeout={300}
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
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
                {data?.error ? (
                  <div>
                    <p className='tw:font-bold tw:text-[26px]'>Amazon Seller</p>
                    <p className='tw:text-[16.25px] tw:text-[var(--bs-secondary-color)]'>
                      {data?.message} <Spinner color='primary' size={'sm'} />
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <SellerListingTable tableData={filterDataTable || []} pending={data ? false : true} setSelectedRows={setSelectedRows} toggledClearRows={toggledClearRows} />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Listings
