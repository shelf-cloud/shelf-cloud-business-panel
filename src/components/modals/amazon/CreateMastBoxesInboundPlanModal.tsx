/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import router from 'next/router'
import { AmazonFulfillmentSku, AmazonMarketplace } from '@typesTs/amazon/fulfillments'
import useSWR from 'swr'
import { FormatIntNumber } from '@lib/FormatNumbers'
import moment from 'moment'
import { notSupportedMarketplacesForFBA } from '@lib/AmzConstants'

type Props = {
  orderProducts: AmazonFulfillmentSku[]
  showCreateInboundPlanModal: boolean
  setShowCreateInboundPlanModal: (showCreateInboundPlanModal: boolean) => void
}

const CreateMastBoxesInboundPlanModal = ({ orderProducts, showCreateInboundPlanModal, setShowCreateInboundPlanModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)

  const TotalMasterBoxes = orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.orderQty), 0)
  const totalQuantityToShip = orderProducts.reduce((total: number, item: AmazonFulfillmentSku) => total + Number(item.totalSendToAmazon), 0)

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data: amazonMarketplaces }: { data?: AmazonMarketplace[] } = useSWR(
    state.user.businessId ? `/api/amazon/fullfilments/getAmzMarketplaces?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const generateTabDelimitedFile = async (orderProducts: AmazonFulfillmentSku[], inboundPlanName: string) => {
    const prepOwner = 'Seller'
    const labelOwner = 'Seller'

    let fileContent = `Please review the Example tab before you complete this sheet\n\nDefault prep owner\t${prepOwner}\nDefault labeling owner\t${labelOwner}\n\n\t\tOptional\t\tOptional: Use only for case-packed SKUs\nMerchant SKU\tQuantity\tPrep owner\tLabeling owner\tUnits per box\tNumber of boxes\tBox length (in)\tBox width (in)\tBox height (in)\tBox weight (lb)\n`

    for await (const product of orderProducts) {
      const sortedDimensions = [product.boxLength, product.boxWidth, product.boxHeight].sort((a, b) => b - a)
      fileContent += `${product.msku}\t${product.totalSendToAmazon}\t\t\t${product.boxQty}\t${product.orderQty}\t${sortedDimensions[0]}\t${sortedDimensions[1]}\t${sortedDimensions[2]}\t${product.boxWeight}\n`
    }

    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = inboundPlanName
    a.click()
  }

  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      inboundPlanName: `${state?.user?.name.substring(0, 3).toUpperCase()}-FBA-${moment().format('MM_DD_YYYY-hh_mma')}`,
      marketplace: '',
      shipFrom: '',
      hasProducts: orderProducts.length,
    },
    validationSchema: Yup.object({
      inboundPlanName: Yup.string()
        .matches(/^[a-zA-Z0-9-._\\s]+$/, `Valid special characters: - . _ NO spaces`)
        .max(150, 'Title is to Long')
        .required('Please enter Inbound Plan Name'),
      marketplace: Yup.string().required('Select a Marketplace where your inventory will be shipped.'),
      shipFrom: Yup.string().required('Select from where your inventory will be shipped'),
      hasProducts: Yup.number().min(1, 'To create an order, you must add at least one product'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)

      let skus_details = {} as { [msku: string]: any }
      for await (const product of orderProducts) {
        skus_details[product.msku] = {
          title: product.product_name,
          asin: product.asin,
          upc: product.barcode,
          shelfcloud_sku: product.shelfcloud_sku,
          shelfcloud_id: product.shelfcloud_sku_id,
          image: product.image,
          isKit: product.isKit,
          inventoryId: product.inventoryId,
          weight: product.weight,
          length: product.length,
          width: product.width,
          height: product.height,
          boxQty: product.boxQty,
          boxWeight: product.boxWeight,
          boxLength: product.boxLength,
          boxWidth: product.boxWidth,
          boxHeight: product.boxHeight,
          amzDimensions: product.amzDimensions,
          boxes: parseInt(product.orderQty),
          children: product.children ?? [],
        }
      }

      const response = await axios.post(`/api/amazon/fullfilments/masterBoxes/createInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        fulfillmentType: 'Master Boxes',
        inboundPlan: {
          contactInformation: {
            email: 'info@shelf-cloud.com',
            name: 'Jose Sanchez',
            phoneNumber: '7542432244',
          },
          destinationMarketplaces: [values.marketplace],
          items: orderProducts.map((product) => {
            return {
              labelOwner: 'SELLER',
              msku: product.msku,
              prepOwner: 'NONE',
              quantity: product.totalSendToAmazon,
            }
          }),
          name: values.inboundPlanName,
          sourceAddress: {
            addressLine1: '9631 Premier Parkway',
            addressLine2: '',
            city: 'Miramar',
            companyName: `${state.user.name} / Onix Venture Group`,
            countryCode: 'US',
            email: 'info@shelf-cloud.com',
            name: 'Jose Sanchez',
            phoneNumber: '7542432244',
            postalCode: '33025',
            stateOrProvinceCode: 'FL',
          },
        },
        skus_details,
        steps: {
          1: {
            step: 'Inventory to Send',
            complete: false,
          },
          2: {
            step: 'Packing Info',
            complete: false,
          },
          3: {
            step: 'Shipping',
            complete: false,
          },
          4: {
            step: 'Box Labels',
            complete: false,
          },
          5: {
            step: 'Carrier and Pallet Info',
            complete: false,
          },
          6: {
            step: 'Tracking Details',
            complete: false,
          },
        },
      })

      if (!response.data.error) {
        generateTabDelimitedFile(orderProducts, values.inboundPlanName)
        setShowCreateInboundPlanModal(false)
        toast.success(response.data.message)
        resetForm()
        router.push(`/amazon-sellers/fulfillments`)
      } else {
        toast.error(response.data.message)
      }
      setloading(false)
    },
  })

  const handleCreateInboundPlan = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='xl'
      id='createInboundPlanModal'
      isOpen={showCreateInboundPlanModal}
      toggle={() => {
        setShowCreateInboundPlanModal(false)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreateInboundPlanModal(false)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create Fulfillment - Send To Amazon
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleCreateInboundPlan}>
          <Row>
            <h5 className='fs-5 fw-bolder text-primary'>Fulfillment Details</h5>
            <Row xs={12} className='my-0'>
              <Col md={6}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='orderNumber' className='form-label'>
                    *Fulfillment Name
                  </Label>
                  <div className='input-group'>
                    <Input
                      type='text'
                      className='form-control'
                      bsSize='sm'
                      id='orderNumber'
                      name='inboundPlanName'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.inboundPlanName || ''}
                      invalid={validation.touched.inboundPlanName && validation.errors.inboundPlanName ? true : false}
                    />
                    {validation.touched.inboundPlanName && validation.errors.inboundPlanName ? (
                      <FormFeedback type='invalid'>{validation.errors.inboundPlanName}</FormFeedback>
                    ) : null}
                  </div>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='marketplace' className='form-label'>
                    *Marketplace destination
                  </Label>
                  <Input
                    type='select'
                    className='form-control'
                    bsSize='sm'
                    id='marketplace'
                    name='marketplace'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.marketplace && validation.errors.marketplace ? true : false}>
                    <option value=''>Choose Marketplace..</option>
                    {amazonMarketplaces?.map(
                      (marketplace) =>
                        !notSupportedMarketplacesForFBA.includes(marketplace.marketplaceId) && (
                          <option key={marketplace.marketplaceId} value={marketplace.marketplaceId}>
                            {marketplace.marketplaceName}
                          </option>
                        )
                    )}
                  </Input>
                  {validation.touched.marketplace && validation.errors.marketplace ? <FormFeedback type='invalid'>{validation.errors.marketplace}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Row xs={12} className='my-0'>
              <Col md={6}>
                <FormGroup className='mb-3'>
                  <Label htmlFor='shipFrom' className='form-label'>
                    *Ship From
                  </Label>
                  <Input
                    type='select'
                    className='form-control'
                    bsSize='sm'
                    id='shipFrom'
                    name='shipFrom'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    invalid={validation.touched.shipFrom && validation.errors.shipFrom ? true : false}>
                    <option value=''>Ship From...</option>
                    <option value='shelfcloud'>Shelf Cloud Warehouse</option>
                  </Input>
                  {validation.touched.shipFrom && validation.errors.shipFrom ? <FormFeedback type='invalid'>{validation.errors.shipFrom}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Col md={12}>
              <p className='fs-5 mb-0 p-0'>SKUs ready to send: {validation.values.hasProducts}</p>
              {validation.touched.hasProducts && validation.errors.hasProducts ? <p className='text-danger'>{validation.errors.hasProducts}</p> : null}
              <table className='table align-middle table-sm table-responsive table-nowrap table-striped-columns'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Type</th>
                    <th className='text-center'>Master Boxes</th>
                    <th className='text-center'>Quantity To Send</th>
                  </tr>
                </thead>
                <tbody>
                  {orderProducts?.map((product, index: number) => (
                    <tr key={index}>
                      <td>
                        <span className='fs-6 m-0 p-0'>{product.sku}</span>
                        <br />
                        <span className='text-primary fs-7 m-0 p-0'>{product.asin}</span>
                      </td>
                      <td className='text-center'>{product.isKit ? 'Kit' : 'Product'}</td>
                      <td className='text-center'>{FormatIntNumber(state.currentRegion, parseInt(product.orderQty))}</td>
                      <td className='text-center'>{FormatIntNumber(state.currentRegion, product.totalSendToAmazon)}</td>
                    </tr>
                  ))}
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td className='fw-bold text-end'></td>
                    <td className='fw-bold text-end'>TOTAL</td>
                    <td className='fw-bold text-center'>{FormatIntNumber(state.currentRegion, TotalMasterBoxes)}</td>
                    <td className='fw-bold text-center'>{FormatIntNumber(state.currentRegion, totalQuantityToShip)}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn'>
                  {loading ? <Spinner color='light' /> : 'Confirm Plan'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default CreateMastBoxesInboundPlanModal
