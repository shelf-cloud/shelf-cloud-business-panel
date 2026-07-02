import { useContext, useState } from 'react'

import PoBalanceListModal from '@components/modals/purchaseOrders/PoBalanceListModal'
import AppContext from '@context/AppContext'
import { POBalanceResponse } from '@typesTs/purchaseOrders'
import axios from 'axios'
import CountUp from 'react-countup'
import { Button, Card, CardBody, Col, Row } from '@/components/migration-ui'
import useSWR from 'swr'

type Props = {}

const fetcher = (endPoint: string) => axios.get<POBalanceResponse>(endPoint).then((res) => res.data)

const PurchaseOrdersWidgets = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const [poBalanceListModal, setpoBalanceListModal] = useState({
    show: false,
  })

  const { data } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getpurchaseOrdersBalance?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return (
    <Row className='mb-2 gap-y-2'>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2 flex items-center justify-between gap-4'>
            <div className='flex items-center justify-between mb-1'>
              <p className='capitalize font-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary font-bold'>PO</span> Balance
              </p>
              <div className='shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='flex flex-row items-center justify-between gap-2 md:flex-col md:items-start lg:flex-row lg:items-center'>
              <h4 className='text-[16.25px] font-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} prefix={'$'} separator={','} end={data?.balance ?? 0} decimals={2} duration={1} />
                </span>
              </h4>
              <Button color='primary' size='sm' className='m-0' onClick={() => setpoBalanceListModal({ show: true })}>
                <i className='ri-list-check text-[16.25px] align-middle' />
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      {poBalanceListModal.show && <PoBalanceListModal poBalanceListModal={poBalanceListModal} poBalanceList={data?.po ?? []} setpoBalanceListModal={setpoBalanceListModal} />}
    </Row>
  )
}

export default PurchaseOrdersWidgets
