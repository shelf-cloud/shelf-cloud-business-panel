/* eslint-disable @next/next/no-img-element */
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { SingleSkuBoxes } from '@hooks/receivings/useReceivingsBoxes'
import { NoImageAdress } from '@lib/assetsConstants'
import { Button } from '@shadcn/ui/button'

type Props = {
  singleSkuPackages: SingleSkuBoxes
  addNewSingleSkuBoxConfiguration: (poId: string, sku: string) => void
  removeSingleSkuBoxConfiguration: (poId: string, sku: string, index: number) => void
  changeUnitsPerBox: (poId: string, sku: string, index: number, value: number) => void
  changeQtyOfBoxes: (poId: string, sku: string, index: number, value: number) => void
  isReceivingFromPo: boolean
}

const Edit_Receiving_Boxes_Single = ({
  singleSkuPackages,
  addNewSingleSkuBoxConfiguration,
  removeSingleSkuBoxConfiguration,
  changeUnitsPerBox,
  changeQtyOfBoxes,
  isReceivingFromPo,
}: Props) => {
  return (
    <div className='overflow-auto'>
      <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] text-[11.2px]'>
        <thead className='bg-[color:var(--vz-light)]'>
          <tr key='edit-receiving-boxes-single-header'>
            <th scope='col'>Title / SKU</th>
            <th scope='col' className='text-left'>
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
                    <td className='text-left'>
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
                          <p className='text-nowrap m-0 font-semibold'>{sku}</p>
                          <p className='text-nowrap m-0'>{item.name}</p>
                          {isReceivingFromPo && <p className='text-nowrap m-0 text-[var(--bs-secondary-color)]'>PO: {item.poNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='flex flex-row justify-start items-center gap-2'>
                        {item.receiving}
                        <span className={'font-semibold ' + (totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? 'text-danger' : 'text-success')}>
                          {totalUnitsBoxed > item.receiving || totalUnitsBoxed < item.receiving ? totalUnitsBoxed : ''}
                          {totalUnitsBoxed > item.receiving ? '↑' : totalUnitsBoxed < item.receiving ? '↓' : ''}
                        </span>
                      </div>
                    </td>
                    <td className='text-center' style={{ minWidth: '60px' }}>
                      <InputNumberForm
                        inputName={`box-${poId}-${sku}-0-unitsPerBox`}
                        value={item.boxes[0].unitsPerBox}
                        isInvalid={false}
                        placeholder='Units Per Box'
                        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeUnitsPerBox(poId, sku, 0, Number(e.target.value))}
                        handleBlur={() => {}}
                      />
                    </td>
                    <td className='text-center' style={{ minWidth: '60px' }}>
                      <InputNumberForm
                        inputName={`box-${poId}-${sku}-0-qtyOfBoxes`}
                        value={item.boxes[0].qtyOfBoxes}
                        isInvalid={false}
                        placeholder='Qty Of Boxes'
                        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => changeQtyOfBoxes(poId, sku, 0, Number(e.target.value))}
                        handleBlur={() => {}}
                      />
                    </td>
                    <td className='text-center'>
                      <div className='text-center flex flex-row justify-center items-center gap-2'>
                        {item.boxes.length === 1 && (
                          <Button type='button' size='sm' variant='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(poId, sku)}>
                            <i className='text-[19.5px] text-success las la-plus-circle m-0 p-0 w-auto' />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {item.boxes.map((box, index) => {
                    if (index === 0) return null
                    return (
                      <tr key={`box-${poId}-${sku}-${index}`}>
                        <td className='text-left'></td>
                        <td className='text-center'></td>
                        <td className='text-center py-4' style={{ minWidth: '60px' }}>
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
                        <td className='text-center'>
                          <div className='text-center flex flex-row justify-center items-center gap-0'>
                            {index + 1 === item.boxes.length && (
                              <Button type='button' size='sm' variant='ghost' className='btn-icon' onClick={() => addNewSingleSkuBoxConfiguration(poId, sku)}>
                                <i className='text-[19.5px] text-success las la-plus-circle m-0 p-0 w-auto' />
                              </Button>
                            )}

                            <Button type='button' size='sm' variant='ghost' className='btn-icon' onClick={() => removeSingleSkuBoxConfiguration(poId, sku, index)}>
                              <i className='text-danger text-[19.5px] las la-minus-circle m-0 p-0 w-auto' />
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

export default Edit_Receiving_Boxes_Single
