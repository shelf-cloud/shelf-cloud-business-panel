import { Children, KitRow } from '@typings'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

type Props = {
  data: KitRow
}

const KitType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={12}>
          <Card className='tw:m-0'>
            <CardHeader className='tw:py-2'>
              <h5 className='tw:font-semibold tw:m-0'>Kit Children</h5>
            </CardHeader>
            <CardBody>
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='tw:text-center' scope='col'>
                        Warehouse Qty
                      </th>
                      <th className='tw:text-center' scope='col'>
                        Kit Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.children.map((product: Children, key) => (
                      <tr key={key} className='tw:border-b tw:border-[color:var(--border)]'>
                        <td className='tw:w-1/2 tw:text-[11.2px] tw:font-semibold'>{product.title || ''}</td>
                        <td className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='tw:text-center'>{product.available}</td>
                        <td className='tw:text-center'>{product.qty}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[13px] tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:text-center tw:text-[16.25px] tw:text-primary'>{data.children.reduce((total, product: Children) => total + Number(product.qty), 0)}</td>
                    </tr>
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

export default KitType
