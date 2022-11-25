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
import { CSVLink } from 'react-csv'

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
  const { data } = useSWR(
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
                <Row className="d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-3 flex-md-row justify-content-md-between align-items-md-center">
                  <div className='col-sm-12 col-md-3'>
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div className="position-relative d-flex rounded-3 w-100 overflow-hidden" style={{border: '1px solid #E1E3E5'}}>
                        <Input
                          type="text"
                          className="form-control input_background_white"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={filterByText}
                        />
                        <span className="mdi mdi-magnify search-widget-icon fs-4"></span>
                        <span className="d-flex align-items-center justify-content-center input_background_white" style={{cursor: 'pointer'}} onClick={clearSearch}>
                          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                        </span>
                      </div>
                    </form>
                  </div>
                  <div className='w-auto'>
                    <CSVLink
                      data={csvData}
                      style={{ width: 'fit-content' }}
                      filename={`${session?.user?.name.toUpperCase()}-Products.csv`}
                    >
                      <Button color="primary" className="fs-5 py-1 p3-1">
                        <i className="mdi mdi-arrow-down-bold label-icon align-middle fs-5 me-2" />
                        Export
                      </Button>
                    </CSVLink>
                  </div>
                </Row>
                <Card>
                  {/* <CardHeader>
                  </CardHeader> */}
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
