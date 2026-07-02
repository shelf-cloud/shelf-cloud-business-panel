import { useState } from 'react'

import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import InputNumberForm from '@components/ui/forms/InputNumberForm'
import { ManualAddSKUToMultiSKUBoxType, ManualMultiSkuBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsLocaleCompare } from '@lib/helperFunctions'
import { Badge, Button, Col, Collapse, Label, Row } from '@/components/migration-ui'

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
    <Row key='mixed-skus'>
      <Col md={4}>
        <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4 tw:mb-2'>
          <p className='tw:m-0 tw:font-bold tw:text-[16.25px]'>Receiving SKUs</p>
          <Button size='sm' color='primary' onClick={() => setMixedSkuBoxesUsingMasterBoxes()} className='tw:text-[13px]'>
            Prefill Boxes
          </Button>
        </div>
        <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:gap-2 tw:py-2'>
          {orderProducts
            .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
            .map((item) => {
              const alreadyBoxed = multiSkuPackages.reduce((acc, box) => {
                if (!box[item.sku]) return acc
                return acc + box[item.sku].quantity
              }, 0)

              const pendingToBoxed = item.quantity - alreadyBoxed
              return (
                <div key={`${item.inventoryId}`} className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4 tw:border tw:rounded tw:py-2 tw:px-2'>
                  <div className='tw:text-center'>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
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
                      <div className='tw:text-left'>
                        <p className='tw:text-nowrap tw:m-0 tw:font-semibold'>{item.sku}</p>
                        <p className='tw:text-nowrap tw:m-0 tw:font-normal'>{item.name}</p>
                      </div>
                    </div>
                  </div>
                  <Badge
                    color={pendingToBoxed > 0 ? 'light' : pendingToBoxed < 0 ? 'danger' : 'success'}
                    className={'tw:text-center tw:text-[11.2px] ' + (pendingToBoxed > 0 ? 'tw:text-[var(--bs-secondary-color)]' : pendingToBoxed < 0 ? 'tw:text-white' : 'tw:text-white')}>
                    {pendingToBoxed}
                  </Badge>
                </div>
              )
            })}
        </div>
      </Col>
      <Col md={8}>
        <div className='tw:mb-2 tw:border-b tw:pb-1'>
          <Row>
            <p className='tw:m-0 tw:font-bold tw:text-[16.25px]'>Add SKU to Box</p>
          </Row>
          {/* ADD SKU TO BOX */}
          <Row className='tw:flex tw:flex-row tw:justify-around tw:items-end tw:gap-0'>
            <Col md={4}>
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
            </Col>
            <Col md={4}>
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
            </Col>
            <Col md={2} className='tw:mb-2'>
              <Label htmlFor={`add-sku-to-box-quantity`} className='form-label tw:text-[11.2px]'>
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
            </Col>
            <Col md={2} className='tw:mb-2 tw:flex tw:flex-row tw:justify-end tw:items-end'>
              <Button size='sm' color='primary' onClick={() => handleAddSkuToBox()} className='tw:text-[13px]'>
                Add To Box
              </Button>
            </Col>
          </Row>
          {errorAddingSKU && <p className='tw:m-0 tw:text-danger tw:text-[11.2px]'>{errorAddingSKU}</p>}
        </div>

        {/* ADD BOX */}
        <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-between tw:items-center tw:gap-4 tw:mb-4'>
          <p className='tw:m-0 tw:font-bold tw:text-[16.25px]'>Boxes</p>

          <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'>
            <Button size='sm' color='light' onClick={() => toggleCollapse()} className='tw:text-[13px]'>
              {allCollapse ? '- Collapse All' : '+ Expand All'}
            </Button>
            <Button size='sm' color='success' onClick={() => addNewMultiSkuBoxConfiguration()} className='tw:text-[13px]'>
              + Add New Box
            </Button>
            <Button size='sm' color='light' onClick={() => clearMultiSkuBoxes()} className='tw:text-[13px] tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-1'>
              <i className='mdi mdi-trash-can-outline tw:text-danger' /> All Boxes
            </Button>
          </div>
        </div>

        {/* BOXES LIST */}

        <div className='tw:gap-2 tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-start tw:pb-2'>
          {multiSkuPackages.map((box, boxIndex) => (
            <Col xs={12} md={5} key={`boxed-${boxIndex}`} className='tw:border tw:rounded tw:p-2 tw:text-[11.2px] tw:shadow-sm tw:bg-white'>
              <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:mb-1'>
                <div style={{ cursor: 'pointer' }} onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                  <p className='tw:m-0 tw:font-semibold tw:text-[13px]'>Box {boxIndex + 1}</p>
                  <p className={'tw:m-0 tw:text-[11.2px] ' + (Object.entries(box).length === 0 ? 'tw:text-danger' : 'tw:text-[var(--bs-secondary-color)]')}>
                    {Object.entries(box).length} SKUs, {Object.values(box).reduce((acc, item) => acc + item.quantity, 0)} total units
                  </p>
                </div>
                <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'>
                  <Button size='sm' color='ghost' onClick={() => removeMultiSkuBoxConfiguration(boxIndex)} className='tw:text-[11.2px] btn-icon'>
                    <i className='mdi mdi-trash-can-outline tw:text-[16.25px]' />
                  </Button>
                  <Button size='sm' color='ghost' className='tw:text-[11.2px] btn-icon' onClick={() => document.getElementById(`box-${boxIndex}-content`)?.classList.toggle('show')}>
                    <i className='mdi mdi-chevron-down tw:text-[16.25px]' />
                  </Button>
                </div>
              </div>
              <Collapse isOpen={allCollapse} id={`box-${boxIndex}-content`} className='collapse-content'>
                <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-1'>
                  {Object.entries(box).map(([sku, item]) => (
                    <div key={`boxed-${boxIndex}-${sku}`} className='tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4 tw:bg-light tw:px-4 tw:py-1 tw:rounded'>
                      <div className='tw:text-left'>
                        <p className='tw:text-nowrap tw:m-0 tw:font-semibold'>{sku}</p>
                        <p className='tw:text-nowrap tw:m-0 tw:text-[var(--bs-secondary-color)]'>Qty: {item.quantity}</p>
                      </div>
                      <Button size='sm' color='ghost' onClick={() => removeSkuFromMultiSkuBox(boxIndex, sku)} className='tw:text-[11.2px] btn-icon'>
                        <i className='mdi mdi-trash-can-outline tw:text-[16.25px]' />
                      </Button>
                    </div>
                  ))}
                </div>
              </Collapse>
            </Col>
          ))}
        </div>
      </Col>
    </Row>
  )
}

export default Create_Manual_Receiving_Boxes_Multi
