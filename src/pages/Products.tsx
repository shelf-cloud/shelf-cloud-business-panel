/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { ProductRowType, Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify'
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
import ProductsTable from '@components/ProductsTable'
import InventoryBinsModal from '@components/InventoryBinsModal'
import EditProductModal from '@components/EditProductModal'
import { CSVLink, CSVDownload } from 'react-csv'

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

const Products = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ProductRowType[]>([])
  const [tableData, setTableData] = useState<ProductRowType[]>([])
  const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR(
    state.user.businessId
      ? `/api/getBusinessInventory?businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      const list: ProductRowType[] = []

      data.forEach((product: Product) => {
        const row = {
          Image: product.image,
          Title: product.title,
          SKU: product.sku,
          ASIN: product.asin,
          FNSKU: product.fnSku,
          Barcode: product.barcode,
          Quantity: {
            quantity: product.quantity,
            inventoryId: product.inventoryId,
            businessId: product.businessId,
            sku: product.sku,
          },
          unitDimensions: {
            weight: product.weight,
            length: product.length,
            width: product.width,
            height: product.height,
          },
          boxDimensions: {
            weight: product.boxWeight,
            length: product.boxLength,
            width: product.boxWidth,
            height: product.boxHeight,
          },
          qtyBox: product.boxQty,
          btns: {
            inventoryId: product.inventoryId,
            businessId: product.businessId,
            sku: product.sku,
            state: product.activeState,
          },
        }
        list.push(row)
      })
      setTableData(list)
      setAllData(list)
      setPending(false)
    }
  }, [data])

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable = allData.filter(
        (item) =>
          item?.Title?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.SKU?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.ASIN?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.FNSKU?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item?.Barcode?.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setTableData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setTableData(allData)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setTableData(allData)
  }

  const changeProductState = async (
    inventoryId: number,
    businessId: number,
    sku: string
  ) => {
    confirm(`Are you sure you want to set Inactive: ${sku}`)

    const response = await axios.post(
      `/api/setStateToProduct?businessId=${businessId}&inventoryId=${inventoryId}`,
      {
        newState: 0,
        sku,
      }
    )
    if (!response.data.error) {
      toast.success(response.data.msg)
    } else {
      toast.error(response.data.msg)
    }
  }

  const csvData = useMemo(() => {
    const data: any[] = [
      [
        'Title',
        'SKU',
        'AISN',
        'FNSKU',
        'Barcode',
        'Quantity',
        'Weight',
        'Length',
        'Width',
        'Height',
        'Box Weight',
        'Box Length',
        'Box Width',
        'Box Height',
        'Box Quantity',
      ],
    ]

    allData.forEach((item) =>
      data.push([
        item?.Title,
        item?.SKU,
        item?.ASIN,
        item?.FNSKU,
        item?.Barcode,
        item?.Quantity?.quantity,
        item?.unitDimensions?.weight,
        item?.unitDimensions?.length,
        item?.unitDimensions?.width,
        item?.unitDimensions?.height,
        item?.boxDimensions?.weight,
        item?.boxDimensions?.length,
        item?.boxDimensions?.width,
        item?.boxDimensions?.height,
        item?.qtyBox,
      ])
    )

    return data
  }, [allData])

  const title = `Products | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Products" pageTitle="Warehouse" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <Row className="pb-3 text-end">
                      <CSVLink
                        data={csvData}
                        filename={`${session?.user?.name.toUpperCase()}-Products.csv`}
                      >
                        <Button color='primary' className='btn-label fs-6'>
                          <i className="las la-file-download label-icon align-middle fs-2 me-2" />
                          Export
                        </Button>
                      </CSVLink>
                      {/* <CSVDownload data={csvData} target="_blank" /> */}
                    </Row>
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
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
                    </form>
                  </CardHeader>
                  <CardBody>
                    <ProductsTable
                      tableData={tableData}
                      pending={pending}
                      changeProductState={changeProductState}
                      setMsg={'Set Inactive'}
                      icon={'las la-eye-slash align-bottom me-2'}
                      activeText={'text-danger'}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {state.showEditProductModal && <EditProductModal />}
    </div>
  )
}

export default Products
