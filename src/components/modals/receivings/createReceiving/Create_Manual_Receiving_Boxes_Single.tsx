/* eslint-disable @next/next/no-img-element */
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { ManualSingleSkuBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'
import { Button } from 'reactstrap'

type Props = {
  singleSkuPackages: ManualSingleSkuBoxes
  addNewSingleSkuBoxConfiguration: (sku: string) => void
  removeSingleSkuBoxConfiguration: (sku: string, index: number) => void
  changeUnitsPerBox: (sku: string, index: number, value: number) => void
  changeQtyOfBoxes: (sku: string, index: number, value: number) => void
}

const Create_Manual_Receiving_Boxes_Single = ({
  singleSkuPackages,
  addNewSingleSkuBoxConfiguration,
  removeSingleSkuBoxConfiguration,
  changeUnitsPerBox,
  changeQtyOfBoxes,
}: Props) => {
  return (
    <div className='overflow-auto'>
      <table className='table table-sm align-middle table-responsive table-striped fs-7'>
        <thead className='table-light'>
          <tr key='manual-receiving-boxes-single-header'>
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
          {Object.entries(singleSkuPackages).map(([sku, item]) => {
            const totalUnitsBoxed = item.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0)

            return (
              <>
                <tr key={`single-sku-perbox-${sku}`} className='bg-light'>
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
                      inputName={`box-${sku}-0-unitsPerBox`}
                      value={item.boxes[0].unitsPerBox}
                      isInvalid={false}
                      placeholder='Units Per Box'
                      handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(sku, 0, Number(e.target.value))}
                      handleBlur={() => {}}
                    />
                  </td>
                  <td className='text-center col-1' style={{ minWidth: '60px' }}>
                    <InputNumberForm
                      inputName={`box-${sku}-0-qtyOfBoxes`}
                      value={item.boxes[0].qtyOfBoxes}
                      isInvalid={false}
                      placeholder='Qty Of Boxes'
                      handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(sku, 0, Number(e.target.value))}
                      handleBlur={() => {}}
                    />
                  </td>
                  <td className='text-center col-1'>
                    <div className='text-center d-flex flex-row justify-content-center align-items-center gap-2'>
                      {item.boxes.length === 1 && (
                        <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(sku)}>
                          <i className='fs-4 text-success las la-plus-circle m-0 p-0 w-auto' />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {item.boxes.map((box, index) => {
                  if (index === 0) return null
                  return (
                    <tr key={`box-${sku}-${index}`}>
                      <td className='text-start'></td>
                      <td className='text-center'></td>
                      <td className='text-center py-3' style={{ minWidth: '60px' }}>
                        <InputNumberForm
                          inputName={`box-${sku}-${index}-unitsPerBox`}
                          value={box.unitsPerBox}
                          isInvalid={false}
                          placeholder='Units Per Box'
                          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(sku, index, Number(e.target.value))}
                          handleBlur={() => {}}
                        />
                      </td>
                      <td className='text-center' style={{ minWidth: '60px' }}>
                        <InputNumberForm
                          inputName={`box-${sku}-${index}-qtyOfBoxes`}
                          value={box.qtyOfBoxes}
                          isInvalid={false}
                          placeholder='Qty Of Boxes'
                          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(sku, index, Number(e.target.value))}
                          handleBlur={() => {}}
                        />
                      </td>
                      <td className='text-center col-1'>
                        <div className='text-center d-flex flex-row justify-content-center align-items-center gap-0'>
                          {index + 1 === item.boxes.length && (
                            <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(sku)}>
                              <i className='fs-4 text-success las la-plus-circle m-0 p-0 w-auto' />
                            </Button>
                          )}

                          <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => removeSingleSkuBoxConfiguration(sku, index)}>
                            <i className='text-danger fs-4 las la-minus-circle m-0 p-0 w-auto' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Create_Manual_Receiving_Boxes_Single
