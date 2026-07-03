import { Children, KitRow } from '@typings'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

type Props = {
  data: KitRow
}

const KitType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 xl:w-full'>
          <Card className='m-0'>
            <CardHeader className='py-2'>
              <h5 className='font-semibold m-0'>Kit Children</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Warehouse Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Kit Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.children.map((product: Children, key) => (
                      <tr key={key} className='border-b border-[color:var(--border)]'>
                        <td className='w-1/2 text-[11.2px] font-semibold'>{product.title || ''}</td>
                        <td className='text-[11.2px] text-muted-foreground'>{product.sku}</td>
                        <td className='text-center'>{product.available}</td>
                        <td className='text-center'>{product.qty}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td className='text-right text-[13px] font-bold text-nowrap'>Total</td>
                      <td className='text-center text-[16.25px] text-primary'>{data.children.reduce((total, product: Children) => total + Number(product.qty), 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default KitType
