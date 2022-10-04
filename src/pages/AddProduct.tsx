/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { ProductRowType, Product } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Row,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'

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
  const title = `Add Product | ${session?.user?.name}`
  const productTitle = useRef()
  const [productDetails, setProductDetails] = useState({
    title: '',
    sku: '',
    fnsku: '',
    barcode: '',
    weight: 0,
    width: 0,
    length: 0,
    height: 0,
    boxwidth: 0,
    boxlength: 0,
    boxheight: 0,
    boxqty: 0,
  })

  const HandleAddProduct = (event:any) => {
    event.preventDefault()
    console.log(event);
  }
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Add Products" pageTitle="Warehouse" />
            <Card>
              <CardBody>
                <Form>
                  <Row>
                    <h5 className="fs-5 m-3 fw-bolder">Product Details</h5>
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="firstNameinput" className="form-label">
                          *Title
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Title..."
                          id="title"
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          *SKU
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Sku..."
                          id="sku"
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          ASIN
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Asin..."
                          id="asin"
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          FNSKU
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Fnsku..."
                          id="fnsku"
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          Barcode
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Barcode..."
                          id="barcode"
                        />
                      </div>
                    </Col>
                    <div className="border mt-3 border-dashed"></div>
                    <h5 className="fs-5 m-3 fw-bolder">Unit Dimensions</h5>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Weight (lbs)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Weight..."
                          id="weight"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Width (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Width..."
                          id="width"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Length (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Length..."
                          id="length"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Height (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Height..."
                          id="height"
                        />
                      </div>
                    </Col>
                    <div className="border mt-3 border-dashed"></div>
                    <h5 className="fs-5 m-3 fw-bolder">Box Dimensions</h5>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Box Weight (lbs)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Box Weight..."
                          id="boxweight"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Box Width (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Box Width..."
                          id="boxwidth"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Box Length (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Box Length..."
                          id="boxlength"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Box Height (in)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Box Height..."
                          id="boxheight"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          *Box Quantity
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          placeholder="Box Qty..."
                          id="boxqty"
                        />
                      </div>
                    </Col>
                    <h5 className="fs-14 mb-3 text-muted">
                      *You must complete all required fields or you will not be
                      able to create your product.
                    </h5>
                    <Col md={12}>
                      <div className="text-end">
                        <Button
                          type="submit"
                          className="btn btn-primary"
                          onClick={HandleAddProduct}
                        >
                          Add
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Products
