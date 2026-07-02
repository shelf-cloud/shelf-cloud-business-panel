/* eslint-disable @next/next/no-img-element */
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { ManualSingleSkuBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'
import { Button } from '@/components/migration-ui'

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
    <div className='tw:overflow-auto'>
      <table className='table table-sm align-middle table-responsive table-striped tw:text-[11.2px]'>
        <thead className='table-light'>
          <tr key='manual-receiving-boxes-single-header'>
            <th scope='col'>Title / SKU</th>
            <th scope='col' className='tw:text-left'>
              Quantity
            </th>
            <th scope='col' className='tw:text-center'>
              Units Per Box
            </th>
            <th scope='col' className='tw:text-center'>
              Qty Of Boxes
            </th>
            <th scope='col' className='tw:text-center'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(singleSkuPackages).map(([sku, item]) => {
            const totalUnitsBoxed = item.boxes.reduce((acc, box) => acc + box.qtyOfBoxes * box.unitsPerBox, 0)

            return (
              <>
                <tr key={`single-sku-perbox-${sku}`} className='tw:bg-light'>
                  <td className='tw:text-left'>
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
                        <p className='tw:text-nowrap tw:m-0 tw:font-semibold'>{sku}</p>
                        <p className='tw:text-nowrap tw:m-0'>{item.name}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                      {item.receiving}
                      <span className={'tw:font-semibold ' + (totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? 'tw:text-danger' : 'tw:text-success')}>
                        {totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? totalUnitsBoxed : ''}
                        {totalUnitsBoxed > item.receiving ? '↑' : totalUnitsBoxed < item.receiving ? '↓' : ''}
                      </span>
                    </div>
                  </td>
                  <td className='tw:text-center' style={{ minWidth: '60px' }}>
                    <InputNumberForm
                      inputName={`box-${sku}-0-unitsPerBox`}
                      value={item.boxes[0].unitsPerBox}
                      isInvalid={false}
                      placeholder='Units Per Box'
                      handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(sku, 0, Number(e.target.value))}
                      handleBlur={() => {}}
                    />
                  </td>
                  <td className='tw:text-center' style={{ minWidth: '60px' }}>
                    <InputNumberForm
                      inputName={`box-${sku}-0-qtyOfBoxes`}
                      value={item.boxes[0].qtyOfBoxes}
                      isInvalid={false}
                      placeholder='Qty Of Boxes'
                      handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(sku, 0, Number(e.target.value))}
                      handleBlur={() => {}}
                    />
                  </td>
                  <td className='tw:text-center'>
                    <div className='tw:text-center tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-2'>
                      {item.boxes.length === 1 && (
                        <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(sku)}>
                          <i className='tw:text-[19.5px] tw:text-success las la-plus-circle tw:m-0 tw:p-0 tw:w-auto' />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                {item.boxes.map((box, index) => {
                  if (index === 0) return null
                  return (
                    <tr key={`box-${sku}-${index}`}>
                      <td className='tw:text-left'></td>
                      <td className='tw:text-center'></td>
                      <td className='tw:text-center tw:py-4' style={{ minWidth: '60px' }}>
                        <InputNumberForm
                          inputName={`box-${sku}-${index}-unitsPerBox`}
                          value={box.unitsPerBox}
                          isInvalid={false}
                          placeholder='Units Per Box'
                          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(sku, index, Number(e.target.value))}
                          handleBlur={() => {}}
                        />
                      </td>
                      <td className='tw:text-center' style={{ minWidth: '60px' }}>
                        <InputNumberForm
                          inputName={`box-${sku}-${index}-qtyOfBoxes`}
                          value={box.qtyOfBoxes}
                          isInvalid={false}
                          placeholder='Qty Of Boxes'
                          handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(sku, index, Number(e.target.value))}
                          handleBlur={() => {}}
                        />
                      </td>
                      <td className='tw:text-center'>
                        <div className='tw:text-center tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-0'>
                          {index + 1 === item.boxes.length && (
                            <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(sku)}>
                              <i className='tw:text-[19.5px] tw:text-success las la-plus-circle tw:m-0 tw:p-0 tw:w-auto' />
                            </Button>
                          )}

                          <Button type='button' size='sm' color='ghost' className='btn-icon' onClick={() => removeSingleSkuBoxConfiguration(sku, index)}>
                            <i className='tw:text-danger tw:text-[19.5px] las la-minus-circle tw:m-0 tw:p-0 tw:w-auto' />
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
