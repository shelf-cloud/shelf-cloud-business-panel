import React, { useContext, useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import AppContext from '@context/AppContext'
import Head from 'next/head'
import { Button, Card, CardBody, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner, UncontrolledButtonDropdown } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import axios from 'axios'
import useSWR, { useSWRConfig } from 'swr'
import { Listing, ListingsResponse } from '@typesTs/amazon/listings'
import SellerListingTable from '@components/amazon/listings/SellerListingTable'
import { useRouter } from 'next/router'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { CSVLink } from 'react-csv'
import FilterListings from '@components/ui/FilterListings'

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

const Listings = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { showHidden, condition, mapped }: any = router.query
  const { mutate } = useSWRConfig()
  const title = `Amazon Listings | ${session?.user?.name}`
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
          <Container fluid>
            <BreadCrumb title='Amazon Listings' pageTitle='Amazon' />
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center px-3'>
              <div className='app-search d-flex flex-row justify-content-between align-items-center p-0'>
                <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                  <FilterListings showHidden={showHidden} condition={condition} mapped={mapped} />
                  <Button
                    size='sm'
                    color='info'
                    onClick={() => {
                      router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden) === 0 ? 1 : 0}&condition=${condition}&mapped=${mapped}`)
                    }}>
                    {parseInt(showHidden) === 0 ? (
                      <>
                        <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                        <span className='fs-6'>Show All</span>
                      </>
                    ) : (
                      <>
                        <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2' />
                        <span className='fs-6'>Hide</span>
                      </>
                    )}
                  </Button>
                  <CSVLink data={csvData} style={{ width: 'fit-content' }} filename={`${session?.user?.name.toUpperCase()}-Amazon-FBA-Listings.csv`}>
                    <Button color='primary' className='fs-6 py-1'>
                      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
                      Export
                    </Button>
                  </CSVLink>
                  {selectedRows.length > 0 && (
                    <UncontrolledButtonDropdown>
                      <DropdownToggle className='btn btn-info fs-6 py-2' caret>
                        {`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''} Selected`}
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem className='text-nowrap text-primary' onClick={setSelectedRowstoVisible}>
                          <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                          Set as Visible
                        </DropdownItem>
                        <DropdownItem className='text-nowrap text-danger' onClick={setSelectedRowstoHidden}>
                          <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2' />
                          Set as Hidden
                        </DropdownItem>
                        <DropdownItem className='text-nowrap fs-6 text-end' onClick={clearAllSelectedRows}>
                          Clear Selection
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  )}
                </div>
                <div className='col-sm-12 col-md-3'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
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
                {data?.error ? (
                  <div>
                    <p className='fw-bold fs-2'>Amazon Seller</p>
                    <p className='fs-5 text-muted'>
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
