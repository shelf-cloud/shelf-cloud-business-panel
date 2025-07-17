/* eslint-disable @next/next/no-img-element */
import { FinalBoxConfiguration } from '@hooks/receivings/useEditReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  boxes: FinalBoxConfiguration[]
}

const Current_Box_Configuration = ({ boxes }: Props) => {
  return (
    <div className='overflow-auto'>
      <table className='table table-sm align-middle table-responsive table-striped fs-7'>
        <tbody>
          {boxes.map((box, index) => (
            <>
              <tr key={`box-${index}`}>
                <td colSpan={5} className='text-start ps-3 fs-5 fw-semibold bg-soft-primary'>
                  Box {index + 1}
                </td>
              </tr>
              <tr>
                <table className='table table-sm align-middle table-responsive table-striped fs-7'>
                  <thead className='table-light'>
                    <tr key={`box-${index}-header`}>
                      <th scope='col' className='text-start px-3'>
                        Title / SKU
                      </th>
                      <th scope='col' className='text-start'>
                        PO Numbers
                      </th>
                      <th scope='col' className='text-center px-3'>
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.items.map((item, itemIndex) => (
                      <tr key={`box-${index}-item-${itemIndex}`}>
                        <td className='text-start px-3'>
                          <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
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
                            <div className='text-start'>
                              <p className='text-nowrap m-0 fw-semibold'>{item.sku}</p>
                              <p className='text-nowrap m-0'>{item.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className='text-start'>{item.poNumber}</td>
                        <td className='text-center px-3'>{item.quantity}</td>
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
