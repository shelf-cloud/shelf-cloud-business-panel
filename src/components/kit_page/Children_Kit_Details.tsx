import { ChildrenPage } from '@typings'

type Props = {
  kitChildren: ChildrenPage[]
}

const Children_Kit_Details = ({ kitChildren }: Props) => {
  return (
    <div className='py-1 w-full'>
      <div>
        <table className='w-full text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead>
            <tr>
              <th className='text-center'>Child SKU</th>
              <th className='text-left'>Title</th>
              <th className='text-center'>Kit Qty</th>
              <th className='text-center'>ShelfCloud Qty</th>
            </tr>
          </thead>
          <tbody>
            {kitChildren.map((child) => (
              <tr key={child.sku}>
                <td className='text-center'>{child.sku}</td>
                <td className='text-left'>{child.title}</td>
                <td className='text-center'>{child.qty}</td>
                <td className='text-center'>{child.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Children_Kit_Details
