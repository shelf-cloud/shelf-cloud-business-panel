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
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:text-center tw:mb-0 tw:border tw:border-[color:var(--border)] tw:[&_td]:border-t tw:[&_td]:border-[color:var(--border)] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)] tw:text-[var(--bs-secondary-color)]'>
                    <tr className='tw:text-[16.25px] tw:font-bold'>
                      <th scope='col'>Bin Name</th>
                      <th scope='col'>Bin Quantity</th>
                      <th scope='col'>Bin Est. Monthly Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bins.map((bin: StorageBin, key) => (
                      <tr key={key}>
                        <td className='tw:text-[16px] tw:font-semibold tw:text-primary'>{bin.binName || ''}</td>
                        <td className='tw:text-[15px]'>{bin.quantity}</td>
                        <td className='tw:text-center'>
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
