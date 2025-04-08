/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { WholesaleProduct, wholesaleProductRow } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Button, Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import InventoryBinsModal from '@components/InventoryBinsModal'
import ReceivingOrderTable from '@components/ReceivingOrderTable'
import ReceivingOrderModal from '@components/modals/receivings/ReceivingOrderModal'
import { toast } from 'react-toastify'
import { DebounceInput } from 'react-debounce-input'
import ReceivingOrderModalUploading from '@components/modals/receivings/ReceivingOrderModalUploading'

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
      businessName: string
      businessOrderStart: string
    }
  }
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const CreateWholeSaleOrder = ({ session }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const title = `Create Receiving Order | ${session?.user?.businessName}`
  const orderNumberStart = `${session?.user?.businessOrderStart.substring(0, 3).toUpperCase()}-`
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<wholesaleProductRow[]>([])
  const [searchValue, setSearchValue] = useState<string>('')

  const [receivingUploadingModal, setreceivingUploadingModal] = useState({
    show: false,
  })

  const { data } = useSWR(state.user.businessId ? `/api/getReceivingInventory?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const filteredItems = useMemo(() => {
    return allData.filter(
      (item: wholesaleProductRow) =>
        item?.title?.toLowerCase().includes(searchValue.toLowerCase()) || searchValue.split(' ').every((word) => item?.title?.toLowerCase().includes(word.toLowerCase())) || item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [allData, searchValue])

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      const list: wholesaleProductRow[] = []
      data.forEach((product: WholesaleProduct) => {
        const row = {
          image: product.image,
          title: product.title,
          sku: product.sku,
          quantity: {
            quantity: product.quantity,
            inventoryId: product.inventoryId,
            businessId: product.businessId,
            sku: product.sku,
          },
          orderQty: '',
        }
        list.push(row)
      })
      setAllData(list)
      setPending(false)
    }
  }, [data])

  const orderProducts = useMemo(() => {
    return allData.filter((item: wholesaleProductRow) => Number(item?.orderQty) > 0)
  }, [allData])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Create Receiving Order' pageTitle='Inbound' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='d-flex justify-content-between align-items-start'>
                      <div>
                        <h3 className='fs-5 fw-semibold text-primary'>Total SKUs in Order: {orderProducts.length}</h3>
                        <h5 className='fs-6 fw-normal text-primary'>Total Qty to Receive in Order: {orderProducts.reduce((total: number, item: wholesaleProductRow) => total + Number(item.orderQty), 0)}</h5>
                      </div>
                      <div className='d-flex justify-content-end align-items-start gap-2'>
                        <Button className='fs-7 btn' color='info' onClick={() => setreceivingUploadingModal({ show: true })}>
                          Create Uploading File
                        </Button>
                        <Button className='fs-7 btn' color='primary' onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                    <div className='w-100 d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-end align-items-lg-center px-0'>
                      <div className='app-search p-0 col-sm-12 col-lg-4'>
                        <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                          <DebounceInput
                            type='text'
                            minLength={1}
                            debounceTimeout={500}
                            className='form-control fs-6'
                            placeholder='Search...'
                            id='search-options'
                            value={searchValue}
                            onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          <span className='mdi mdi-magnify search-widget-icon fs-5'></span>
                          <span
                            className='d-flex align-items-center justify-content-center bg-light'
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => setSearchValue('')}>
                            <i className='mdi mdi-window-close fs-5 m-0 px-2 py-0 text-muted' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <ReceivingOrderTable allData={allData} filteredItems={filteredItems} setAllData={setAllData} pending={pending} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {state.showWholeSaleOrderModal && <ReceivingOrderModal orderNumberStart={orderNumberStart} orderProducts={orderProducts} />}
      {receivingUploadingModal.show && <ReceivingOrderModalUploading orderNumberStart={orderNumberStart} skuList={allData} receivingUploadingModal={receivingUploadingModal} setreceivingUploadingModal={setreceivingUploadingModal} />}
    </div>
  )
}

export default CreateWholeSaleOrder
