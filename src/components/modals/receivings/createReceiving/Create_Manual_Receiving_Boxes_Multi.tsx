import { useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { ManualAddSKUToMultiSKUBoxType, ManualMultiSkuBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsLocaleCompare } from '@lib/helperFunctions'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Collapse } from '@/components/ui/Collapse'
import { Label } from '@shadcn/ui/label'

/* eslint-disable @next/next/no-img-element */
type Props = {
  orderProducts: ReceivingInventory[]
  multiSkuPackages: ManualMultiSkuBoxes[]
  addNewMultiSkuBoxConfiguration: () => void
  removeMultiSkuBoxConfiguration: (index: number) => void
  addSkuToMultiSkuBox: (info: ManualAddSKUToMultiSKUBoxType) => void
  removeSkuFromMultiSkuBox: (index: number, sku: string) => void
  setMixedSkuBoxesUsingMasterBoxes: () => void
  clearMultiSkuBoxes: () => void
}

const Create_Manual_Receiving_Boxes_Multi = ({
  orderProducts,
  multiSkuPackages,
  setMixedSkuBoxesUsingMasterBoxes,
  addNewMultiSkuBoxConfiguration,
  removeMultiSkuBoxConfiguration,
  addSkuToMultiSkuBox,
  removeSkuFromMultiSkuBox,
  clearMultiSkuBoxes,
}: Props) => {
  const [allCollapse, setallCollapse] = useState(false)
  const [addSkuToBox, setaddSkuToBox] = useState({
    boxIndex: -1,
    sku: '',
    quantity: 0,
    receiving: 0,
    name: '',
    inventoryId: 0,
    image: '',
    boxQty: 0,
  })
  const [errorAddingSKU, seterrorAddingSKU] = useState<string | null>(null)

  const handleAddSkuToBox = () => {
    seterrorAddingSKU(null)
    const { boxIndex, sku, quantity, name, inventoryId, image, receiving, boxQty } = addSkuToBox
    if (boxIndex < 0 || !sku) {
      seterrorAddingSKU('Please select an SKU and a box.')
      return
    }

    if (quantity <= 0) {
      seterrorAddingSKU('Quantity must be greater than 0.')
      return
    }

    addSkuToMultiSkuBox({ boxIndex, sku, quantity, name, inventoryId, image, receiving, boxQty })
    setaddSkuToBox({
      boxIndex: -1,
      sku: '',
      quantity: 0,
      receiving: 0,
      name: '',
      inventoryId: 0,
      image: '',
      boxQty: 0,
    })
  }

  const toggleCollapse = () => {
    const collapseElements = document.querySelectorAll('.collapse-content')
    collapseElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.classList.toggle('show', !allCollapse)
      }
    })
    setallCollapse(!allCollapse)
  }

  return (
    <div className='flex flex-wrap -mx-3' key='mixed-skus'>
      <div className='px-3 md:w-4/12'>
        <div className='flex flex-row justify-between items-center gap-4 mb-2'>
          <p className='m-0 font-bold text-[16.25px]'>Receiving SKUs</p>
          <Button size='sm' variant='default' onClick={() => setMixedSkuBoxesUsingMasterBoxes()} className='text-[13px]'>
            Prefill Boxes
          </Button>
        </div>
        <div className='text-[11.2px] flex flex-col gap-2 py-2'>
          {orderProducts
            .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
            .map((item) => {
              const alreadyBoxed = multiSkuPackages.reduce((acc, box) => {
                if (!box[item.sku]) return acc
                return acc + box[item.sku].quantity
              }, 0)

              const pendingToBoxed = item.quantity - alreadyBoxed
              return (
                <div key={`${item.inventoryId}`} className='flex flex-row justify-between items-center gap-4 border rounded py-2 px-2'>
                  <div className='text-center'>
                    <div className='flex flex-row justify-start items-center gap-2'>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '40px',
                          height: '50px',
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
                        <p className='text-nowrap m-0 font-normal'>{item.name}</p>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={pendingToBoxed > 0 ? 'light' : pendingToBoxed < 0 ? 'destructive' : 'success'}
                    className={'rounded-sm text-center text-[11.2px] ' + (pendingToBoxed > 0 ? 'text-muted-foreground' : pendingToBoxed < 0 ? 'text-white' : 'text-white')}>
                    {pendingToBoxed}
                  </Badge>
                </div>
              )
            })}
        </div>
      </div>
      <div className='px-3 md:w-8/12'>
        <div className='mb-2 border-b pb-1'>
          <div className='flex flex-wrap -mx-3'>
            <p className='m-0 font-bold text-[16.25px]'>Add SKU to Box</p>
          </div>
          {/* ADD SKU TO BOX */}
          <div className='flex flex-wrap -mx-3 flex flex-row justify-around items-end gap-0'>
            <div className='px-3 md:w-4/12'>
              <SelectSingleFilter
                inputLabel='*Select SKU'
                inputName='select-sku-add-multi-sku'
                placeholder='Choose SKU'
                selected={(() => {
                  const item = orderProducts.find((item) => item.inventoryId === addSkuToBox.inventoryId)
                  return item ? { value: item.inventoryId, label: item.sku, description: item.name } : { value: '', label: 'Choose SKU...' }
                })()}
                options={(() => {
                  const skuList = [] as any[]
                  orderProducts
                    .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
                    .forEach((item) => {
                      const alreadyBoxed = multiSkuPackages.reduce((acc, box) => {
                        if (!box[item.sku]) return acc
                        return acc + box[item.sku].quantity
                      }, 0)
                      const pendingToBoxed = item.quantity - alreadyBoxed
                      if (pendingToBoxed <= 0) return null // Skip already boxed items
                      skuList.push({
                        value: item.inventoryId,
                        label: item.sku,
                        description: item.name,
                      })
                    })

                  return skuList
                })()}
                handleSelect={(option: SelectSingleValueType) => {
                  const item = orderProducts.find((item) => item.inventoryId === option?.value)!
                  setaddSkuToBox((prev) => ({
                    ...prev,
                    sku: item.sku,
                    name: item.title,
                    receiving: item.quantity,
                    inventoryId: item.inventoryId,
                    image: item.image!,
                    boxQty: item.boxQty,
                  }))
                }}
              />
            </div>
            <div className='px-3 md:w-4/12'>
              <SelectSingleFilter
                inputLabel='*Select Box'
                inputName='select-box-add-multi-sku'
                placeholder='Choose Box'
                selected={
                  multiSkuPackages
                    .map((_box, index) => {
                      return { value: index, label: `Box ${index + 1}` }
                    })
                    .find((_, index) => index === addSkuToBox.boxIndex) || { value: '', label: 'Choose Box...' }
                }
                options={[
                  { value: '', label: 'Choose Box...' },
                  ...multiSkuPackages.map((_box, index) => {
                    return { value: index, label: `Box ${index + 1}` }
                  }),
                ]}
                handleSelect={(option: SelectSingleValueType) => {
                  setaddSkuToBox((prev) => ({
                    ...prev,
                    boxIndex: option!.value as number,
                  }))
                }}
              />
            </div>
            <div className='px-3 md:w-2/12 mb-2'>
              <Label htmlFor={`add-sku-to-box-quantity`} className='mb-2 text-[11.2px]'>
                *Quantity
              </Label>
              <InputNumberForm
                inputName={`add-sku-to-box-quantity`}
                value={addSkuToBox.quantity}
                isInvalid={false}
                placeholder='Quantity'
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => setaddSkuToBox((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                handleBlur={() => {}}
              />
            </div>
            <div className='px-3 md:w-2/12 mb-2 flex flex-row justify-end items-end'>
              <Button size='sm' variant='default' onClick={() => handleAddSkuToBox()} className='text-[13px]'>
                Add To Box
              </Button>
            </div>
          </div>
          {errorAddingSKU && <p className='m-0 text-danger text-[11.2px]'>{errorAddingSKU}</p>}
        </div>

        {/* ADD BOX */}
        <div className='flex flex-row flex-wrap justify-between items-center gap-4 mb-4'>
          <p className='m-0 font-bold text-[16.25px]'>Boxes</p>

          <div className='flex flex-row justify-end items-center gap-2'>
            <Button size='sm' variant='light' onClick={() => toggleCollapse()} className='text-[13px]'>
              {allCollapse ? '- Collapse All' : '+ Expand All'}
            </Button>
            <Button size='sm' variant='success' onClick={() => addNewMultiSkuBoxConfiguration()} className='text-[13px]'>
              + Add New Box
            </Button>
            <Button size='sm' variant='light' onClick={() => clearMultiSkuBoxes()} className='text-[13px] flex flex-row justify-center items-center gap-1'>
              <i className='mdi mdi-trash-can-outline text-danger' /> All Boxes
            </Button>
          </div>
        </div>

        {/* BOXES LIST */}

        <div className='gap-2 flex flex-row flex-wrap justify-start items-start pb-2'>
          {multiSkuPackages.map((box, boxIndex) => (
            <div key={`boxed-${boxIndex}`} className='px-3 w-full md:w-5/12 border rounded p-2 text-[11.2px] shadow-sm bg-white'>
              <div className='flex flex-row justify-between items-center mb-1'>
                <div style={{ cursor: 'pointer' }} onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                  <p className='m-0 font-semibold text-[13px]'>Box {boxIndex + 1}</p>
                  <p className={'m-0 text-[11.2px] ' + (Object.entries(box).length === 0 ? 'text-danger' : 'text-muted-foreground')}>
                    {Object.entries(box).length} SKUs, {Object.values(box).reduce((acc, item) => acc + item.quantity, 0)} total units
                  </p>
                </div>
                <div className='flex flex-row justify-end items-center gap-2'>
                  <Button size='sm' variant='ghost' onClick={() => removeMultiSkuBoxConfiguration(boxIndex)} className='text-[11.2px] btn-icon'>
                    <i className='mdi mdi-trash-can-outline text-[16.25px]' />
                  </Button>
                  <Button size='sm' variant='ghost' className='text-[11.2px] btn-icon' onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                    <i className='mdi mdi-chevron-down text-[16.25px]' />
                  </Button>
                </div>
              </div>
              <Collapse isOpen={allCollapse} id={`box-${boxIndex}-content`} className='collapse-content'>
                <div className='flex flex-col justify-start items-start gap-1'>
                  {Object.entries(box).map(([sku, item]) => (
                    <div key={`boxed-${boxIndex}-${sku}`} className='w-full flex flex-row justify-between items-center gap-4 bg-light px-4 py-1 rounded'>
                      <div className='text-left'>
                        <p className='text-nowrap m-0 font-semibold'>{sku}</p>
                        <p className='text-nowrap m-0 text-muted-foreground'>Qty: {item.quantity}</p>
                      </div>
                      <Button size='sm' variant='ghost' onClick={() => removeSkuFromMultiSkuBox(boxIndex, sku)} className='text-[11.2px] btn-icon'>
                        <i className='mdi mdi-trash-can-outline text-[16.25px]' />
                      </Button>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Create_Manual_Receiving_Boxes_Multi
