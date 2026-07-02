import { ChildrenPage } from '@typings'

type Props = {
  kitChildren: ChildrenPage[]
}

const Children_Kit_Details = ({ kitChildren }: Props) => {
  return (
    <div className='tw:py-1 tw:w-full'>
      <div>
        <table className='tw:w-full tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead>
            <tr>
              <th className='tw:text-center'>Child SKU</th>
              <th className='tw:text-left'>Title</th>
              <th className='tw:text-center'>Kit Qty</th>
              <th className='tw:text-center'>ShelfCloud Qty</th>
            </tr>
          </thead>
          <tbody>
            {kitChildren.map((child) => (
              <tr key={child.sku}>
                <td className='tw:text-center'>{child.sku}</td>
                <td className='tw:text-left'>{child.title}</td>
                <td className='tw:text-center'>{child.qty}</td>
                <td className='tw:text-center'>{child.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Children_Kit_Details
