import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { StorageBin, StorageRowProduct } from '@typings'
import { Card, CardBody, Col, Row } from '@/components/migration-ui'

type Props = {
  data: StorageRowProduct
}

const StorageTable = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div style={{ backgroundColor: '#f3f3f9', padding: '10px' }}>
      <Row>
        <Col xl={12}>
          <Card>
            <CardBody>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle text-center mb-0 border border-[color:var(--border)] [&_td]:border-t [&_td]:border-[color:var(--border)] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)] text-[var(--bs-secondary-color)]'>
                    <tr className='text-[16.25px] font-bold'>
                      <th scope='col'>Bin Name</th>
                      <th scope='col'>Bin Quantity</th>
                      <th scope='col'>Bin Est. Monthly Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bins.map((bin: StorageBin, key) => (
                      <tr key={key}>
                        <td className='text-[16px] font-semibold text-primary'>{bin.binName || ''}</td>
                        <td className='text-[15px]'>{bin.quantity}</td>
                        <td className='text-center'>
                          {bin.idBin != 156 ? FormatCurrency(state.currentRegion, bin.binBalance!) : bin.countEntry ? FormatCurrency(state.currentRegion, bin.binBalance!) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StorageTable
