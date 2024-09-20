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
import { Label_Prep_Owner_Options, notSupportedMarketplacesForFBA } from '@lib/AmzConstants'
import SimpleSelect from '@components/Common/SimpleSelect'
import ShippingSelectDate from '@components/amazon/fulfillment/fulfillment_page/ShippingSelectDate'

type Props = {
  orderProducts: AmazonFulfillmentSku[]
  showCreateInboundPlanModal: boolean
  setShowCreateInboundPlanModal: (showCreateInboundPlanModal: boolean) => void
  setAllData: (cb: (prev: AmazonFulfillmentSku[]) => AmazonFulfillmentSku[]) => void
}

type CreatingErros = {
  code: string
  message: string
  details: string
}

const CreateIndvUnitsInboundPlanModal = ({ orderProducts, showCreateInboundPlanModal, setShowCreateInboundPlanModal, setAllData }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const [creatingErros, setcreatingErros] = useState<CreatingErros[]>([])
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

  const validation = useFormik({
    // enableReinitialize: true,

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
      setcreatingErros([])
      setloading(true)
      const creatingIndvUnitsPlan = toast.loading('Generating New Inbound Plan...')

      let skus_details = {} as { [msku: string]: any }
      for await (const product of orderProducts) {
        skus_details[product.msku] = {
          title: product.product_name,
          asin: product.asin,
          upc: product.barcode,
          expiration: product.expiration && product.expiration !== '' ? moment(product.expiration, 'MM/DD/YYYY').format('YYYY-MM-DD') : '',
          labelOwner: product.labelOwner,
          prepOwner: product.prepOwner,
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

      const response = await axios.post(`/api/amazon/fullfilments/individualUnits/createIndUnitsInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        fulfillmentType: 'Individual Units',
        inboundPlan: {
          contactInformation: {
            email: 'info@shelf-cloud.com',
            name: 'Jose Sanchez',
            phoneNumber: '7542432244',
          },
          destinationMarketplaces: [values.marketplace],
          items: orderProducts.map((product) => {
            if (product.expiration === '' || product.expiration === undefined) {
              return {
                labelOwner: product.labelOwner,
                msku: product.msku,
                prepOwner: product.prepOwner,
                quantity: product.totalSendToAmazon,
              }
            } else {
              return {
                expiration: moment(product.expiration, 'MM/DD/YYYY').format('YYYY-MM-DD'),
                labelOwner: product.labelOwner,
                msku: product.msku,
                prepOwner: product.prepOwner,
                quantity: product.totalSendToAmazon,
              }
            }
          }),
          name: values.inboundPlanName,
          sourceAddress: {
            addressLine1: '9631 Premier Parkway',
            addressLine2: '',
            city: 'Miramar',
            companyName: `Shelf-Cloud / ${state.user.name}`,
            countryCode: 'US',
            email: 'info@shelf-cloud.com',
            name: `Shelf-Cloud / ${state.user.name}`,
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
        setShowCreateInboundPlanModal(false)
        toast.update(creatingIndvUnitsPlan, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        resetForm()
        router.push(`/amazon-sellers/fulfillments`)
      } else {
        toast.update(creatingIndvUnitsPlan, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        setcreatingErros(response.data.apiMessage.errors)
      }
      setloading(false)
    },
  })

  const handleCreateInboundPlan = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleSelectLabelOwner = async (selected: any, typeOwner: string, id: number) => {
    setloading(true)

    if (typeOwner === 'expiration') {
      setAllData((prev) => {
        return prev.map((product) => {
          if (product.id === id) {
            return { ...product, expiration: selected }
          }
          return product
        })
      })
      toast.success('Expiration Date changed', {
        autoClose: 1000,
      })
      setloading(false)
      return
    }

    const changeLabelPrepOwner = toast.loading(`Saving ${typeOwner}...`)

    switch (typeOwner) {
      case 'labelOwner':
        setAllData((prev) => {
          return prev.map((product) => {
            if (product.id === id) {
              return { ...product, labelOwner: selected.value }
            }
            return product
          })
        })
        break
      case 'prepOwner':
        setAllData((prev) => {
          return prev.map((product) => {
            if (product.id === id) {
              return { ...product, prepOwner: selected.value }
            }
            return product
          })
        })
        break
      default:
        break
    }

    const response = await axios
      .post(`/api/amazon/fullfilments/changeLabelPrepOwner?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        typeOwner,
        selected: selected.value,
        productId: id,
      })
      .then(({ data }) => data)
      .catch(() => {
        toast.update(changeLabelPrepOwner, {
          render: 'Error saving Owner',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      })

    if (!response.error) {
      toast.update(changeLabelPrepOwner, {
        render: response.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
    } else {
      toast.update(changeLabelPrepOwner, {
        render: response.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setloading(false)
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
        <p className='fs-4 m-0'>Create Individual Units Fulfillment - Send To Amazon</p>
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
            <Col md={12} style={{ overflowX: 'auto', overflowY: 'hidden', position: 'relative' }}>
              <p className='fw-semibold mb-0'>SKUs ready to send: {validation.values.hasProducts}</p>
              {validation.touched.hasProducts && validation.errors.hasProducts ? <p className='text-danger'>{validation.errors.hasProducts}</p> : null}
              <table className='table align-middle table-sm table-responsive table-nowrap table-striped-columns'>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th className='text-center'>Expiration Date</th>
                    <th className='text-center'>Label Owner</th>
                    <th className='text-center'>Prep Owner</th>
                    <th className='text-center'>Type</th>
                    <th className='text-center'>Individual Units</th>
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
                      <td className='w-fit px-0 d-flex flex-row justify-content-center align-items-center'>
                        <ShippingSelectDate
                          id={product.msku}
                          selectedDate={product.expiration}
                          minDate={moment().format('MM/DD/YYYY')}
                          setnewDate={(selected) => {
                            handleSelectLabelOwner(selected, 'expiration', product.id)
                          }}
                          clearDate={true}
                        />
                      </td>
                      <td className='px-3' style={{ minWidth: '150px', position: 'relative' }}>
                        <SimpleSelect
                          selected={{ value: product.labelOwner, label: product.labelOwner }}
                          handleSelect={(selected) => {
                            handleSelectLabelOwner(selected, 'labelOwner', product.id)
                          }}
                          options={Label_Prep_Owner_Options}
                        />
                      </td>
                      <td className='px-3' style={{ minWidth: '150px', position: 'relative' }}>
                        <SimpleSelect
                          selected={{ value: product.prepOwner, label: product.prepOwner }}
                          handleSelect={(selected) => {
                            handleSelectLabelOwner(selected, 'prepOwner', product.id)
                          }}
                          options={Label_Prep_Owner_Options}
                        />
                      </td>
                      <td className='text-center'>{product.isKit ? 'Kit' : 'Product'}</td>
                      <td className='text-center'>{FormatIntNumber(state.currentRegion, parseInt(product.orderQty))}</td>
                      <td className='text-center'>{FormatIntNumber(state.currentRegion, product.totalSendToAmazon)}</td>
                    </tr>
                  ))}
                  <tr key={'totalMasterBoxes'} style={{ backgroundColor: '#e5e5e5' }}>
                    <td className='fw-bold text-end'></td>
                    <td className='fw-bold text-end'></td>
                    <td className='fw-bold text-end'></td>
                    <td className='fw-bold text-end'></td>
                    <td className='fw-bold text-end'>TOTAL</td>
                    <td className='fw-bold text-center'>{FormatIntNumber(state.currentRegion, TotalMasterBoxes)}</td>
                    <td className='fw-bold text-center'>{FormatIntNumber(state.currentRegion, totalQuantityToShip)}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Row xs={12}>
              <Col>
                <ul>
                  {creatingErros.map((error, index: number) => (
                    <li key={index} className='text-danger'>
                      {`${error.message} -//- ${error.details}`}
                    </li>
                  ))}
                </ul>
              </Col>
            </Row>
            <Col md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn'>
                  {loading ? (
                    <span>
                      <Spinner color='light' size={'sm'} /> Loading...
                    </span>
                  ) : (
                    'Confirm Plan'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default CreateIndvUnitsInboundPlanModal
