/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR, { useSWRConfig } from 'swr'
import ProductsTable from '@components/ProductsTable'
import InventoryBinsModal from '@components/InventoryBinsModal'
// import { CSVLink } from 'react-csv'
import Link from 'next/link'
import ExportProductsTemplate from '@components/products/ExportProductsTemplate'
import { DebounceInput } from 'react-debounce-input'
import FilterProducts from '@components/ui/FilterProducts'
import { useRouter } from 'next/router'
import ExportBlankTemplate from '@components/products/ExportBlankTemplate'
import ImportProductsFileModal from '@components/modals/products/ImportProductsFileModal'
import ExportProductsFile from '@components/products/ExportProductsFile'
import CloneProductModal from '@components/modals/products/CloneProductModal'
import ProductsWidgets from '@components/products/ProductsWidgets'

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

const Products = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { brand, supplier, category, condition }: any = router.query
  const { mutate } = useSWRConfig()
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<Product[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<Product[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [importModalDetails, setimportModalDetails] = useState({
    show: false,
  })
  const [cloneProductModal, setcloneProductModal] = useState({
    isOpen: false,
    originalId: 0,
    originalName: '',
    originalSku: '',
  })
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setAllData(data?.products)
      setPending(false)
    }
  }, [data])

  const filterDataTable = useMemo(() => {
    if (!data?.products || data?.error) {
      return []
    }

    if (searchValue === '') {
      const newDataTable = allData?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase())
      )
      return newDataTable
    }

    if (searchValue !== '') {
      const newDataTable = allData?.filter(
        (item: Product) =>
          (brand === 'All' ? true : item.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (supplier === 'All' ? true : item.supplier?.toLowerCase() === supplier?.toLowerCase()) &&
          (category === 'All' ? true : item.category?.toLowerCase() === category?.toLowerCase()) &&
          (condition === 'All' ? true : item.itemCondition?.toLowerCase() === condition?.toLowerCase()) &&
          (item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) ||
            item?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.fnSku?.toLowerCase().includes(searchValue.toLowerCase()) ||
            item?.barcode?.toLowerCase().includes(searchValue.toLowerCase()))
      )
      return newDataTable
    }
  }, [allData, searchValue, brand, supplier, category, condition])

  const changeProductState = async (inventoryId: number, businessId: number, sku: string) => {
    const confirmationResponse = confirm(`Are you sure you want to set Inactive: ${sku}`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/setStateToProduct?region=${state.currentRegion}&businessId=${businessId}&inventoryId=${inventoryId}`, {
        newState: 0,
        sku,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    }
  }
  const changeSelectedProductsState = async () => {
    if (selectedRows.length <= 0) return

    if (selectedRows.some((item) => item?.quantity > 0)) {
      toast.warning('Only products with 0 stock can be set as Inactive.')
      return
    }

    const confirmationResponse = confirm(`Are you sure you want to set Inactive Selected Products?`)

    if (confirmationResponse) {
      const response = await axios.post(`/api/products/setStateToSelectedProducts?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newState: 0,
        selectedRows,
      })
      if (!response.data.error) {
        setToggleClearRows(!toggledClearRows)
        setSelectedRows([])
        toast.success(response.data.msg)
        mutate(`/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    }
  }
  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const title = `Products | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Products' pageTitle='Warehouse' />
          <Container fluid>
            <ProductsWidgets />
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-2'>
                    <FilterProducts
                      brands={data?.brands}
                      suppliers={data?.suppliers}
                      categories={data?.categories}
                      brand={brand}
                      supplier={supplier}
                      category={category}
                      condition={condition}
                      activeTab={true}
                    />
                    <Link href={'/AddProduct'}>
                      <Button color='primary' size='sm' className='fs-7 text-nowrap'>
                        <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                        Basic Product
                      </Button>
                    </Link>
                    {/* <Button type='button' color='primary' className='fs-6 py-1' onClick={handleGetProductsDetailsTemplate}>
                      <i className='mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2' />
                      {loadingCsv ? <Spinner color='white' size={'sm'} /> : 'Export'}
                    </Button> */}
                    {/* <Link href={'/ProductsBulkEdit'} passHref>
                      <Button type='button' color='primary' className='fs-6 py-1'>
                        <i className='mdi mdi-database-edit label-icon align-middle fs-5 me-2' />
                        Bulk Edit
                      </Button>
                    </Link> */}
                    {/* <CSVLink className='d-none' data={productsDetailsTemplate} filename={`${session?.user?.name.toUpperCase()}-Products-Details.csv`} ref={csvDownload} /> */}
                    <UncontrolledButtonDropdown>
                      <DropdownToggle className='fs-7' caret>
                        Bulk Actions
                      </DropdownToggle>
                      <DropdownMenu>
                        {filterDataTable!.length > 0 && (
                          <ExportProductsTemplate
                            products={selectedRows.length == 0 ? filterDataTable || [] : selectedRows}
                            selected={selectedRows.length > 0 ? true : false}
                            brands={data?.brands || []}
                            suppliers={data?.suppliers || []}
                            categories={data?.categories || []}
                          />
                        )}
                        <ExportBlankTemplate brands={data?.brands || []} suppliers={data?.suppliers || []} categories={data?.categories || []} />
                        <DropdownItem
                          className='text-nowrap text-primary'
                          onClick={() =>
                            setimportModalDetails((prev) => {
                              return { ...prev, show: true }
                            })
                          }>
                          <i className='mdi mdi-arrow-up-bold label-icon align-middle fs-6 me-2' />
                          Import Add/Update
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                    {selectedRows.length > 0 && (
                      <UncontrolledButtonDropdown>
                        <DropdownToggle className='btn btn-primary fs-6 py-2' caret>
                          <span className='fw-bold'>{`${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                        </DropdownToggle>
                        <DropdownMenu>
                          <ExportProductsFile products={selectedRows} />
                          <DropdownItem className='text-nowrap text-danger' onClick={changeSelectedProductsState}>
                            <i className='mdi mdi-eye-off label-icon align-middle fs-6 me-2' />
                            Set Inactive
                          </DropdownItem>
                          <DropdownItem className='text-nowrap text-end fs-6 text-muted' onClick={clearAllSelectedRows}>
                            Clear All
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledButtonDropdown>
                    )}
                  </div>
                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <DebounceInput
                          type='text'
                          minLength={2}
                          debounceTimeout={500}
                          className='form-control input_background_white fs-6'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
                          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                        <span className='d-flex align-items-center justify-content-center input_background_white' style={{ cursor: 'pointer' }} onClick={() => setSearchValue('')}>
                          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                        </span>
                      </div>
                    </div>
                  </div>
                </Row>
                <Card>
                  <CardBody>
                    <ProductsTable
                      tableData={filterDataTable || []}
                      pending={pending}
                      changeProductState={changeProductState}
                      setMsg={'Set Inactive'}
                      icon={'las la-eye-slash align-middle fs-5 me-2'}
                      activeText={'text-danger'}
                      setSelectedRows={setSelectedRows}
                      toggledClearRows={toggledClearRows}
                      setcloneProductModal={setcloneProductModal}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {importModalDetails.show && (
        <ImportProductsFileModal
          importModalDetails={importModalDetails}
          setimportModalDetails={setimportModalDetails}
          brands={data?.brands}
          suppliers={data?.suppliers}
          categories={data?.categories}
        />
      )}
      {cloneProductModal.isOpen && <CloneProductModal cloneProductModal={cloneProductModal} setcloneProductModal={setcloneProductModal} />}
    </div>
  )
}

export default Products
