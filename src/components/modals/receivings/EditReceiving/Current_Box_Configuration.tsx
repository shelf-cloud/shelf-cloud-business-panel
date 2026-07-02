/* eslint-disable @next/next/no-img-element */
import { FinalBoxConfiguration } from '@hooks/receivings/useEditReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  boxes: FinalBoxConfiguration[]
  isReceivingFromPo: boolean
}

const Current_Box_Configuration = ({ boxes, isReceivingFromPo }: Props) => {
  return (
    <div className='overflow-auto'>
      <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] text-[11.2px]'>
        <tbody>
          {boxes.map((box, index) => (
            <>
              <tr key={`box-${index}`}>
                <td colSpan={5} className='text-left ps-4 text-[16.25px] font-semibold bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]'>
                  Box {index + 1}
                </td>
              </tr>
              <tr key={`box-${index}-items`}>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] text-[11.2px]'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr key={`box-${index}-header`}>
                      <th scope='col' className='text-left px-4'>
                        Title / SKU
                      </th>
                      {isReceivingFromPo && (
                        <th scope='col' className='text-left'>
                          PO Numbers
                        </th>
                      )}
                      <th scope='col' className='text-center px-4'>
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.items.map((item, itemIndex) => (
                      <tr key={`box-${index}-item-${itemIndex}`}>
                        <td className='text-left px-4'>
                          <div className='flex flex-row justify-start items-center gap-4'>
                            <div
                              style={{
                                width: '40px',
                                height: '35px',
                                margin: '0px',
                                position: 'relative',
                              }}>
                              <img
                                loading='lazy'
                                src={item.image ? item.image : NoImageAdress}
                                alt='product Image'
                                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              />
                            </div>
                            <div className='text-left'>
                              <p className='text-nowrap m-0 font-semibold'>{item.sku}</p>
                              <p className='text-nowrap m-0'>{item.name}</p>
                            </div>
                          </div>
                        </td>
                        {isReceivingFromPo && <td className='text-left'>{item.poNumber}</td>}
                        <td className='text-center px-4'>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Current_Box_Configuration
