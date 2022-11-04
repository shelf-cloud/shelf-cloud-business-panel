/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { ProductRowType, Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
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

const InactiveProducts = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ProductRowType[]>([])
  const [tableData, setTableData] = useState<ProductRowType[]>([])
  const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getBusinessInactiveInventory?businessId=${state.user.businessId}`
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
            state: product.activeState
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
        newState: 1,
        sku,
      }
    )
    if (!response.data.error) {
      toast.success(response.data.msg)
    } else {
      toast.error(response.data.msg)
    }
  }

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
                      setMsg={'Set Active'}
                      icon={'las la-eye align-bottom me-2'}
                      activeText={'text-success'}
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

export default InactiveProducts
