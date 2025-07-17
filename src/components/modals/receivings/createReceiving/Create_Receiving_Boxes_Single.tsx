/* eslint-disable @next/next/no-img-element */
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { SingleSkuBoxes } from '@hooks/receivings/useReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'
import { Button } from 'reactstrap'

type Props = {
  singleSkuPackages: SingleSkuBoxes
  addNewSingleSkuBoxConfiguration: (poId: string, sku: string) => void
  removeSingleSkuBoxConfiguration: (poId: string, sku: string, index: number) => void
  changeUnitsPerBox: (poId: string, sku: string, index: number, value: number) => void
  changeQtyOfBoxes: (poId: string, sku: string, index: number, value: number) => void
}

const Create_Receiving_Boxes_Single = ({ singleSkuPackages, addNewSingleSkuBoxConfiguration, removeSingleSkuBoxConfiguration, changeUnitsPerBox, changeQtyOfBoxes }: Props) => {
  return (
    <div className='overflow-auto'>
      <table className='table table-sm align-middle table-responsive table-striped fs-7'>
        <thead className='table-light'>
          <tr>
            <th scope='col'>Title / SKU</th>
            <th scope='col' className='text-start'>
              Quantity
            </th>
            <th scope='col' className='text-center'>
              Units Per Box
            </th>
            <th scope='col' className='text-center'>
              Qty Of Boxes
            </th>
            <th scope='col' className='text-center'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(singleSkuPackages).map(([poId, skus]) =>
            Object.entries(skus).map(([sku, item]) => {
              const totalUnitsBoxed = item.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0)

              return (
                <>
                  <tr key={`sku-${poId}-${sku}`} className='bg-light'>
                    <td className='text-start'>
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
                          <p className='text-nowrap m-0 fw-semibold'>{sku}</p>
                          <p className='text-nowrap m-0'>{item.name}</p>
                          <p className='text-nowrap m-0 text-muted'>PO: {item.poNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                        {item.receiving}
                        <span className={'fw-semibold ' + (totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? 'text-danger' : 'text-success')}>
                          {totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? totalUnitsBoxed : ''}
                          {totalUnitsBoxed > item.receiving ? '↑' : totalUnitsBoxed < item.receiving ? '↓' : ''}
                        </span>
                      </div>
                    </td>
                    <td className='text-center col-1' style={{ minWidth: '60px' }}>
                      <InputNumberForm
                        inputName={`box-${poId}-${sku}-0-unitsPerBox`}
                        value={item.boxes[0].unitsPerBox}
                        isInvalid={false}
                        placeholder='Units Per Box'
                        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(poId, sku, 0, Number(e.target.value))}
                        handleBlur={() => {}}
                      />
                    </td>
                    <td className='text-center col-1' style={{ minWidth: '60px' }}>
                      <InputNumberForm
                        inputName={`box-${poId}-${sku}-0-qtyOfBoxes`}
                        value={item.boxes[0].qtyOfBoxes}
                        isInvalid={false}
                        placeholder='Qty Of Boxes'
                        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(poId, sku, 0, Number(e.target.value))}
                        handleBlur={() => {}}
                      />
                    </td>
                    <td className='text-center col-1'>
                      <div className='text-center d-flex flex-row justify-content-center align-items-center gap-2'>
                        {item.boxes.length === 1 && (
                          <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(poId, sku)}>
                            <i className='fs-4 text-success las la-plus-circle m-0 p-0 w-auto' />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {item.boxes.map((box, index) => {
                    if (index === 0) return null
                    return (
                      <tr key={`box-${poId}-${sku}-${index}`}>
                        <td className='text-start'></td>
                        <td className='text-center'></td>
                        <td className='text-center py-3' style={{ minWidth: '60px' }}>
                          <InputNumberForm
                            inputName={`box-${poId}-${sku}-${index}-unitsPerBox`}
                            value={box.unitsPerBox}
                            isInvalid={false}
                            placeholder='Units Per Box'
                            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(poId, sku, index, Number(e.target.value))}
                            handleBlur={() => {}}
                          />
                        </td>
                        <td className='text-center' style={{ minWidth: '60px' }}>
                          <InputNumberForm
                            inputName={`box-${poId}-${sku}-${index}-qtyOfBoxes`}
                            value={box.qtyOfBoxes}
                            isInvalid={false}
                            placeholder='Qty Of Boxes'
                            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(poId, sku, index, Number(e.target.value))}
                            handleBlur={() => {}}
                          />
                        </td>
                        <td className='text-center col-1'>
                          <div className='text-center d-flex flex-row justify-content-center align-items-center gap-0'>
                            {index + 1 === item.boxes.length && (
                              <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(poId, sku)}>
                                <i className='fs-4 text-success las la-plus-circle m-0 p-0 w-auto' />
                              </Button>
                            )}

                            <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => removeSingleSkuBoxConfiguration(poId, sku, index)}>
                              <i className='text-danger fs-4 las la-minus-circle m-0 p-0 w-auto' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Create_Receiving_Boxes_Single
