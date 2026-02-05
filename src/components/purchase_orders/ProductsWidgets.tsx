import React, { useContext, useState } from 'react'

import PoBalanceListModal from '@components/modals/purchaseOrders/PoBalanceListModal'
import AppContext from '@context/AppContext'
import { POBalanceResponse } from '@typesTs/purchaseOrders'
import axios from 'axios'
import CountUp from 'react-countup'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
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
    <Row className='mb-2 gy-2 gx-1'>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2 d-flex align-items-center justify-content-between gap-4'>
            <div className='d-flex align-items-center justify-content-between mb-1'>
              <p className='text-capitalize fw-normal mb-0  text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary fw-bold'>PO</span> Balance
              </p>
              <div className='flex-shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between gap-2 flex-md-column align-items-md-start flex-lg-row align-items-lg-center'>
              <h4 className='fs-5 fw-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} prefix={'$'} separator={','} end={data?.balance ?? 0} decimals={2} duration={1} />
                </span>
              </h4>
              <Button className='btn-icon btn-primary btn-sm m-0' onClick={() => setpoBalanceListModal({ show: true })}>
                <i className='ri-list-check fs-5 align-middle' />
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
