/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import Head from 'next/head'
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import AppContext from '@context/AppContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

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

const AddProducts = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Add Product | ${session?.user?.name}`
  const [useSameUnitDimensions, setUseSameUnitDimensions] = useState(false)
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      title: '',
      sku: '',
      image: '',
      asin: '',
      fnsku: '',
      barcode: '',
      weight: '',
      width: '',
      length: '',
      height: '',
      boxweight: '',
      boxwidth: '',
      boxlength: '',
      boxheight: '',
      boxqty: '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .max(100, 'Title is to Long')
        .required('Please Enter Your Title'),
      sku: Yup.string()
        .max(50, 'SKU is to Long')
        .required('Please Enter Your Sku'),
      image: Yup.string().url(),
      asin: Yup.string().max(50, 'Asin is to Long'),
      fnsku: Yup.string().max(50, 'Fnsku is to Long'),
      barcode: Yup.string()
        .max(50, 'barcode is to Long')
        .required('Please Enter Your Barcode'),
      weight: Yup.number()
        .required('Please Enter Your Weight')
        .positive('Value must be grater than 0'),
      width: Yup.number()
        .required('Please Enter Your Width')
        .positive('Value must be grater than 0'),
      length: Yup.number()
        .required('Please Enter Your Length')
        .positive('Value must be grater than 0'),
      height: Yup.number()
        .required('Please Enter Your Height')
        .positive('Value must be grater than 0'),
      boxweight: Yup.number()
        .required('Please Enter Your Box Eeight')
        .positive('Value must be grater than 0'),
      boxwidth: Yup.number()
        .required('Please Enter Your Box Width')
        .positive('Value must be grater than 0'),
      boxlength: Yup.number()
        .required('Please Enter Your Box Length')
        .positive('Value must be grater than 0'),
      boxheight: Yup.number()
        .required('Please Enter Your Box Height')
        .positive('Value must be grater than 0'),
      boxqty: Yup.number()
        .required('Please Enter Your Box Qty')
        .positive('Value must be grater than 0')
        .integer('Only integers'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(
        `api/createNewProduct?businessId=${state.user.businessId}`,
        {
          productInfo: values,
        }
      )
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleBoxDimensionsCheckbox = () => {
    validation.setFieldValue('boxweight', validation.values.weight)

    if (!useSameUnitDimensions) {
      setUseSameUnitDimensions(true)
      validation.setFieldValue('boxweight', validation.values.weight)
      validation.setFieldValue('boxwidth', validation.values.width)
      validation.setFieldValue('boxlength', validation.values.length)
      validation.setFieldValue('boxheight', validation.values.height)
      validation.setFieldValue('boxqty', 1)
      validation.validateForm()
    } else {
      setUseSameUnitDimensions(false)
      validation.setFieldValue('boxweight', '')
      validation.setFieldValue('boxwidth', '')
      validation.setFieldValue('boxlength', '')
      validation.setFieldValue('boxheight', '')
      validation.setFieldValue('boxqty', '')
      validation.validateForm()
    }
  }
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Add Products" pageTitle="Warehouse" />
            <Card>
              <CardBody>
                <Form onSubmit={HandleAddProduct}>
                  <Row>
                    <h5 className="fs-5 m-3 fw-bolder">Product Details</h5>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="firstNameinput" className="form-label">
                          *Title
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Title..."
                          id="title"
                          name="title"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.title || ''}
                          invalid={
                            validation.touched.title && validation.errors.title
                              ? true
                              : false
                          }
                        />
                        {validation.touched.title && validation.errors.title ? (
                          <FormFeedback type="invalid">
                            {validation.errors.title}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          *SKU
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Sku..."
                          id="sku"
                          name="sku"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.sku || ''}
                          invalid={
                            validation.touched.sku && validation.errors.sku
                              ? true
                              : false
                          }
                        />
                        {validation.touched.sku && validation.errors.sku ? (
                          <FormFeedback type="invalid">
                            {validation.errors.sku}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-3">
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
                          name="asin"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.asin || ''}
                          invalid={
                            validation.touched.asin && validation.errors.asin
                              ? true
                              : false
                          }
                        />
                        {validation.touched.asin && validation.errors.asin ? (
                          <FormFeedback type="invalid">
                            {validation.errors.asin}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-3">
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
                          name="fnsku"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.fnsku || ''}
                          invalid={
                            validation.touched.fnsku && validation.errors.fnsku
                              ? true
                              : false
                          }
                        />
                        {validation.touched.fnsku && validation.errors.fnsku ? (
                          <FormFeedback type="invalid">
                            {validation.errors.fnsku}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-3">
                        <Label
                          htmlFor="compnayNameinput"
                          className="form-label"
                        >
                          UPC / Barcode
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Barcode..."
                          id="barcode"
                          name="barcode"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.barcode || ''}
                          invalid={
                            validation.touched.barcode &&
                            validation.errors.barcode
                              ? true
                              : false
                          }
                        />
                        {validation.touched.barcode &&
                        validation.errors.barcode ? (
                          <FormFeedback type="invalid">
                            {validation.errors.barcode}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Product Image
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Image URL..."
                          id="image"
                          name="image"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.image || ''}
                          invalid={
                            validation.touched.image && validation.errors.image
                              ? true
                              : false
                          }
                        />
                        {validation.touched.image && validation.errors.image ? (
                          <FormFeedback type="invalid">
                            {validation.errors.image}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <div className="border mt-3 border-dashed"></div>
                    <h5 className="fs-5 m-3 fw-bolder">Unit Dimensions</h5>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="weight"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.weight || ''}
                          invalid={
                            validation.touched.weight &&
                            validation.errors.weight
                              ? true
                              : false
                          }
                        />
                        {validation.touched.weight &&
                        validation.errors.weight ? (
                          <FormFeedback type="invalid">
                            {validation.errors.weight}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="width"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.width || ''}
                          invalid={
                            validation.touched.width && validation.errors.width
                              ? true
                              : false
                          }
                        />
                        {validation.touched.width && validation.errors.width ? (
                          <FormFeedback type="invalid">
                            {validation.errors.width}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="length"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.length || ''}
                          invalid={
                            validation.touched.length &&
                            validation.errors.length
                              ? true
                              : false
                          }
                        />
                        {validation.touched.length &&
                        validation.errors.length ? (
                          <FormFeedback type="invalid">
                            {validation.errors.length}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="height"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.height || ''}
                          invalid={
                            validation.touched.height &&
                            validation.errors.height
                              ? true
                              : false
                          }
                        />
                        {validation.touched.height &&
                        validation.errors.height ? (
                          <FormFeedback type="invalid">
                            {validation.errors.height}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <div className="border mt-3 border-dashed"></div>
                    <div className="align-items-center d-flex">
                      <h5 className="fs-5 m-3 fw-bolder">Box Dimensions</h5>
                      <div className="flex-shrink-0">
                        <div className="form-check form-switch form-switch-right form-switch-md">
                          <Label className="form-label text-muted">
                            Same as unit dimensions
                          </Label>
                          <Input
                            className="form-check-input code-switcher"
                            type="checkbox"
                            checked={useSameUnitDimensions}
                            onChange={handleBoxDimensionsCheckbox}
                          />
                        </div>
                      </div>
                    </div>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="boxweight"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxweight || ''}
                          invalid={
                            validation.touched.boxweight &&
                            validation.errors.boxweight
                              ? true
                              : false
                          }
                        />
                        {validation.touched.boxweight &&
                        validation.errors.boxweight ? (
                          <FormFeedback type="invalid">
                            {validation.errors.boxweight}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="boxwidth"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxwidth || ''}
                          invalid={
                            validation.touched.boxwidth &&
                            validation.errors.boxwidth
                              ? true
                              : false
                          }
                        />
                        {validation.touched.boxwidth &&
                        validation.errors.boxwidth ? (
                          <FormFeedback type="invalid">
                            {validation.errors.boxwidth}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="boxlength"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxlength || ''}
                          invalid={
                            validation.touched.boxlength &&
                            validation.errors.boxlength
                              ? true
                              : false
                          }
                        />
                        {validation.touched.boxlength &&
                        validation.errors.boxlength ? (
                          <FormFeedback type="invalid">
                            {validation.errors.boxlength}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="boxheight"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxheight || ''}
                          invalid={
                            validation.touched.boxheight &&
                            validation.errors.boxheight
                              ? true
                              : false
                          }
                        />
                        {validation.touched.boxheight &&
                        validation.errors.boxheight ? (
                          <FormFeedback type="invalid">
                            {validation.errors.boxheight}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-3">
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
                          name="boxqty"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.boxqty || ''}
                          invalid={
                            validation.touched.boxqty &&
                            validation.errors.boxqty
                              ? true
                              : false
                          }
                        />
                        {validation.touched.boxqty &&
                        validation.errors.boxqty ? (
                          <FormFeedback type="invalid">
                            {validation.errors.boxqty}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <h5 className="fs-14 mb-3 text-muted">
                      *You must complete all required fields or you will not be
                      able to create your product.
                    </h5>
                    <Col md={12}>
                      <div className="text-end">
                        <Button type="submit" className="btn btn-primary">
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

export default AddProducts
