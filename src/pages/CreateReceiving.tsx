/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { WholesaleProduct, wholesaleProductRow } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import InventoryBinsModal from '@components/InventoryBinsModal'
import ReceivingOrderTable from '@components/ReceivingOrderTable'
import ReceivingOrderModal from '@components/ReceivingOrderModal'
import { toast } from 'react-toastify'

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

const CreateWholeSaleOrder = ({ session }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const title = `Create Receiving Order | ${session?.user?.businessName}`
  const orderNumberStart = `${session?.user?.businessOrderStart.substring(0, 3).toUpperCase()}-`
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<wholesaleProductRow[]>([])
  const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getReceivingInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  const filteredItems = useMemo(() => {
    return allData.filter(
      (item: wholesaleProductRow) =>
        item?.title?.toLowerCase().includes(serachValue.toLowerCase()) ||
        item?.sku?.toLowerCase().includes(serachValue.toLowerCase())
    )
  }, [allData, serachValue])

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
          <Container fluid>
            <BreadCrumb title='Create Receiving Order' pageTitle='Inbound' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='d-flex justify-content-between align-center mt-3 mb-3'>
                      <div>
                        <h3 className='fs-3 fw-semibold text-primary'>Total SKUs in Order: {orderProducts.length}</h3>
                        <h5 className='fs-5 fw-normal text-primary'>
                          Total Qty to Receive in Order:{' '}
                          {orderProducts.reduce(
                            (total: number, item: wholesaleProductRow) => total + Number(item.orderQty),
                            0
                          )}
                        </h5>
                      </div>
                      <div>
                        <Button
                          className='fs-6 btn'
                          color='primary'
                          onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                    <form className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative'>
                        <Input
                          type='text'
                          className='form-control'
                          placeholder='Search...'
                          id='search-options'
                          value={serachValue}
                          onChange={(e) => setSerachValue(e.target.value)}
                        />
                        <span className='mdi mdi-magnify search-widget-icon'></span>
                        <span
                          className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none'
                          id='search-close-options'></span>
                      </div>
                      <Button className='btn-soft-dark' onClick={() => setSerachValue('')}>
                        Clear
                      </Button>
                    </form>
                  </CardHeader>
                  <CardBody>
                    <ReceivingOrderTable
                      allData={allData}
                      filteredItems={filteredItems}
                      setAllData={setAllData}
                      pending={pending}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {state.showWholeSaleOrderModal && (
        <ReceivingOrderModal orderNumberStart={orderNumberStart} orderProducts={orderProducts} />
      )}
    </div>
  )
}

export default CreateWholeSaleOrder
