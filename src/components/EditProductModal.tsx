/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useState, useEffect, useContext } from 'react'
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

type Props = {}

function EditProductModal({}: Props) {
  const { mutate } = useSWRConfig()
  const { state, setShowEditProductModal }: any = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      inventoryId: '',
      businessId: '',
      title: '',
      sku: '',
      image: '',
      asin: '',
      fnsku: '',
      barcode: '',
      // weight: '',
      // width: '',
      // length: '',
      // height: '',
      // boxweight: '',
      // boxwidth: '',
      // boxlength: '',
      // boxheight: '',
      // boxqty: '',
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
      barcode: Yup.string().max(50, 'barcode is to Long'),
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
    onSubmit: async (values) => {
      const response = await axios.post(
        `api/updateProductDetails?businessId=${state.user.businessId}`,
        {
          productInfo: values,
        }
      )
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getBusinessInventory?businessId=${state.user.businessId}`)
        setShowEditProductModal(false)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  useEffect(() => {
    const bringProductBins = async () => {
      const response = await axios(
        `/api/getProductDetails?inventoryId=${state.modalProductDetails.inventoryId}&businessId=${state.modalProductDetails.businessId}`
      )
      validation.setValues(response.data)
      setLoading(false)
    }
    bringProductBins()
    return () => {
      setLoading(true)
    }
  }, [
    state.modalProductDetails.businessId,
    state.modalProductDetails.inventoryId,
  ])

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      size="xl"
      id="myModal"
      isOpen={state.showEditProductModal}
      toggle={() => {
        setShowEditProductModal(!state.showEditProductModal)
      }}
    >
      <ModalHeader
        toggle={() => {
          setShowEditProductModal(!state.showEditProductModal)
        }}
      >
        <h3 className="modal-title" id="myModalLabel">
          Edit Product
        </h3>
        {loading && <Spinner />}
      </ModalHeader>
      <ModalBody>
        {!loading && (
          <Form onSubmit={HandleAddProduct}>
            <Row>
              <h5 className="fs-5 m-3 fw-bolder">Product Details</h5>
              <Col md={6} className="d-none">
                <FormGroup className="mb-3">
                  <Label htmlFor="firstNameinput" className="form-label">
                    *InventoryId
                  </Label>
                  <Input
                    disabled
                    type="number"
                    className="form-control"
                    id="inventoryId"
                    name="inventoryId"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.inventoryId || ''}
                    invalid={
                      validation.touched.inventoryId &&
                      validation.errors.inventoryId
                        ? true
                        : false
                    }
                  />
                  {validation.touched.inventoryId &&
                  validation.errors.inventoryId ? (
                    <FormFeedback type="invalid">
                      {validation.errors.inventoryId}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
              <Col md={6} className="d-none">
                <FormGroup className="mb-3">
                  <Label htmlFor="firstNameinput" className="form-label">
                    *BusinessId
                  </Label>
                  <Input
                    disabled
                    type="number"
                    className="form-control"
                    id="businessId"
                    name="businessId"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.businessId || ''}
                    invalid={
                      validation.touched.businessId &&
                      validation.errors.businessId
                        ? true
                        : false
                    }
                  />
                  {validation.touched.businessId &&
                  validation.errors.businessId ? (
                    <FormFeedback type="invalid">
                      {validation.errors.businessId}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
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
                    disabled={true}
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
                    Barcode
                  </Label>
                  <Input
                    disabled={true}
                    type="text"
                    className="form-control"
                    placeholder="Barcode..."
                    id="barcode"
                    name="barcode"
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.barcode || ''}
                    invalid={
                      validation.touched.barcode && validation.errors.barcode
                        ? true
                        : false
                    }
                  />
                  {validation.touched.barcode && validation.errors.barcode ? (
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
              {/* <div className="border mt-3 border-dashed"></div>
              <h5 className="fs-5 m-3 fw-bolder">Unit Dimensions</h5>
              <Col md={3}>
                <FormGroup className="mb-3">
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                      validation.touched.weight && validation.errors.weight
                        ? true
                        : false
                    }
                  />
                  {validation.touched.weight && validation.errors.weight ? (
                    <FormFeedback type="invalid">
                      {validation.errors.weight}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className="mb-3">
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                      validation.touched.length && validation.errors.length
                        ? true
                        : false
                    }
                  />
                  {validation.touched.length && validation.errors.length ? (
                    <FormFeedback type="invalid">
                      {validation.errors.length}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className="mb-3">
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                      validation.touched.height && validation.errors.height
                        ? true
                        : false
                    }
                  />
                  {validation.touched.height && validation.errors.height ? (
                    <FormFeedback type="invalid">
                      {validation.errors.height}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col> */}
              {/* <div className="border mt-3 border-dashed"></div>
              <h5 className="fs-5 m-3 fw-bolder">Box Dimensions</h5>
              <Col md={3}>
                <FormGroup className="mb-3">
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                      validation.touched.boxwidth && validation.errors.boxwidth
                        ? true
                        : false
                    }
                  />
                  {validation.touched.boxwidth && validation.errors.boxwidth ? (
                    <FormFeedback type="invalid">
                      {validation.errors.boxwidth}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className="mb-3">
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                  <Label htmlFor="compnayNameinput" className="form-label">
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
                      validation.touched.boxqty && validation.errors.boxqty
                        ? true
                        : false
                    }
                  />
                  {validation.touched.boxqty && validation.errors.boxqty ? (
                    <FormFeedback type="invalid">
                      {validation.errors.boxqty}
                    </FormFeedback>
                  ) : null}
                </FormGroup>
              </Col> */}
              <h5 className="fs-14 mb-3 text-muted">
                *You must complete all required fields or you will not be able
                to create your product.
              </h5>
              <Col md={12}>
                <div className="text-end">
                  <Button type="submit" color="primary" className="btn">
                    Save Changes
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </ModalBody>
    </Modal>
  )
}

export default EditProductModal
