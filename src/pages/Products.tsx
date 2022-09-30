/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { RowType, Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
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
import BasicTable from '@components/ProductsTable'
import InventoryBinsModal from '@components/InventoryBinsModal'

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

const DataTables = ({ session }: Props) => {
  const { state, setProducts }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [tableData, setTableData] = useState<RowType[]>(state.products)
  const [serachValue, setSerachValue] = useState('')

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable = tableData.filter(
        (item) =>
          item.Title.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item.SKU.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item.ASIN.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item.FNSKU.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item.Barcode.toLowerCase().includes(e.target.value.toLowerCase())
      )
      setTableData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setTableData(state.products)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setTableData(state.products)
  }

  useEffect(() => {
    const bringProducts = async () => {
      const response = await axios('/api/getBusinessInventory')
      const list: RowType[] = []

      response.data.forEach((product: Product) => {
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
            sku: product.sku
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
        }
        list.push(row)
      })
      setTableData(list)
      setProducts(list)
      setPending(false)
    }
    bringProducts()
  }, [])

  const title = `Products | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Products" pageTitle="Warehouse" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    {/* <h5 className="card-title mb-0">Basic Datatables</h5> */}
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
                    <BasicTable tableData={tableData} pending={pending} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      <InventoryBinsModal />
    </div>
  )
}

export default DataTables
