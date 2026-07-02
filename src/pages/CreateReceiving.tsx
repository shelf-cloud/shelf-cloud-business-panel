 
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import InventoryBinsModal from '@components/InventoryBinsModal'
import ReceivingOrderTable from '@components/ReceivingOrderTable'
import ReceivingOrderModal from '@components/modals/receivings/ReceivingOrderModal'
import ReceivingOrderModalUploading from '@components/modals/receivings/ReceivingOrderModalUploading'
import AppContext from '@context/AppContext'
import { useReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { DebounceInput } from 'react-debounce-input'
import { Button, Card, CardBody, CardHeader, Col, Container, Row } from '@/components/migration-ui'

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
  const { state, setWholeSaleOrderModal } = useContext(AppContext)
  const title = `Create Receiving Order | ${session?.user?.businessName}`
  const orderNumberStart = `${session?.user?.businessOrderStart.substring(0, 3).toUpperCase()}-`
  useWarehouses()

  const [searchValue, setSearchValue] = useState<string>('')
  const [receivingUploadingModal, setreceivingUploadingModal] = useState({
    show: false,
  })

  const { filterReceivingInventory, receivingInventory, isLoading, handleOrderQty } = useReceivingInventory({ searchValue })

  const receivingProducts = useMemo(() => {
    return receivingInventory.filter((item) => Number(item?.quantity) > 0)
  }, [receivingInventory])

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
                    <div className='tw:flex tw:justify-between tw:items-start'>
                      <div>
                        <h3 className='tw:text-[16.25px] tw:font-semibold tw:text-primary'>Total SKUs in Order: {receivingProducts.length}</h3>
                        <h5 className='tw:text-[13px] tw:font-normal tw:text-primary'>
                          Total Qty to Receive in Order: {receivingProducts.reduce((total: number, item) => total + item.quantity, 0)}
                        </h5>
                      </div>
                      <div className='tw:flex tw:justify-end tw:items-start tw:gap-2'>
                        <Button color='info' onClick={() => setreceivingUploadingModal({ show: true })}>
                          Create Uploading File
                        </Button>
                        <Button color='primary' onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                    <div className='tw:w-full tw:flex tw:flex-col-reverse tw:justify-center tw:items-start tw:gap-2 tw:mb-0 tw:lg:flex-row tw:lg:justify-end tw:lg:items-center tw:px-0'>
                      <div className='tw:p-0 tw:w-full tw:lg:w-1/3'>
                        <div className='tw:relative tw:flex tw:rounded-md tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                          <DebounceInput
                            type='text'
                            minLength={1}
                            debounceTimeout={500}
                            className='tw:h-9 tw:w-full tw:border-0 tw:bg-white tw:px-3 tw:text-sm tw:outline-none'
                            placeholder='Search...'
                            id='search-options'
                            value={searchValue}
                            onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          <span
                            className='tw:flex tw:items-center tw:justify-center tw:bg-[color:var(--vz-light)]'
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => setSearchValue('')}>
                            <i className='mdi mdi-window-close tw:text-[16.25px] tw:m-0 tw:px-2 tw:py-0 tw:text-[color:var(--bs-secondary-color)]' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <ReceivingOrderTable data={filterReceivingInventory} pending={isLoading} handleOrderQty={handleOrderQty} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      {state.showWholeSaleOrderModal && <ReceivingOrderModal orderNumberStart={orderNumberStart} receivingProducts={receivingProducts} />}
      {receivingUploadingModal.show && (
        <ReceivingOrderModalUploading
          orderNumberStart={orderNumberStart}
          receivingInventory={receivingInventory}
          receivingUploadingModal={receivingUploadingModal}
          setreceivingUploadingModal={setreceivingUploadingModal}
        />
      )}
    </div>
  )
}

export default CreateWholeSaleOrder
