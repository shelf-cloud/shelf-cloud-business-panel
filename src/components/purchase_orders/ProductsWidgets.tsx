import { useContext, useState } from 'react'

import PoBalanceListModal from '@components/modals/purchaseOrders/PoBalanceListModal'
import AppContext from '@context/AppContext'
import { POBalanceResponse } from '@typesTs/purchaseOrders'
import axios from 'axios'
import CountUp from 'react-countup'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
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
    <div className='flex flex-wrap -mx-3 mb-2 gap-y-2'>
      <div className='px-3 w-full md:w-3/12'>
        <Card className='card-animate mb-0'>
          <CardContent className='py-2 flex items-center justify-between gap-4'>
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
              <Button size='sm' className='m-0' onClick={() => setpoBalanceListModal({ show: true })}>
                <i className='ri-list-check text-[16.25px] align-middle' />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {poBalanceListModal.show && <PoBalanceListModal poBalanceListModal={poBalanceListModal} poBalanceList={data?.po ?? []} setpoBalanceListModal={setpoBalanceListModal} />}
    </div>
  )
}

export default PurchaseOrdersWidgets
