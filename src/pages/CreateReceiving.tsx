 
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
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

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
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 lg:w-full'>
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='text-[16.25px] font-semibold text-primary'>Total SKUs in Order: {receivingProducts.length}</h3>
                        <h5 className='text-[13px] font-normal text-primary'>
                          Total Qty to Receive in Order: {receivingProducts.reduce((total: number, item) => total + item.quantity, 0)}
                        </h5>
                      </div>
                      <div className='flex justify-end items-start gap-2'>
                        <Button variant='info' onClick={() => setreceivingUploadingModal({ show: true })}>
                          Create Uploading File
                        </Button>
                        <Button onClick={() => setWholeSaleOrderModal(!state.showWholeSaleOrderModal)}>
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                    <div className='w-full flex flex-col-reverse justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-end lg:items-center px-0'>
                      <div className='p-0 w-full lg:w-1/3'>
                        <div className='relative flex rounded-md w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                          <DebounceInput
                            type='text'
                            minLength={1}
                            debounceTimeout={500}
                            className='h-9 w-full border-0 bg-white px-3 text-sm outline-none'
                            placeholder='Search...'
                            id='search-options'
                            value={searchValue}
                            onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                          <span
                            className='flex items-center justify-center bg-[color:var(--vz-light)]'
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => setSearchValue('')}>
                            <i className='mdi mdi-window-close text-[16.25px] m-0 px-2 py-0 text-muted-foreground' />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ReceivingOrderTable data={filterReceivingInventory} pending={isLoading} handleOrderQty={handleOrderQty} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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
