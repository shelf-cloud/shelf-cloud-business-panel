import React, { useContext, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row, Spinner } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { useSWRConfig } from 'swr'
import { FormatCurrency } from '@lib/FormatNumbers'
import { ExpanderComponentProps } from 'react-data-table-component'
import { OrderItem, ReturnOrder } from '@typesTs/returns/returns'
import TooltipComponent from '@components/constants/Tooltip'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { useFormik } from 'formik'

type Props = {
  data: ReturnOrder
  apiMutateLink?: string
}

const ReturnExpandedType: React.FC<ExpanderComponentProps<ReturnOrder>> = ({ data, apiMutateLink }: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showEditNote, setShowEditNote] = useState(false)
  const OrderId = data.orderId?.replace(/[\-\,\(\)\/\s\.\:\;]/g, '')
  const [loadingLabel, setLoadingLabel] = useState(false)
  const handlePrintingLabel = async () => {
    setLoadingLabel(true)
    const response: any = await axios(`/api/createLabelForOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${data.id}`)

    const linkSource = `data:application/pdf;base64,${response.data}`
    const downloadLink = document.createElement('a')
    const fileName = data.orderNumber + '-shipLabel.pdf'

    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
    mutate(apiMutateLink)
    setLoadingLabel(false)
  }

  const validationNote = useFormik({
    enableReinitialize: true,
    initialValues: {
      comment: data.extraComment || '',
    },
    validationSchema: Yup.object({
      comment: Yup.string().max(300, 'Title is to Long'),
    }),
    onSubmit: async (values) => {
      setLoading(true)

      const response = await axios.post(`/api/returns/editReturnComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        returnId: data.id,
        comment: values.comment,
      })

      if (!response.data.error) {
        toast.success(response.data.msg)

        mutate(apiMutateLink)
        setShowEditNote(false)
      } else {
        toast.error(response.data.msg)
      }
      setLoading(false)
    },
  })

  const HandleAddComment = (event: any) => {
    event.preventDefault()
    validationNote.handleSubmit()
  }

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Requested:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Used:</td>
                      <td className='fw-semibold w-100'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Customer Name:</td>
                      <td className='fw-semibold w-100'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Address:</td>
                      <td className='fw-semibold w-100'>
                        {data.shipStreet !== '' && data.shipCity !== '' && `${data.shipStreet}, ${data.shipCity}, ${data.shipState}, ${data.shipZipcode}, ${data.shipCountry}`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltip${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
                                state.currentRegion,
                                data.chargesFees.extraItemOrderCost!
                              )} addt'l.`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3 d-flex justify-content-between align-items-center'>
                <h5 className='fw-semibold m-0'>Order Comment</h5>
                <i className={'las la-edit fs-3 text-primary m-0 p-0 ' + (showEditNote && 'd-none')} style={{ cursor: 'pointer' }} onClick={() => setShowEditNote(true)}></i>
              </CardHeader>
              <CardBody>
                {showEditNote ? (
                  <Form onSubmit={HandleAddComment}>
                    <Col md={12}>
                      <FormGroup className='m-0'>
                        <Label htmlFor='comment' className='form-label'>
                          Edit Comment
                        </Label>
                        <Input
                          type='textarea'
                          className='form-control fs-6'
                          placeholder=''
                          id='comment'
                          name='comment'
                          bsSize='sm'
                          onChange={validationNote.handleChange}
                          onBlur={validationNote.handleBlur}
                          value={validationNote.values.comment || ''}
                          invalid={validationNote.touched.comment && validationNote.errors.comment ? true : false}
                        />
                        {validationNote.touched.comment && validationNote.errors.comment ? <FormFeedback type='invalid'>{validationNote.errors.comment}</FormFeedback> : null}
                      </FormGroup>
                      <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                        <Button type='button' disabled={loading} color='light' className='btn btn-sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} color='primary' className='btn btn-sm'>
                          {loading ? <Spinner size={'sm'} color='light'/> : 'Save Changes'}
                        </Button>
                      </div>
                    </Col>
                  </Form>
                ) : (
                  <p>{data.extraComment}</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xl={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th scope='col'>Condition</th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: OrderItem, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-50 fs-6 fw-semibold'>{product.title ? product.title : product.name}</td>
                        <td className='fs-6 text-muted'>{product.sku}</td>
                        <td className='fs-6 text-muted text-capitalize'>{product.state}</td>
                        <td className='text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                      <td></td>
                      <td></td>
                      <td className='text-center fs-5 text-primary'>{data.orderItems.reduce((total, item: OrderItem) => total + item.qtyReceived, 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className='d-flex justify-content-end align-items-end'>
          {data.returnOrigin === 'shipment' && (
            <Card className='m-0'>
              {loadingLabel ? (
                <Button color='secondary' className='btn-label'>
                  <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                  <Spinner color='light' />
                </Button>
              ) : (
                <Button color='secondary' className='btn-label' onClick={() => handlePrintingLabel()}>
                  <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                  Print Label
                </Button>
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReturnExpandedType
