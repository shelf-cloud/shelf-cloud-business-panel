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
    <Row className='tw:mb-2 tw:gap-y-2'>
      <Col xs={12} md={3}>
        <Card className='card-animate tw:mb-0'>
          <CardBody className='tw:py-2 tw:flex tw:items-center tw:justify-between tw:gap-4'>
            <div className='tw:flex tw:items-center tw:justify-between tw:mb-1'>
              <p className='tw:capitalize tw:font-normal tw:mb-0 tw:text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='tw:text-primary tw:font-bold'>PO</span> Balance
              </p>
              <div className='tw:shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:md:flex-col tw:md:items-start tw:lg:flex-row tw:lg:items-center'>
              <h4 className='tw:text-[16.25px] tw:font-semibold tw:mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} prefix={'$'} separator={','} end={data?.balance ?? 0} decimals={2} duration={1} />
                </span>
              </h4>
              <Button color='primary' size='sm' className='tw:m-0' onClick={() => setpoBalanceListModal({ show: true })}>
                <i className='ri-list-check tw:text-[16.25px] tw:align-middle' />
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
