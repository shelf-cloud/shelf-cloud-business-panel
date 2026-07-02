/* eslint-disable @next/next/no-img-element */
import { FinalBoxConfiguration } from '@hooks/receivings/useEditReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  boxes: FinalBoxConfiguration[]
  isReceivingFromPo: boolean
}

const Current_Box_Configuration = ({ boxes, isReceivingFromPo }: Props) => {
  return (
    <div className='tw:overflow-auto'>
      <table className='table table-sm align-middle table-responsive table-striped tw:text-[11.2px]'>
        <tbody>
          {boxes.map((box, index) => (
            <>
              <tr key={`box-${index}`}>
                <td colSpan={5} className='tw:text-left tw:ps-4 tw:text-[16.25px] tw:font-semibold bg-soft-primary'>
                  Box {index + 1}
                </td>
              </tr>
              <tr key={`box-${index}-items`}>
                <table className='table table-sm align-middle table-responsive table-striped tw:text-[11.2px]'>
                  <thead className='table-light'>
                    <tr key={`box-${index}-header`}>
                      <th scope='col' className='tw:text-left tw:px-4'>
                        Title / SKU
                      </th>
                      {isReceivingFromPo && (
                        <th scope='col' className='tw:text-left'>
                          PO Numbers
                        </th>
                      )}
                      <th scope='col' className='tw:text-center tw:px-4'>
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.items.map((item, itemIndex) => (
                      <tr key={`box-${index}-item-${itemIndex}`}>
                        <td className='tw:text-left tw:px-4'>
                          <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
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
                            <div className='tw:text-left'>
                              <p className='tw:text-nowrap tw:m-0 tw:font-semibold'>{item.sku}</p>
                              <p className='tw:text-nowrap tw:m-0'>{item.name}</p>
                            </div>
                          </div>
                        </td>
                        {isReceivingFromPo && <td className='tw:text-left'>{item.poNumber}</td>}
                        <td className='tw:text-center tw:px-4'>{item.quantity}</td>
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
